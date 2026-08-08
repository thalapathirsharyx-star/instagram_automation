import { Injectable } from '@nestjs/common';
import { sequence } from '@Database/Table/CRM/sequence';
import { sequence_step } from '@Database/Table/CRM/sequence_step';
import { sequence_enrollment } from '@Database/Table/CRM/sequence_enrollment';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { In } from 'typeorm';

@Injectable()
export class SequenceService {

  async listSequences(companyId: string) {
    return await sequence.find({
      where: { company_id: companyId },
      order: { created_on: 'DESC' }
    });
  }

  async getSequence(companyId: string, sequenceId: string) {
    const seq = await sequence.findOne({
      where: { id: sequenceId, company_id: companyId }
    });
    
    if (!seq) throw new Error('Sequence not found');

    const steps = await sequence_step.find({
      where: { sequence_id: sequenceId },
      order: { step_order: 'ASC' }
    });

    return { ...seq, steps };
  }

  async createSequence(companyId: string, data: any) {
    const seq = new sequence();
    seq.company_id = companyId;
    seq.name = data.name || 'New Sequence';
    seq.sequence_status = 'draft';
    seq.trigger_filters = data.trigger_filters || {};
    seq.created_by_id = '00000000-0000-0000-0000-000000000000';
    seq.created_on = new Date();
    await seq.save();

    if (data.steps && Array.isArray(data.steps)) {
      for (let i = 0; i < data.steps.length; i++) {
        const stepData = data.steps[i];
        const step = new sequence_step();
        step.sequence_id = seq.id;
        step.step_order = i + 1;
        step.step_type = stepData.step_type;
        step.config = stepData.config || {};
        step.created_by_id = '00000000-0000-0000-0000-000000000000';
        step.created_on = new Date();
        await step.save();
      }
    }

    return seq;
  }

  async updateSequence(companyId: string, sequenceId: string, data: any) {
    const seq = await sequence.findOne({ where: { id: sequenceId, company_id: companyId } });
    if (!seq) throw new Error('Sequence not found');

    if (data.name) seq.name = data.name;
    if (data.trigger_filters) seq.trigger_filters = data.trigger_filters;
    await seq.save();

    // Rebuild steps if provided
    if (data.steps && Array.isArray(data.steps)) {
      await sequence_step.delete({ sequence_id: seq.id });
      for (let i = 0; i < data.steps.length; i++) {
        const stepData = data.steps[i];
        const step = new sequence_step();
        step.sequence_id = seq.id;
        step.step_order = i + 1;
        step.step_type = stepData.step_type;
        step.config = stepData.config || {};
        step.created_by_id = '00000000-0000-0000-0000-000000000000';
        step.created_on = new Date();
        await step.save();
      }
    }
    return seq;
  }

  async deleteSequence(companyId: string, sequenceId: string) {
    const seq = await sequence.findOne({ where: { id: sequenceId, company_id: companyId } });
    if (!seq) throw new Error('Sequence not found');
    await seq.remove();
  }

  async activateSequence(companyId: string, sequenceId: string) {
    const seq = await sequence.findOne({ where: { id: sequenceId, company_id: companyId } });
    if (!seq) throw new Error('Sequence not found');
    
    seq.sequence_status = 'active';
    await seq.save();

    // Enroll matching leads automatically
    const where: any = { company_id: companyId };
    if (seq.trigger_filters?.lead_status?.length) {
      where.lead_status = In(seq.trigger_filters.lead_status);
    }
    
    const leads = await instagram_lead.find({ where });
    let enrolledCount = 0;
    
    for (const lead of leads) {
      // Check if already enrolled
      const existing = await sequence_enrollment.findOne({
        where: { sequence_id: seq.id, lead_id: lead.id }
      });

      if (!existing) {
        const enrollment = new sequence_enrollment();
        enrollment.sequence_id = seq.id;
        enrollment.lead_id = lead.id;
        enrollment.current_step_order = 1;
        enrollment.enrollment_status = 'active';
        enrollment.next_step_execution_time = new Date(); // Fire immediately
        enrollment.created_by_id = '00000000-0000-0000-0000-000000000000';
        enrollment.created_on = new Date();
        await enrollment.save();
        enrolledCount++;
      }
    }

    seq.total_enrolled += enrolledCount;
    await seq.save();

    return { activated: true, new_enrollments: enrolledCount };
  }
}
