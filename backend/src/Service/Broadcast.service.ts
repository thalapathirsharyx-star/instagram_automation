import { Injectable } from '@nestjs/common';
import { broadcast } from '@Database/Table/CRM/broadcast';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { In } from 'typeorm';
import axios from 'axios';

@Injectable()
export class BroadcastService {

  /**
   * List all broadcasts for a company
   */
  async listBroadcasts(companyId: string) {
    return await broadcast.find({
      where: { company_id: companyId },
      order: { created_on: 'DESC' }
    });
  }

  /**
   * Get a single broadcast by ID
   */
  async getBroadcast(companyId: string, broadcastId: string) {
    return await broadcast.findOne({
      where: { id: broadcastId, company_id: companyId }
    });
  }

  /**
   * Create a new broadcast (draft)
   */
  async createBroadcast(companyId: string, data: {
    name: string;
    message: string;
    filters?: any;
    scheduled_at?: string;
  }) {
    const bc = new broadcast();
    bc.company_id = companyId;
    bc.name = data.name;
    bc.message = data.message;
    bc.filters = data.filters || {};
    bc.broadcast_status = data.scheduled_at ? 'scheduled' : 'draft';
    bc.scheduled_at = data.scheduled_at ? new Date(data.scheduled_at) : null;
    bc.created_by_id = '00000000-0000-0000-0000-000000000000';
    bc.created_on = new Date();
    await bc.save();
    return bc;
  }

  /**
   * Update a draft broadcast
   */
  async updateBroadcast(companyId: string, broadcastId: string, data: any) {
    const bc = await broadcast.findOne({ where: { id: broadcastId, company_id: companyId } });
    if (!bc) throw new Error('Broadcast not found');
    if (bc.broadcast_status !== 'draft' && bc.broadcast_status !== 'scheduled') {
      throw new Error('Cannot edit a broadcast that has already been sent');
    }

    if (data.name) bc.name = data.name;
    if (data.message) bc.message = data.message;
    if (data.filters !== undefined) bc.filters = data.filters;
    if (data.scheduled_at !== undefined) {
      bc.scheduled_at = data.scheduled_at ? new Date(data.scheduled_at) : null;
      bc.broadcast_status = data.scheduled_at ? 'scheduled' : 'draft';
    }
    await bc.save();
    return bc;
  }

  /**
   * Delete a broadcast
   */
  async deleteBroadcast(companyId: string, broadcastId: string) {
    const bc = await broadcast.findOne({ where: { id: broadcastId, company_id: companyId } });
    if (!bc) throw new Error('Broadcast not found');
    await bc.remove();
  }

  /**
   * Get audience count (preview how many leads match filters)
   */
  async getAudienceCount(companyId: string, filters: any): Promise<number> {
    const where: any = { company_id: companyId };

    if (filters?.lead_status?.length) {
      where.lead_status = In(filters.lead_status);
    }
    if (filters?.is_qualified !== undefined && filters.is_qualified !== null) {
      where.is_qualified = filters.is_qualified;
    }

    const leads = await instagram_lead.find({ where });

    // Further filter by tags if provided
    if (filters?.tags?.length) {
      return leads.filter(l =>
        l.tags && filters.tags.some((t: string) => l.tags.includes(t))
      ).length;
    }

    return leads.length;
  }

  /**
   * Send broadcast immediately
   */
  async sendBroadcast(companyId: string, broadcastId: string) {
    const bc = await broadcast.findOne({ where: { id: broadcastId, company_id: companyId } });
    if (!bc) throw new Error('Broadcast not found');

    const company = await CompanyTable.findOne({ where: { id: companyId } });
    if (!company?.instagram_access_token) {
      throw new Error('Instagram not connected. Please connect your account first.');
    }

    // Build audience query
    const where: any = { company_id: companyId };
    if (bc.filters?.lead_status?.length) {
      where.lead_status = In(bc.filters.lead_status);
    }
    if (bc.filters?.is_qualified !== undefined && bc.filters.is_qualified !== null) {
      where.is_qualified = bc.filters.is_qualified;
    }

    let leads = await instagram_lead.find({ where });

    // Filter by tags
    if (bc.filters?.tags?.length) {
      leads = leads.filter(l =>
        l.tags && bc.filters.tags.some((t: string) => l.tags.includes(t))
      );
    }

    bc.broadcast_status = 'sending';
    bc.total_recipients = leads.length;
    bc.sent_count = 0;
    bc.failed_count = 0;
    bc.sent_at = new Date();
    await bc.save();

    // Send messages asynchronously (fire-and-forget per message)
    this.processBroadcastSending(bc, leads, company.instagram_access_token, companyId);

    return {
      broadcast_id: bc.id,
      total_recipients: leads.length,
      status: 'sending'
    };
  }

  /**
   * Process sending messages to all leads (runs in background)
   */
  private async processBroadcastSending(
    bc: broadcast,
    leads: instagram_lead[],
    accessToken: string,
    companyId: string
  ) {
    let sentCount = 0;
    let failedCount = 0;

    for (const lead of leads) {
      try {
        // Send the Instagram DM
        await axios.post(
          `https://graph.facebook.com/v21.0/me/messages`,
          {
            recipient: { id: lead.instagram_handle },
            message: { text: bc.message }
          },
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        // Log the outbound message
        const msg = new instagram_message();
        msg.lead_id = lead.id;
        msg.message_text = bc.message;
        msg.direction = 'Outbound';
        msg.action_taken = `BROADCAST: ${bc.name}`;
        msg.created_by_id = '00000000-0000-0000-0000-000000000000';
        msg.created_on = new Date();
        msg.company_id = companyId;
        await msg.save();

        sentCount++;

        // Small delay to avoid rate limiting (Instagram API limit: ~200/hour)
        await this.delay(500);
      } catch (error: any) {
        console.error(`[BROADCAST] Failed to send to ${lead.instagram_handle}:`, error?.response?.data || error.message);
        failedCount++;
      }

      // Update progress periodically
      if ((sentCount + failedCount) % 10 === 0 || (sentCount + failedCount) === leads.length) {
        bc.sent_count = sentCount;
        bc.failed_count = failedCount;
        await bc.save();
      }
    }

    // Final update
    bc.sent_count = sentCount;
    bc.failed_count = failedCount;
    bc.broadcast_status = failedCount === leads.length ? 'failed' : 'completed';
    await bc.save();

    console.log(`[BROADCAST COMPLETE] "${bc.name}" - Sent: ${sentCount}, Failed: ${failedCount}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
