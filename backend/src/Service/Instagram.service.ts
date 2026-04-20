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
      console.log(`[NEW LEAD] Creating record for: ${context.instagram_handle}`);
      
      // Attempt to fetch real name from Instagram Profile
      const realProfile = await this.fetchUserProfile(context.instagram_handle);
      
      lead = new instagram_lead();
      lead.customer_name = realProfile?.name || context.customer_name;
      lead.instagram_handle = context.instagram_handle;
      lead.lead_status = 'New';
      lead.created_by_id = SYSTEM_ID;
      lead.created_on = new Date();
      await lead.save();
      
      console.log(`[LEAD CREATED] Name: ${lead.customer_name} | Handle: ${lead.instagram_handle}`);
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

    // 5. Decision Logic - Step 2: AI Smart Reply (Powered by LLM)
    const chatHistory = await this.getMessagesByLead(lead.id);
    const historyStrings = chatHistory.slice(-10).map(msg => `${msg.direction === 'Inbound' ? 'Customer' : 'Assistant'}: ${msg.message_text}`);

    const aiResponse = await this.generateAiReply(context.message_text, historyStrings);
    const score = aiResponse.lead_score || 0;
    
    let nextStatus = lead.lead_status;
    if (score >= 70) {
      nextStatus = 'Hot';
    } else if (score >= 30) {
      nextStatus = 'Buyer';
    }

    const response: InstagramActionResponse = {
      action: aiResponse.action,
      reply: aiResponse.reply,
      status_update: nextStatus as 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human',
      notes: `Intent: ${aiResponse.intent} | Score: ${score} | Entities: ${JSON.stringify(aiResponse.entities || {})}`,
    };

    if (nextStatus !== lead.lead_status) {
      lead.lead_status = nextStatus;
      await lead.save();
    }

    await this.logOutboundMessage(lead, response);

    // Only send the reply if it's an automated one
    if (response.reply && response.action !== 'HUMAN_HANDOFF') {
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

  private async generateAiReply(messageText: string, history: string[]): Promise<any> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.warn('[AI] No GEMINI_API_KEY found, falling back to basic response.');
      return { 
        reply: "Thanks for reaching out! A human agent will be with you shortly.", 
        intent: "general_inquiry",
        lead_score: 10,
        action: "followup",
        entities: {}
      };
    }

    const businessType = 'clothing'; // Mock or load from config
    const goal = 'sell_products';
    const tone = 'friendly and professional';
    const language = 'english';

    const systemPrompt = `You are a dynamic AI assistant inside a CRM system.
You handle customer conversations for multiple types of businesses (e.g., clothing, real estate, clinics, services).

Your behavior MUST adapt based on the provided business configuration.

---

### INPUT CONTEXT:

Business Profile:
* business_type: ${businessType}
* business_goal: ${goal}
* tone: ${tone}
* language: ${language}

Product / Service Data:
We offer custom and premium apparel.

Custom Rules:
Be polite and helpful.

---

### YOUR OBJECTIVES:
1. Understand customer intent
2. Extract useful information
3. Qualify the lead
4. Respond like a human sales agent
5. Move the conversation toward the business goal

---

### STEP 1: DETECT INTENT
Classify the message into the most relevant intent depending on business_type.
Examples:
For "clothing": product_inquiry, price_check, size_check, color_check, purchase_intent
If unclear -> use "general_inquiry"

---

### STEP 2: EXTRACT ENTITIES
Extract relevant structured data based on business_type:
For clothing: product_name, size, color, quantity
Return null if not found.

---

### STEP 3: LEAD SCORING (0-100)
Score based on buying intent:
* low intent (greeting, browsing) -> 5-30
* medium intent (questions, interest) -> 30-70
* high intent (ready to act) -> 70-95

---

### STEP 4: DECIDE NEXT ACTION
Based on business_goal:
IF goal = sell_products: Guide toward purchase. Ask size, confirm product, move to order.

---

### STEP 5: GENERATE RESPONSE
Rules:
* Keep response short (1-3 lines)
* Sound human, not robotic
* Use tone provided
* Ask at most ONE follow-up question
* Use available context_data (product/service info)
* If data missing -> ask instead of assuming

---

### STEP 6: OUTPUT FORMAT (STRICT JSON)
{
"intent": "...",
"lead_score": 0,
"entities": {
"key": "value"
},
"reply": "...",
"action": "none" | "lead" | "order" | "book" | "followup"
}

---

### ACTION RULES:
* lead_score >= 70 -> "lead"
* purchase intent -> "order"
* missing info -> "followup"
* otherwise -> "none"

---

### IMPORTANT RULES:
* Adapt behavior based on business_type
* Do NOT assume missing data
* Do NOT generate long responses
* Always prioritize clarity and conversion
* Use chat history to avoid repeating questions
* If user already provided info, do not ask again`;

    const userMessage = `Customer Message:\n${messageText}\n\nChat History:\n${history.join('\n')}`;

    try {
      console.log(`[AI] Generating reply for message: "${messageText}"`);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          system_instruction: {
            parts: { text: systemPrompt }
          },
          contents: [
            {
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const responseContent = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(responseContent);
    } catch (e) {
      console.error("[AI] Gemini API error", e.response?.data || e.message);
      return { 
        reply: "I'm having a little trouble connecting to my network. Give me a moment please.", 
        intent: "error",
        lead_score: 10,
        action: "none",
        entities: {}
      };
    }
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

  /**
   * Fetches the real name of an Instagram user using their ID.
   * Requires 'instagram_basic' permission and a Page Access Token.
   */
  private async fetchUserProfile(instagramId: string): Promise<{ name: string } | null> {
    const rawToken = (process.env.IG_PAGE_ACCESS_TOKEN || '').trim();
    if (!rawToken || instagramId === 'FETCH_PENDING') return null;

    try {
      console.log(`[PROFILE_FETCH] Attempting to get name for: ${instagramId}`);
      
      const response = await axios.get(`https://graph.facebook.com/v21.0/${instagramId}`, {
        params: {
          fields: 'name',
          access_token: rawToken
        }
      });

      if (response.data && response.data.name) {
        console.log(`[PROFILE_FETCH] Found real name: ${response.data.name}`);
        return { name: response.data.name };
      }
    } catch (err) {
      const apiError = err.response?.data?.error;
      console.warn(`[PROFILE_FETCH_FAILED] Could not get real name for ${instagramId}. Falling back to default.`);
      console.warn(`Error: ${apiError?.message || err.message}`);
      
      if (apiError?.code === 10 || apiError?.code === 200) {
        console.warn('NOTE: This often happens in Development Mode or if "instagram_basic" permission is not yet approved.');
      }
    }
    return null;
  }
}
