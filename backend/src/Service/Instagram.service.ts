import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';

export interface InstagramMessageContext {
  customer_name: string;
  instagram_handle: string;
  message_text: string;
  conversation_history: string[];
  tags: string[];
  lead_status: string;
  last_message_time: Date;
  product_context: any;
  auto_reply_settings: any;
}

export interface InstagramActionResponse {
  action: 'AUTO_KEYWORD_REPLY' | 'AI_REPLY' | 'HUMAN_HANDOFF' | 'FOLLOW_UP' | 'TRACKING_UPDATE';
  reply: string;
  status_update: 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human';
  tags?: string[];
  notes: string;
}

@Injectable()
export class InstagramService {
  
  async processIncomingMessage(context: InstagramMessageContext): Promise<InstagramActionResponse> {
    // 1. Get or Create Lead
    let lead = await instagram_lead.findOne({ where: { instagram_handle: context.instagram_handle } });
    if (!lead) {
      lead = new instagram_lead();
      lead.customer_name = context.customer_name;
      lead.instagram_handle = context.instagram_handle;
      lead.lead_status = 'New';
      lead.created_on = new Date();
      await lead.save();
    }

    // 2. Log Inbound Message
    const inboundMsg = new instagram_message();
    inboundMsg.lead_id = lead.id;
    inboundMsg.message_text = context.message_text;
    inboundMsg.direction = 'Inbound';
    inboundMsg.created_on = new Date();
    await inboundMsg.save();

    // 3. Decision Logic - Step 1: Keyword Matching
    const keywordMatch = this.checkKeywords(context.message_text);
    if (keywordMatch) {
      const response = {
        action: 'AUTO_KEYWORD_REPLY' as const,
        reply: keywordMatch.reply.replace('{name}', context.customer_name),
        status_update: lead.lead_status as any,
        notes: `Matched keyword: ${keywordMatch.keyword}`,
      };
      await this.logOutboundMessage(lead, response);
      return response;
    }

    // 4. Decision Logic - Step 3: Human Handoff (checking for complaints/anger)
    if (this.isNeedsHuman(context.message_text)) {
      const response = {
        action: 'HUMAN_HANDOFF' as const,
        reply: '',
        status_update: 'Needs_Human' as const,
        notes: 'Detected complaint or technical query requiring human intervention',
      };
      lead.lead_status = 'Needs_Human';
      await lead.save();
      return response;
    }

    // 5. Decision Logic - Step 2: AI Smart Reply (Mocked for now)
    const aiResponse = this.generateMockAiReply(context.message_text);
    const response = {
      action: 'AI_REPLY' as const,
      reply: aiResponse.reply,
      status_update: aiResponse.intent === 'buying' ? 'Hot' : (lead.lead_status as any),
      notes: 'Generated AI Smart Reply (Mocked)',
    };
    
    if (aiResponse.intent === 'buying') {
      lead.lead_status = 'Hot';
      await lead.save();
    }

    await this.logOutboundMessage(lead, response);
    return response;
  }

  private checkKeywords(text: string) {
    const keywords = [
      { keyword: 'price', reply: 'Hi {name}, the price for this item is $99. Would you like to order?' },
      { keyword: 'available', reply: 'Yes, it is currently in stock! How many would you like?' },
      { keyword: 'location', reply: 'We are located in Los Angeles, but we ship nationwide! 🚚' },
    ];

    const found = keywords.find(k => text.toLowerCase().includes(k.keyword));
    return found;
  }

  private isNeedsHuman(text: string): boolean {
    const triggers = ['refund', 'angry', 'complaint', 'manager', 'stole', 'broken'];
    return triggers.some(t => text.toLowerCase().includes(t));
  }

  private generateMockAiReply(text: string) {
    if (text.toLowerCase().includes('want') || text.toLowerCase().includes('buy')) {
      return { reply: 'That sounds great! I can help you with your order. Which size are you looking for?', intent: 'buying' };
    }
    return { reply: 'Thanks for reaching out! Let me know if you have any other questions. 🙂', intent: 'neutral' };
  }

  private async logOutboundMessage(lead: instagram_lead, response: InstagramActionResponse) {
    const outboundMsg = new instagram_message();
    outboundMsg.lead_id = lead.id;
    outboundMsg.message_text = response.reply;
    outboundMsg.direction = 'Outbound';
    outboundMsg.action_taken = response.action;
    outboundMsg.ai_notes = response.notes;
    outboundMsg.created_on = new Date();
    await outboundMsg.save();

    lead.last_message_time = new Date();
    await lead.save();
  }

  async getAllLeads() {
    return await instagram_lead.find({ order: { last_message_time: 'DESC' } });
  }

  async getMessagesByLead(leadId: string) {
    return await instagram_message.find({
      where: { lead_id: leadId },
      order: { created_on: 'ASC' }
    });
  }
}
