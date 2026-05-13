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
      const titleWords = normalize(item.title).split(' ').filter(w => w !== 'pdf' && w !== 'docx' && w !== 'txt');
      if (titleWords.length === 0) continue;

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
        lead.lead_status = 'Hot'; // Ensure they are marked as Hot lead
        lead.lead_score = 10;
        await lead.save();

        await this.logOutboundMessage(lead, directResponse as any);
        await this.sendInstagramMessage(lead.instagram_handle, directResponse.reply, company?.instagram_access_token);
        return directResponse;
      }
    }

    // 3. Preprocess Message
    const normalizedMessage = context.message_text.toLowerCase().trim();

    // 4. Rule-Based Scoring
    let rule_score = 0;
    const leadRules = company?.lead_rules || { 
      keywords: ['price', 'size', 'available', 'buy', 'order', 'cost', 'shipping', 'delivery', 'stock'], 
      score_threshold: 3 
    };
    
    for (const kw of leadRules.keywords || []) {
      if (normalizedMessage.includes(kw.toLowerCase())) {
        if (kw.toLowerCase() === 'book' || kw.toLowerCase() === 'appointment') rule_score += 3;
        else rule_score += 2;
      }
    }

    // 5. Dynamic AI Classification
    const aiResponse = await this.generateAiReply(context.message_text, lead, companyId);

    if (aiResponse.reply) {
      // 6. Combine Logic (Decision Engine)
      const ai_confidence = parseFloat(aiResponse.confidence) || 0;
      const final_score = Math.min(10, rule_score + (ai_confidence * 7)); // Boost AI influence on score
      const threshold = leadRules.score_threshold || 3;

      const isLead = final_score >= threshold || aiResponse.lead === 'yes';

      // 7. Update User State
      lead.lead_score = final_score;
      if (isLead) {
        lead.lead_status = 'Hot';
        lead.is_qualified = true;
      }
      
      if (aiResponse.tags) lead.tags = aiResponse.tags;
      if (aiResponse.notes) lead.notes = (lead.notes ? lead.notes + '\n' : '') + aiResponse.notes;
      if (aiResponse.summary) lead.conversation_summary = aiResponse.summary;
      if (aiResponse.intent) lead.last_intent = aiResponse.intent;
      await lead.save();

      // 8. Trigger Actions
      if (isLead) {
        console.log(`[LEAD DETECTED] Score: ${final_score}. Intent: ${aiResponse.intent}. Notifying CRM/Business...`);
        // Notification logic would go here
      } else {
        console.log(`[NOT LEAD] Score: ${final_score}. Continuing auto-reply...`);
      }

      // 9. Smart Auto-Reply
      await this.logOutboundMessage(lead, aiResponse);
      await this.sendInstagramMessage(lead.instagram_handle, aiResponse.reply, company?.instagram_access_token);
    }

    return aiResponse;
  }

  private async generateAiReply(messageText: string, lead: instagram_lead, companyId: string): Promise<any> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const context = await this.getRelevantContext(messageText, companyId);

    const history = await this.getMessagesByLead(lead.id, lead.company_id);
    const historyText = history.slice(-25).map(m => `${m.direction}: ${m.message_text}`).join('\n');
    
    const previousIntelligence = `
Previous Summary: ${lead.conversation_summary || 'None'}
Previous Tags: ${(lead.tags || []).join(', ')}
`;

    const company = await CompanyTable.findOne({ where: { id: companyId } });

    const profile = company?.business_profile || { 
      type: 'clothing brand', 
      goal: 'sales and inquiries', 
      lead_definition: 'customer who is interested in products, asking about price, size, availability, or wanting to purchase' 
    };
    const rules = company?.lead_rules || { 
      keywords: ['price', 'size', 'available', 'buy', 'order', 'cost', 'shipping', 'delivery', 'stock'], 
      intent_types: ['purchase', 'enquiry', 'support', 'casual'] 
    };

    const defaultPrompt = `
You are Maya, a warm and polite sales assistant and lead classifier for a \${profile.type.toUpperCase()} business.
You genuinely care about helping customers find the right product or service.

Business goal: \${profile.goal}
Lead definition: \${profile.lead_definition}
Keywords: \${rules.keywords.join(', ')}

═══════════════════════════════
KNOWLEDGE BASE (Product Info)
═══════════════════════════════
\${context}

═══════════════════════════════
PREVIOUS INTELLIGENCE (Context Memory)
═══════════════════════════════
\${previousIntelligence}

═══════════════════════════════
CHAT HISTORY (Recent)
═══════════════════════════════
\${historyText}

═══════════════════════════════
CUSTOMER'S MESSAGE
═══════════════════════════════
"\${messageText}"

═══════════════════════════════
LEAD QUALIFICATION RULES
═══════════════════════════════
- Mark "lead": "yes" if the customer shows clear interest in any product mentioned in the KNOWLEDGE BASE.
- If they ask about price, sizing, fabric, material, or availability of an item, they ARE a lead.
- If they express intent to visit the store, book an appointment, or ask "how to order", they ARE a lead.
- If they are just saying "hi", "thanks", "ok", or "cool", they are NOT a lead yet.
- When in doubt if it's a product inquiry, prefer marking "lead": "yes" to ensure follow-up.
- SUMMARY RULE: Your summary must be CUMULATIVE. Don't forget earlier topics. If they asked about shirts 10 mins ago and now pants, the summary must mention BOTH.

═══════════════════════════════
LANGUAGE RULES (CRITICAL)
═══════════════════════════════
- Detect the language of the customer's last message and reply in the SAME language.
- Tamil script (e.g. "என்ன விலை?") → reply politely in Tamil script.
- Tanglish (e.g. "anna price sollunga") → reply warmly in Tanglish, respectful tone.
- English → reply in polite, friendly English.
- Never switch language unless the customer does first.

═══════════════════════════════
OUTPUT FORMAT (JSON ONLY)
═══════════════════════════════
Return ONLY valid JSON. No extra text outside it.

{
  "reply": "smart auto-reply based on intent (enquiry -> info from KB, purchase -> how to buy, casual -> greeting)",
  "action": "reply",
  "lead": "yes/no",
  "intent": "\${rules.intent_types.join('/')}",
  "summary": "2-3 sentence overview of what the customer wants and current status. Mandatory even for greetings.",
  "confidence": 0.0 to 1.0,
  "detected_language": "english" | "tamil" | "tanglish",
  "tags": ["interested", "pricing", "size_query", "support"]
}
`;

    let customPrompt = company?.system_prompt || defaultPrompt;

    // Always append strict perspective rule to prevent echoing bugs even if they use a custom prompt
    if (company?.system_prompt) {
      customPrompt += `\n\nCRITICAL RULE: Respond ONLY in valid JSON format.
Include these fields:
- "reply": your response to the customer
- "lead": "yes" or "no"
- "intent": "purchase/enquiry/support/casual"
- "confidence": 0.0 to 1.0
- "summary": a 2-3 sentence summary of the discussion so far
- "tags": array of interest tags`;
    }

    // Replace placeholders in custom prompt
    const prompt = customPrompt
      .replace(/\${context}/g, context)
      .replace(/\${previousIntelligence}/g, previousIntelligence)
      .replace(/\${historyText}/g, historyText)
      .replace(/\${messageText}/g, messageText)
      .replace(/\${profile.type.toUpperCase\(\)}/g, profile.type ? profile.type.toUpperCase() : 'BUSINESS')
      .replace(/\${profile.goal}/g, profile.goal || '')
      .replace(/\${profile.lead_definition}/g, profile.lead_definition || '')
      .replace(/\${rules.keywords.join\(\', \'\)}/g, rules.keywords ? rules.keywords.join(', ') : '')
      .replace(/\${rules.intent_types.join\(\'\/\'\)}/g, rules.intent_types ? rules.intent_types.join('/') : '');

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
      const isLead = aiData.lead === 'yes' || aiData.lead === true || aiData.is_qualified === true || aiData.lead_status === 'Hot';

      return {
        reply: aiData.reply || aiData.message || aiData.text || "I'll check on that for you!",
        action: aiData.action || 'reply',
        notes: aiData.notes || aiData.summary || '',
        lead_status: isLead ? 'Hot' : 'New',
        is_qualified: isLead,
        tags: aiData.tags || [],
        intent: aiData.intent || 'enquiry',
        confidence: aiData.confidence || 0,
        lead: isLead ? 'yes' : 'no',
        summary: aiData.summary || aiData.notes || ''
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
      
      // Rank knowledge items by relevance
      const scoredItems = kbRepo.map(item => {
        let score = 0;
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();
        
        // Priority 1: Title match
        if (query.includes(title) || title.includes(query)) score += 20;
        
        // Priority 2: Keyword matches (supporting non-English characters)
        const queryWords = query.split(/[\s,.;:!?]+/).filter(w => w.length >= 2);
        for (const word of queryWords) {
          if (content.includes(word)) score += 5;
          if (title.includes(word)) score += 10;
          // Bonus for price-related numbers if query contains them
          if (/\d+/.test(word) && content.includes(word)) score += 15;
        }

        return { item, score };
      });

      const relevant = scoredItems
        .filter(si => si.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(si => si.item);

      if (relevant.length > 0) {
        console.log(`[CONTEXT] Found ${relevant.length} relevant items for query: ${query}`);
        // Combine content but limit to avoid token bloat
        let combined = '';
        for (const item of relevant) {
          const entry = `[Document: ${item.title}]\n${item.content}\n\n`;
          if ((combined + entry).length < 8000) {
            combined += entry;
          } else break;
        }
        return combined;
      }

      // Fallback: Return the most recent items if no direct match found
      console.log(`[CONTEXT] No direct match for "${query}". Returning fallback context.`);
      return kbRepo.slice(0, 5).map(i => `[${i.title}]: ${i.content.slice(0, 1000)}`).join('\n');
    } catch (err) {
      console.error('[CONTEXT ERROR]', err);
      return "General business information.";
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
