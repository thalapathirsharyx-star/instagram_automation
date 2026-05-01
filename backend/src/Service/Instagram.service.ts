import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { InstagramMessageContext, InstagramActionResponse } from '@Model/Instagram.model';
import { InstagramGateway } from '../Gateway/Instagram.gateway';
import axios from 'axios';

@Injectable()
export class InstagramService {
  private processedMids = new Set<string>();
  private readonly CACHE_LIMIT = 500;

  constructor(private readonly instagramGateway: InstagramGateway) { }

  /**
   * Automatically connects an Instagram account using a user access token.
   */
  async linkInstagramAccount(companyId: string, userToken: string) {
    console.log(`[CONNECT] Linking Instagram for Company: ${companyId}`);

    const APP_ID = process.env.FB_APP_ID;
    const APP_SECRET = process.env.FB_APP_SECRET;

    if (!APP_ID || !APP_SECRET) {
      throw new Error('PLATFORM_CONFIG_MISSING: The server is not configured with a Meta App ID/Secret.');
    }

    try {
      let exchangeRes = await axios.get(`https://graph.facebook.com/v21.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: userToken
        }
      });

      const longLivedUserToken = exchangeRes.data.access_token;

      const pagesRes = await axios.get(`https://graph.facebook.com/v21.0/me/accounts`, {
        params: {
          fields: 'name,access_token,instagram_business_account',
          access_token: longLivedUserToken
        }
      });

      const pages = pagesRes.data.data;
      const targetPage = pages.find((p: any) => p.instagram_business_account);

      if (!targetPage) {
        throw new Error('META_NO_INSTAGRAM_LINKED: No Instagram Business Account linked to any of your Facebook Pages.');
      }

      const igBusinessId = targetPage.instagram_business_account.id;
      const pageAccessToken = targetPage.access_token;
      const pageId = targetPage.id;

      const company = await CompanyTable.findOne({ where: { id: companyId } });
      if (!company) throw new Error('Company not found');

      company.instagram_business_id = igBusinessId;
      company.instagram_page_id = pageId;
      company.instagram_access_token = pageAccessToken;
      company.instagram_username = targetPage.name; // Save the name too!
      await company.save();

      await axios.post(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, {
        subscribed_fields: ['messages', 'messaging_postbacks'],
        access_token: pageAccessToken
      });

      return {
        Success: true,
        Data: {
          business_id: igBusinessId,
          page_name: targetPage.name
        }
      };

    } catch (error) {
      console.error('[CONNECT FAILED]', error);
      throw error;
    }
  }

  async processIncomingMessage(input: InstagramMessageContext | string, text?: string, messageId?: string, igBusinessId?: string, skipDedupe = false): Promise<InstagramActionResponse | void> {
    if (messageId && this.processedMids.has(messageId) && !skipDedupe) {
      return;
    }
    if (messageId) this.processedMids.add(messageId);

    // If the controller couldn't provide a sender ID/text (e.g. message_edit), we fetch it now
    if (typeof input === 'string' && input === 'FETCH_PENDING' && messageId) {
      console.log(`[RESOLVE] Fetching real content for MID: ${messageId}`);
      const company = await CompanyTable.findOne({ where: { instagram_business_id: igBusinessId } });
      const details = await this.fetchMessageDetails(messageId, company?.instagram_access_token);

      if (details && details.from) {
        // If the sender ID matches the Page's Business ID, it's an echo of our own message.
        if (details.from.id === igBusinessId) {
          console.log(`[RESOLVE] Skipping echo message (Page's own message) for MID: ${messageId}`);
          return;
        }

        input = details.from.id;
        text = details.message;
        console.log(`[RESOLVE] Success! Sender: ${input}, Text: "${text}"`);
      } else {
        console.error(`[RESOLVE] Failed to resolve message details for MID: ${messageId}`);
        return;
      }
    }

    let context: InstagramMessageContext;
    if (typeof input === 'string') {
      const company = await CompanyTable.findOne({ where: { instagram_business_id: igBusinessId } });
      const companyId = company?.id;

      context = {
        instagram_handle: input,
        customer_name: 'Customer',
        message_text: text || '',
        company_id: companyId,
        last_message_time: new Date(),
        product_context: [],
        conversation_history: [],
        tags: [],
        lead_status: 'New',
        auto_reply_settings: { is_enabled: true, min_delay_ms: 1000, max_delay_ms: 3000, allow_ai_override: true }
      };
    } else {
      context = input;
    }

    const company = await CompanyTable.findOne({ where: { instagram_business_id: igBusinessId } });
    const companyId = company?.id;

    let lead = await instagram_lead.findOne({ where: { instagram_handle: context.instagram_handle, company_id: companyId } });

    if (!lead) {
      lead = new instagram_lead();
      lead.company_id = companyId;
      lead.instagram_handle = context.instagram_handle;
      lead.customer_name = `User_${context.instagram_handle.slice(-4)}`;
      lead.lead_status = 'New';

      try {
        const profileRes = await axios.get(`https://graph.facebook.com/v21.0/${context.instagram_handle}?fields=name,profile_pic&access_token=${company?.instagram_access_token}`);
        if (profileRes.data.name) lead.customer_name = profileRes.data.name;
      } catch (e: any) {
        console.error('[IG PROFILE ERROR] Could not fetch profile details:', e.message);
      }

      lead.created_by_id = '00000000-0000-0000-0000-000000000000';
      lead.created_on = new Date();
      await lead.save();

      // Send Welcome Message if configured
      if (company?.welcome_message) {
        await this.sendInstagramMessage(lead.instagram_handle, company.welcome_message, company.instagram_access_token);
        await this.logOutboundMessage(lead, { reply: company.welcome_message, action: 'welcome' } as any);
      }
    }

    const inboundMsg = new instagram_message();
    inboundMsg.lead_id = lead.id;
    inboundMsg.message_text = context.message_text;
    inboundMsg.direction = 'Inbound';
    inboundMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
    inboundMsg.created_on = new Date();
    inboundMsg.company_id = companyId;
    await inboundMsg.save();

    this.instagramGateway.emitNewMessage({ ...inboundMsg, lead });

    // 1. Check for Direct FAQ Match (Fuzzy Word Match)
    const knowledgeItems = await knowledge_base.find({ where: { company_id: companyId } });
    console.log(`[FAQ DEBUG] Checking ${knowledgeItems.length} items in Brain Base for company ${companyId}`);

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryWords = normalize(context.message_text).split(' ');
    console.log(`[FAQ DEBUG] Normalized Query Words: ${JSON.stringify(queryWords)}`);

    for (const item of knowledgeItems) {
      const titleWords = normalize(item.title).split(' ');
      // Check if ALL words in the FAQ title exist in the user's message (fuzzy)
      const matchCount = titleWords.filter(tw => queryWords.some(qw => qw.includes(tw) || tw.includes(qw))).length;
      const matchPercentage = matchCount / titleWords.length;

      console.log(`[FAQ DEBUG] Comparing with "${item.title}" | Match: ${matchCount}/${titleWords.length} (${Math.round(matchPercentage * 100)}%)`);

      if (matchPercentage >= 0.8) { // 80% word match
        console.log(`[FAQ MATCH] Found fuzzy match: ${item.title}`);
        const directResponse: any = {
          reply: item.content,
          action: 'faq',
          status_update: 'Qualified',
          notes: `Matched FAQ: ${item.title}`
        };

        // Promote to lead if they match an FAQ
        lead.is_qualified = true;
        await lead.save();

        await this.logOutboundMessage(lead, directResponse as any);
        await this.sendInstagramMessage(lead.instagram_handle, directResponse.reply, company?.instagram_access_token);
        return directResponse;
      }
    }

    // 2. Fallback to AI if no direct match
    const aiResponse = await this.generateAiReply(context.message_text, lead, companyId);

    if (aiResponse.reply) {
      // Update Lead metadata if AI suggests changes
      if (aiResponse.lead_status) lead.lead_status = aiResponse.lead_status;
      // Only set to true, never back to false once qualified
      if (aiResponse.is_qualified === true) lead.is_qualified = true;
      if (aiResponse.tags) lead.tags = aiResponse.tags;
      if (aiResponse.notes) lead.notes = (lead.notes ? lead.notes + '\n' : '') + aiResponse.notes;
      await lead.save();

      await this.logOutboundMessage(lead, aiResponse);
      await this.sendInstagramMessage(lead.instagram_handle, aiResponse.reply, company?.instagram_access_token);
    }

    return aiResponse;
  }

  private async generateAiReply(messageText: string, lead: instagram_lead, companyId: string): Promise<any> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const context = await this.getRelevantContext(messageText, companyId);

    const history = await this.getMessagesByLead(lead.id, lead.company_id);
    const historyText = history.slice(-10).map(m => `${m.direction}: ${m.message_text}`).join('\n');

    const company = await CompanyTable.findOne({ where: { id: companyId } });

    const defaultPrompt = `
You are Maya, a warm and polite sales assistant for a clothing brand.
You genuinely care about helping customers find the right product.
You speak naturally in English, Tamil, and Tanglish.

═══════════════════════════════
KNOWLEDGE BASE
═══════════════════════════════
\${context}

═══════════════════════════════
CHAT HISTORY
═══════════════════════════════
\${historyText}

═══════════════════════════════
CUSTOMER'S MESSAGE
═══════════════════════════════
"\${messageText}"

═══════════════════════════════
LANGUAGE RULES (CRITICAL)
═══════════════════════════════
- Detect the language of the customer's last message and reply in the SAME language.
- Tamil script (e.g. "என்ன விலை?") → reply politely in Tamil script.
- Tanglish (e.g. "anna price sollunga") → reply warmly in Tanglish, respectful tone.
- English → reply in polite, friendly English.
- Never switch language unless the customer does first.

Polite Tanglish examples to match:
  Customer: "anna price evlo?"
  Maya: "Anna, ithu RM89 thaan 😊 Romba nalla quality, worth it irukku. Ungalukku enna size venum?"

  Customer: "akka ithu nalla iruka?"
  Maya: "Aama akka, ithu customers-ku romba pidikkum! Ungalukku suit aagum pola irukku. Oru size try pannalama? 🙏"

  Customer: "என்ன விலை?"
  Maya: "விலை RM89 மட்டுமே 😊 தரமான தயாரிப்பு, மதிப்புக்கு ஏற்றது. உங்களுக்கு என்ன அளவு வேண்டும்?"

═══════════════════════════════
POLITENESS RULES
═══════════════════════════════
- Always address the customer respectfully (anna / akka / sir / madam as appropriate).
- Never pressure or rush the customer.
- If they seem unsure, gently reassure them.
- If they have a complaint, acknowledge it kindly before responding.
- End every reply with a warm, soft question to keep the conversation going.
- Use "please", "thank you", "of course" naturally in English replies.

═══════════════════════════════
LEAD QUALIFICATION RULES
═══════════════════════════════
- Hot   → asks price, size, payment, delivery or says "venum / I want / order"
- Warm  → curious, asking product questions, comparing options
- New   → first message, no clear signal yet
- Cold  → very short replies, low engagement
- Buyer → confirmed order or completed payment
- Lost  → said not interested, too expensive, or gone silent

═══════════════════════════════
BEHAVIOR RULES
═══════════════════════════════
1. Answer only from the knowledge base. Never guess or make up product details.
2. If something is not in the knowledge base, say warmly:
3. Keep replies short and warm — 2 to 3 sentences is ideal.
4. Use 1 or 2 emojis naturally — never overdo it.
5. Always close with a gentle next step (size? color? shall I reserve one for you?).
6. NEVER echo the user's statement back to them as your own. If the user says "I want a shirt", you MUST reply as the store (e.g. "We have great shirts!"). Do NOT say "I want a shirt".
7. Be extremely careful in Tanglish to not use words like "ennakku" (to me) when describing the customer's needs. Use "ungalukku" (to you) instead.

═══════════════════════════════
OUTPUT FORMAT (JSON ONLY)
═══════════════════════════════
Return ONLY valid JSON. No extra text outside it.

{
  "reply": "your polite message to the customer",
  "action": "reply",
  "detected_language": "english" | "tamil" | "tanglish",
  "lead_status": "New" | "Hot" | "Warm" | "Cold" | "Buyer" | "Lost",
  "is_qualified": true | false,
  "tags": ["interested", "pricing", "size_query", "support", "tamil_speaker", ...],
  "notes": "1-line CRM summary in English, regardless of chat language"
}
`;

    let customPrompt = company?.system_prompt || defaultPrompt;

    // Always append strict perspective rule to prevent echoing bugs even if they use a custom prompt
    if (company?.system_prompt) {
      customPrompt += `\n\nCRITICAL RULE: Never echo the user's request from your own perspective. Respond as the store. Use "we" and "you" (or "ungalukku" in Tanglish). Never say "I want" if the user wants something. Return ONLY valid JSON format.`;
    }

    // Replace placeholders in custom prompt
    const prompt = customPrompt
      .replace(/\${context}/g, context)
      .replace(/\${historyText}/g, historyText)
      .replace(/\${messageText}/g, messageText);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: messageText }
          ],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiData = JSON.parse(response.data.choices[0].message.content);
      return {
        reply: aiData.reply || aiData.message || aiData.text || "I'll check on that for you!",
        action: aiData.action || 'reply',
        notes: aiData.notes || ''
      };
    } catch (error: any) {
      console.error('[AI ERROR] Groq failed:', error.response?.data || error.message);
      return { reply: "I'll check on that for you!", action: 'human_required' };
    }
  }

  private async getRelevantContext(messageText: string, companyId: string): Promise<string> {
    try {
      const kbRepo = await knowledge_base.find({ where: { company_id: companyId } });
      if (!kbRepo || kbRepo.length === 0) return "No specific data provided.";

      const query = messageText.toLowerCase();
      const relevant = kbRepo.filter(item =>
        query.includes(item.title.toLowerCase()) ||
        query.split(' ').some(w => w.length > 3 && item.content.toLowerCase().includes(w))
      );

      return relevant.length > 0
        ? relevant.map(i => `${i.title}: ${i.content}`).join('\n')
        : kbRepo.slice(0, 2).map(i => `${i.title}: ${i.content}`).join('\n');
    } catch (err) {
      return "Clothing brand info.";
    }
  }

  private async fetchUserProfile(instagramId: string, token: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/v21.0/${instagramId}`, {
        params: { fields: 'name', access_token: token }
      });
      return res.data;
    } catch (e) {
      return null;
    }
  }

  private async fetchMessageDetails(mid: string, token: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/v21.0/${mid}`, {
        params: { fields: 'from,message', access_token: token }
      });
      return res.data;
    } catch (e: any) {
      console.error('[IG FETCH ERROR] Failed to fetch message details:', e.response?.data || e.message);
      return null;
    }
  }

  private async logOutboundMessage(lead: instagram_lead, response: InstagramActionResponse) {
    const outboundMsg = new instagram_message();
    outboundMsg.lead_id = lead.id;
    outboundMsg.message_text = response.reply;
    outboundMsg.direction = 'Outbound';
    outboundMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
    outboundMsg.created_on = new Date();
    outboundMsg.company_id = lead.company_id;
    await outboundMsg.save();

    // Notify the UI via WebSocket
    this.instagramGateway.emitNewMessage({ ...outboundMsg, lead });

    lead.last_message_time = new Date();
    await lead.save();
  }

  async getAllLeads(companyId: string, isQualified?: boolean) {
    const where: any = { company_id: companyId as any };
    if (isQualified === true) where.is_qualified = true;
    if (isQualified === false) where.is_qualified = false;
    // If undefined, we don't add the filter, showing all leads.

    return await instagram_lead.find({
      where,
      order: { last_message_time: 'DESC' }
    });
  }

  async getMessagesByLead(leadId: string, companyId?: string) {
    return await instagram_message.find({
      where: { lead_id: leadId, company_id: companyId },
      order: { created_on: 'ASC' }
    });
  }

  private async sendInstagramMessage(recipientId: string, text: string, token: string) {
    try {
      const url = `https://graph.facebook.com/v21.0/me/messages`;
      await axios.post(url, { recipient: { id: recipientId }, message: { text } }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error: any) {
      console.error('[IG ERROR] Message failed to send:', error.response?.data || error.message);
    }
  }

  async getKnowledgeBase(companyId: string) {
    return await knowledge_base.find({ where: { company_id: companyId }, order: { created_on: 'DESC' } });
  }

  async createKnowledgeItem(companyId: string, data: any) {
    const item = new knowledge_base();
    item.company_id = companyId;
    item.title = data.title;
    item.content = data.content;
    item.category = data.category || 'General';
    item.created_by_id = '00000000-0000-0000-0000-000000000000';
    item.created_on = new Date();
    await item.save();
    return { Success: true, Data: item };
  }

  async deleteKnowledgeItem(companyId: string, id: string) {
    const item = await knowledge_base.findOne({ where: { id, company_id: companyId } });
    if (!item) throw new Error('Knowledge item not found');
    await item.remove();
    return { Success: true };
  }

  async uploadKnowledgeFile(companyId: string, file: any) {
    let content = '';
    const fileName = file.originalname;

    if (fileName.endsWith('.pdf')) {
      const pdfModule = require('pdf-parse');

      try {
        // Support for modern pdf-parse (v2.x) class-based API
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({
            data: file.buffer,
            verbosity: 0
          });
          await parser.load();
          const result = await parser.getText();
          content = result.text;
        }
        // Support for classic pdf-parse (v1.x) function-based API
        else {
          const parseFunction = typeof pdfModule === 'function' ? pdfModule : pdfModule.default;
          if (typeof parseFunction === 'function') {
            const data = await parseFunction(file.buffer);
            content = data.text;
          } else {
            throw new Error('PDF parsing library structure is unrecognized.');
          }
        }
      } catch (e: any) {
        console.error('[PDF PARSE ERROR]', e.message);
        throw new Error(`Failed to parse PDF: ${e.message}`);
      }
    } else if (fileName.endsWith('.txt')) {
      content = file.buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file format. Please upload PDF or TXT.');
    }

    if (!content.trim()) throw new Error('File is empty.');

    const item = new knowledge_base();
    item.company_id = companyId;
    item.title = fileName;
    item.content = content.trim();
    item.category = 'Document';
    item.created_by_id = '00000000-0000-0000-0000-000000000000';
    item.created_on = new Date();
    await item.save();

    return { Success: true, Data: item };
  }

  async updateWelcomeMessage(companyId: string, message: string) {
    const company = await CompanyTable.findOneBy({ id: companyId as any });
    if (!company) throw new Error('Company not found');
    company.welcome_message = message;
    await company.save();
    return { Success: true };
  }

  async getIntegrationSettings(companyId: string) {
    const company = await CompanyTable.findOneBy({ id: companyId as any });
    return {
      Success: true,
      Data: {
        isConnected: !!company?.instagram_business_id,
        business_id: company?.instagram_business_id,
        page_name: company?.instagram_username || 'Connected Account',
        welcome_message: company?.welcome_message
      }
    };
  }

  async updateIntegrationSettings(companyId: string, data: any) {
    const company = await CompanyTable.findOneBy({ id: companyId as any });
    if (!company) throw new Error('Company not found');
    if (data.welcome_message !== undefined) company.welcome_message = data.welcome_message;
    await company.save();
    return { Success: true };
  }

  async getWalletBalance(companyId: string) {
    const company = await CompanyTable.findOneBy({ id: companyId as any });
    return company?.wallet_balance || 0;
  }

  async getPrompt(companyId: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    return { prompt: company?.system_prompt || '' };
  }

  async updatePrompt(companyId: string, prompt: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (company) {
      company.system_prompt = prompt;
      await company.save();
    }
    return { success: true };
  }
}
