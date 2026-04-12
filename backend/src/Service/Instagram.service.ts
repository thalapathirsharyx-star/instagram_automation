import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { InstagramMessageContext, InstagramActionResponse } from '@Model/Instagram.model';
import { InstagramGateway } from '../Gateway/Instagram.gateway';
import axios from 'axios';

@Injectable()
export class InstagramService {
  
  constructor(private readonly instagramGateway: InstagramGateway) {}

  async processIncomingMessage(input: InstagramMessageContext | string, text?: string, messageId?: string): Promise<InstagramActionResponse | void> {
    let context: InstagramMessageContext;

    if (typeof input === 'string') {
      let messageText = text;
      let senderId = input;

      // Fallback: If text or sender is missing, fetch full details from Meta
      if ((!messageText || senderId === 'FETCH_PENDING') && messageId) {
        try {
          const response = await axios.get(`https://graph.facebook.com/v25.0/${messageId}`, {
            params: {
              fields: 'text,from',
              access_token: process.env.IG_PAGE_ACCESS_TOKEN?.trim()
            }
          });
          
          if (!messageText) messageText = response.data.text;
          if (senderId === 'FETCH_PENDING') senderId = response.data.from?.id;
          
          console.log(`Deep Match Success! Text: "${messageText}", Sender: ${senderId}`);
        } catch (error) {
          console.error('Deep Match Failed:', error.response?.data || error.message);
        }
      }

      if (!messageText || !senderId || senderId === 'FETCH_PENDING') {
        console.log('Skipping message: Missing critical data after recovery attempt.');
        return;
      }

      context = {
        customer_name: 'IG User',
        instagram_handle: senderId,
        message_text: messageText,
        conversation_history: [],
        tags: [],
        lead_status: 'New',
        last_message_time: new Date(),
        product_context: [],
        auto_reply_settings: {
          is_enabled: true,
          min_delay_ms: 1000,
          max_delay_ms: 3000,
          allow_ai_override: true
        }
      };
    } else {
      context = input;
    }

    // 1. Get or Create Lead
    const SYSTEM_ID = '00000000-0000-0000-0000-000000000000';
    let lead = await instagram_lead.findOne({ where: { instagram_handle: context.instagram_handle } });
    if (!lead) {
      lead = new instagram_lead();
      lead.customer_name = context.customer_name;
      lead.instagram_handle = context.instagram_handle;
      lead.lead_status = 'New';
      lead.created_by_id = SYSTEM_ID;
      lead.created_on = new Date();
      await lead.save();
    }

    // 2. Log Inbound Message
    const inboundMsg = new instagram_message();
    inboundMsg.lead_id = lead.id;
    inboundMsg.message_text = context.message_text;
    inboundMsg.direction = 'Inbound';
    inboundMsg.created_by_id = SYSTEM_ID;
    inboundMsg.created_on = new Date();
    await inboundMsg.save();

    // Notify real-time clients
    this.instagramGateway.emitNewMessage({ ...inboundMsg, lead });

    // 2.5 Deduct credits (example: $0.10 per message)
    const company = await this.getCompany(); // Placeholder for actual company lookup
    if (company && company.wallet_balance > 0) {
      company.wallet_balance = Number(company.wallet_balance) - 0.10;
      await company.save();
      this.instagramGateway.emitBalanceUpdate(company.wallet_balance);
    }

    // 3. Decision Logic - Step 1: Keyword Matching
    const keywordMatch = this.checkKeywords(context.message_text);
    if (keywordMatch) {
      const response: InstagramActionResponse = {
        action: 'AUTO_KEYWORD_REPLY',
        reply: keywordMatch.reply.replace('{name}', context.customer_name),
        status_update: lead.lead_status as 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human',
        notes: `Matched keyword: ${keywordMatch.keyword}`,
      };
      await this.logOutboundMessage(lead, response);
      await this.sendInstagramMessage(lead.instagram_handle, response.reply);
      return response;
    }

    // 4. Decision Logic - Step 3: Human Handoff (checking for complaints/anger)
    if (this.isNeedsHuman(context.message_text)) {
      const response: InstagramActionResponse = {
        action: 'HUMAN_HANDOFF',
        reply: '',
        status_update: 'Needs_Human',
        notes: 'Detected complaint or technical query requiring human intervention',
      };
      lead.lead_status = 'Needs_Human';
      await lead.save();
      return response;
    }

    // 5. Decision Logic - Step 2: AI Smart Reply (Mocked for now)
    const aiResponse = this.generateMockAiReply(context.message_text);
    const response: InstagramActionResponse = {
      action: 'AI_REPLY',
      reply: aiResponse.reply,
      status_update: aiResponse.intent === 'buying' ? 'Hot' : (lead.lead_status as 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human'),
      notes: 'Generated AI Smart Reply (Mocked)',
    };
    
    if (aiResponse.intent === 'buying') {
      lead.lead_status = 'Hot';
      await lead.save();
    }

    await this.logOutboundMessage(lead, response);
    
    // Only send the reply if it's an automated one
    if (response.action === 'AI_REPLY' || response.action === 'AUTO_KEYWORD_REPLY') {
      await this.sendInstagramMessage(lead.instagram_handle, response.reply);
    }

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
    outboundMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
    outboundMsg.created_on = new Date();
    await outboundMsg.save();

    // Notify real-time clients
    this.instagramGateway.emitNewMessage({ ...outboundMsg, lead });

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


  private async sendInstagramMessage(recipientId: string, text: string) {
    // This token should be in environment variables
    const PAGE_ACCESS_TOKEN = process.env['IG_PAGE_ACCESS_TOKEN']?.trim() || 'YOUR_ACCESS_TOKEN_HERE';
    const url = `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

    try {
      console.log(`Pushed reply to Instagram API for recipient: ${recipientId}`);
      // In a real scenario, uncomment the block below:
      /*
      await axios.post(url, {
        recipient: { id: recipientId },
        message: { text: text }
      });
      */
    } catch (error) {
      console.error('Failed to send Instagram message:', error);
    }
  }

  async getWalletBalance() {
    const companyData = await this.getCompany();
    return companyData?.wallet_balance || 0;
  }

  private async getCompany() {
    return await CompanyTable.findOne({ where: {} }); // For now, just gets the first company
  }
}
