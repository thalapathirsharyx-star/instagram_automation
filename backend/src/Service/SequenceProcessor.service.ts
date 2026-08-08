import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThanOrEqual } from 'typeorm';
import { sequence_enrollment } from '../Database/Table/CRM/sequence_enrollment';
import { sequence_step } from '../Database/Table/CRM/sequence_step';
import { company as CompanyTable } from '../Database/Table/Admin/company';
import { instagram_message } from '../Database/Table/CRM/instagram_message';
import axios from 'axios';

@Injectable()
export class SequenceProcessorService {
  private readonly logger = new Logger(SequenceProcessorService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // This job runs every 60 seconds to process any delayed sequence steps
    const pendingEnrollments = await sequence_enrollment.find({
      where: {
        enrollment_status: 'active',
        next_step_execution_time: LessThanOrEqual(new Date()),
      },
      relations: ['lead', 'sequence'],
    });

    if (pendingEnrollments.length > 0) {
      this.logger.log(`[SEQUENCE ENGINE] Processing ${pendingEnrollments.length} pending sequence enrollments...`);
    }

    for (const enrollment of pendingEnrollments) {
      try {
        await this.processEnrollment(enrollment);
      } catch (error: any) {
        this.logger.error(`[SEQUENCE ENGINE] Failed to process enrollment ${enrollment.id}: ${error.message}`);
      }
    }
  }

  private async processEnrollment(enrollment: sequence_enrollment) {
    // 1. Fetch the exact block/step the lead is currently on
    const step = await sequence_step.findOne({
      where: {
        sequence_id: enrollment.sequence_id,
        step_order: enrollment.current_step_order,
      },
    });

    if (!step) {
      // If there are no more steps, the sequence is complete!
      enrollment.enrollment_status = 'completed';
      await enrollment.save();
      this.logger.log(`[SEQUENCE ENGINE] Enrollment ${enrollment.id} completed.`);
      return;
    }

    // 2. Execute logic based on the step type
    if (step.step_type === 'MESSAGE') {
      const messageText = step.config?.message_text || '';
      
      const lead = enrollment.lead;
      if (lead && lead.instagram_handle) {
        // Fetch company to get access token
        const company = await CompanyTable.findOne({ where: { id: enrollment.sequence?.company_id } });
        if (company?.instagram_access_token) {
           try {
              this.logger.log(`[SEQUENCE ENGINE] Sending DM to ${lead.instagram_username || lead.instagram_handle}: "${messageText}"`);
              await axios.post(
                `https://graph.facebook.com/v21.0/me/messages`,
                {
                  recipient: { id: lead.instagram_handle },
                  message: { text: messageText }
                },
                {
                  headers: { 'Authorization': `Bearer ${company.instagram_access_token}` }
                }
              );

              // Log outbound message
              const msg = new instagram_message();
              msg.lead_id = lead.id;
              msg.message_text = messageText;
              msg.direction = 'Outbound';
              msg.action_taken = `SEQUENCE: ${enrollment.sequence?.name}`;
              msg.created_by_id = '00000000-0000-0000-0000-000000000000';
              msg.created_on = new Date();
              msg.company_id = company.id;
              await msg.save();
           } catch (err: any) {
             this.logger.error(`[SEQUENCE ENGINE] DM failed for ${lead.instagram_handle}: ${err?.response?.data?.error?.message || err.message}`);
             // If we fail, we still advance so we don't get stuck in an infinite retry loop for now
           }
        }
      }

      // Move to the next step immediately
      enrollment.current_step_order += 1;
      enrollment.next_step_execution_time = new Date(); // Execute next step on next cron tick

    } else if (step.step_type === 'DELAY') {
      const delayHours = step.config?.delay_hours || 24;
      
      // Calculate future execution time
      const nextTime = new Date();
      nextTime.setHours(nextTime.getHours() + delayHours);
      
      this.logger.log(`[SEQUENCE ENGINE] Pausing sequence for ${delayHours} hours for ${enrollment.lead?.instagram_username || enrollment.lead?.instagram_handle}`);
      
      enrollment.current_step_order += 1;
      enrollment.next_step_execution_time = nextTime;

    } else if (step.step_type === 'CONDITION') {
      // Check condition (e.g., did they reply?)
      // TODO: Implement actual message checking logic
      this.logger.log(`[SEQUENCE ENGINE] Evaluating condition for ${enrollment.lead?.instagram_username || enrollment.lead?.instagram_handle}`);
      enrollment.current_step_order += 1;
      enrollment.next_step_execution_time = new Date();
    }

    // 3. Save progress
    await enrollment.save();
  }
}
