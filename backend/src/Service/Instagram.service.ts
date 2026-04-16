import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { InstagramMessageContext, InstagramActionResponse } from '@Model/Instagram.model';
import { InstagramGateway } from '../Gateway/Instagram.gateway';
import axios from 'axios';

@Injectable()
export class InstagramService {
  // Simple in-memory cache to prevent duplicate processing of the same message
  private processedMids = new Set<string>();
  private readonly CACHE_LIMIT = 500;

  constructor(private readonly instagramGateway: InstagramGateway) { }

  async processIncomingMessage(input: InstagramMessageContext | string, text?: string, messageId?: string, igBusinessId?: string, skipDedupe = false): Promise<InstagramActionResponse | void> {
    // Deduplication check - only skip if not an internal recursive call
    if (!skipDedupe && messageId && this.processedMids.has(messageId)) {
      console.log(`[SKIP] Duplicate message detected. MID: ${messageId}`);
      return;
    }

    // Track this message ID
    if (messageId) {
      if (this.processedMids.size >= this.CACHE_LIMIT) {
        // Clear old entries to prevent memory leak
        const iterator = this.processedMids.values();
        for (let i = 0; i < 100; i++) this.processedMids.delete(iterator.next().value);
      }
      this.processedMids.add(messageId);
    }
    let context: InstagramMessageContext;

    if (typeof input === 'string') {
      const messageText = text;
      const senderId = input;

      // If called with FETCH_PENDING (from a message_edit event), attempt to retrieve
      // the message content from the Graph API using the correct Instagram field names.
      if (senderId === 'FETCH_PENDING' && messageId) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const rawToken = (process.env.IG_PAGE_ACCESS_TOKEN || '').trim();
          
          // Mask token for safe logging
          const maskedToken = rawToken.length > 10 
            ? `${rawToken.substring(0, 6)}...${rawToken.substring(rawToken.length - 4)}`
            : 'INVALID_TOKEN_LENGTH';
          
          console.log(`[FETCH] Executing message content fetch. MID: ${messageId} | Token: ${maskedToken}`);

          let response;
          const fetchParams = {
            fields: 'id,message,from,created_time'
          };
          const fetchHeaders = {
            'Authorization': `Bearer ${rawToken}`
          };

          // Diagnostic: Facebook Page Tokens for Instagram DMs MUST start with EAA... 
          // and be 'Page' type. User tokens (even with correct scopes) often fail fetching.
          if (rawToken.startsWith('EAANk')) {
             console.log('[DIAGNOSTIC] Token starts with EAANk... (Likely a User Token). If fetch fails, please switch to a PAGE token.');
          }

          // Retry logic for Code 1 (Transient Meta errors / Privacy blocks)
          let retries = 2;
          let lastError = null;
          
          while (retries >= 0) {
            try {
              // graph.facebook.com is the only host that works for Page-linked Instagram DMs
              response = await axios.get(`https://graph.facebook.com/v21.0/${messageId}`, {
                params: fetchParams,
                headers: fetchHeaders
              });
              lastError = null;
              break; 
            } catch (err) {
              lastError = err.response?.data?.error;
              if (lastError?.code === 1 && retries > 0) {
                console.warn(`[FETCH RETRY] Meta Code 1 (Unknown Error). Retrying... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                retries--;
              } else {
                break;
              }
            }
          }

          if (lastError) {
            console.error('[FETCH FAILED] Meta rejected the request.');
            console.error(`Error Code: ${lastError.code} | Message: ${lastError.message}`);
            
            if (lastError.code === 1) {
              console.error('--- IMPORTANT ACTION REQUIRED ---');
              console.error('1. Ensure "Allow Access to Messages" is ON in your Instagram App settings.');
              console.error('2. Ensure you are using a PAGE Access Token (starts with EAA...) from the Graph API Explorer dropdown.');
              console.error('---------------------------------');
            }
            return;
          }

          const msgData = response.data;
          const content = msgData.message;
          const actualSenderId = msgData.from?.id;

          // CRITICAL: Filter out messages sent by the bot/page itself to prevent loops
          if (actualSenderId === igBusinessId) {
            console.log(`[SKIP] Ignoring message sent by the bot itself (ID: ${actualSenderId})`);
            return;
          }
          
          if (content) {
            console.log(`[FETCH SUCCESS] Received content: "${content}" from ${actualSenderId}`);
            // Pass skipDedupe = true so we don't get blocked by our own cache
            return await this.processIncomingMessage(actualSenderId, content, messageId, igBusinessId, true);
          } else {
            console.error('[FETCH FAILED] Response received but no message content found:', JSON.stringify(msgData));
          }
        } catch (err) {
          const apiError = err.response?.data?.error;
          console.error('[FETCH ERROR]', JSON.stringify(apiError || err.message));

          if (apiError?.code === 10 || apiError?.code === 230 || apiError?.code === 298) {
            console.error('[PERMISSION ERROR] Missing scope: instagram_manage_messages or account linking issue.');
          }
        }
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
    const PAGE_ACCESS_TOKEN = (process.env['IG_PAGE_ACCESS_TOKEN'] || '').trim();
    // Using v21.0 to match our successful fetch endpoint
    const url = `https://graph.facebook.com/v21.0/me/messages`;

    try {
      console.log(`[REPLY] Sending response to: ${recipientId}`);
      await axios.post(url, {
        recipient: { id: recipientId },
        message: { text: text }
      }, {
        headers: { 'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}` }
      });
      console.log(`[REPLY SUCCESS] Message sent to ${recipientId}`);
    } catch (error) {
      console.error('[REPLY FAILED] Meta rejected the outbound message:', JSON.stringify(error.response?.data?.error || error.message));
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
