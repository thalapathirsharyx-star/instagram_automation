import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { comment_trigger } from '@Database/Table/CRM/comment_trigger';
import { InstagramMessageContext, InstagramActionResponse } from '@Model/Instagram.model';
import { InstagramGateway } from '../Gateway/Instagram.gateway';
import axios from 'axios';
import { PLAN_LIMITS } from '@Config/PlanLimits';
import { MoreThan } from 'typeorm';

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
      console.log('[DEBUG IG CONNECT] Pages returned by Meta:', JSON.stringify(pages, null, 2));
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

      try {
        await axios.post(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, {
          subscribed_fields: ['messages', 'messaging_postbacks'],
          access_token: pageAccessToken
        });
      } catch (err: any) {
        console.warn('[WEBHOOK SUBSCRIBE WARNING] Could not auto-subscribe page to webhooks (often requires pages_messaging). This is usually fine if configured in the Meta Dashboard:', err.message);
      }

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

  async disconnectInstagramAccount(companyId: string) {
    console.log(`[DISCONNECT] Unlinking Instagram for Company: ${companyId}`);
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (!company) throw new Error('Company not found');
    
    // Unsubscribe the app from the Facebook Page webhooks
    if (company.instagram_page_id && company.instagram_access_token) {
      try {
        await axios.delete(`https://graph.facebook.com/v21.0/${company.instagram_page_id}/subscribed_apps`, {
          params: { access_token: company.instagram_access_token }
        });
      } catch (err: any) {
        console.warn('[DISCONNECT] Could not unsubscribe from webhooks:', err.message);
      }
    }

    company.instagram_business_id = null as any;
    company.instagram_page_id = null as any;
    company.instagram_access_token = null as any;
    company.instagram_username = null as any;
    await company.save();
    
    return { Success: true };
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

    if (company) {
      // 1. Expiration Check
      if (company.plan !== 'Free' && company.plan_expires_at && new Date() > new Date(company.plan_expires_at)) {
        console.log(`[BILLING] Company ${companyId} plan expired. Downgrading to Free.`);
        company.plan = 'Free';
        company.plan_expires_at = null;
        await CompanyTable.update(companyId, { plan: 'Free', plan_expires_at: null });
      }

      // 2. AI Usage Check
      const currentPlan = company.plan || 'Free';
      const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
      
      if (company.monthly_ai_usage >= limits.aiMessagesLimit) {
        console.warn(`[LIMIT EXCEEDED] Company ${companyId} hit AI usage limit of ${limits.aiMessagesLimit}`);
        if (company.instagram_access_token) {
          await this.sendInstagramMessage(
            context.instagram_handle,
            "Automated AI responses are temporarily offline due to usage limits.",
            company.instagram_access_token
          );
        }
        return;
      }
    }

    let lead = await instagram_lead.findOne({ where: { instagram_handle: context.instagram_handle, company_id: companyId } });

    if (!lead) {
      // Check Active Contacts Limit
      const currentPlan = company?.plan || 'Free';
      const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const activeContactsCount = await instagram_lead.count({
        where: {
          company_id: companyId,
          created_on: MoreThan(startOfMonth)
        }
      });

      if (activeContactsCount >= limits.activeContactsLimit) {
        console.warn(`[LIMIT EXCEEDED] Company ${companyId} has reached the active contact limit of ${limits.activeContactsLimit} for the '${currentPlan}' plan.`);
        if (company?.instagram_access_token) {
          await this.sendInstagramMessage(
            context.instagram_handle,
            "Automated responses are temporarily offline due to channel capacity limits.",
            company.instagram_access_token
          );
        }
        return;
      }

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
        let textToSend = company.welcome_message;
        const limits = PLAN_LIMITS[company?.plan || 'Free'] || PLAN_LIMITS.Free;
        if (limits.hasBranding) {
          textToSend += "\n\n⚡ Powered by ReplyZens";
        }
        await this.sendInstagramMessage(lead.instagram_handle, textToSend, company.instagram_access_token);
        await this.logOutboundMessage(lead, { reply: textToSend, action: 'welcome' } as any);
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

    // Handle Image Messages (Simple Approach)
    if (context.message_text.startsWith('[IMAGE]')) {
      const currentPlan = company?.plan || 'Free';
      const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
      let replyText = "I received your image! Let me connect you with a human to check it.";
      if (limits.hasBranding) {
        replyText += "\n\n⚡ Powered by ReplyZens";
      }
      const handoffResponse: any = {
        reply: replyText,
        action: 'human_required',
        status_update: 'Handoff',
        notes: 'User sent an image'
      };

      lead.lead_status = 'Handoff';
      await lead.save();

      await this.logOutboundMessage(lead, handoffResponse as any);
      await this.sendInstagramMessage(lead.instagram_handle, handoffResponse.reply, company?.instagram_access_token);
      return handoffResponse;
    }

    // 1. Check for Direct FAQ Match (Fuzzy Word Match)
    const knowledgeItems = await knowledge_base.find({ where: { company_id: companyId } });
    console.log(`[FAQ DEBUG] Checking ${knowledgeItems.length} items in Brain Base for company ${companyId}`);

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryWords = normalize(context.message_text).split(' ');
    console.log(`[FAQ DEBUG] Normalized Query Words: ${JSON.stringify(queryWords)}`);

    for (const item of knowledgeItems) {
      const titleWords = normalize(item.title).split(' ').filter(w => w !== 'pdf' && w !== 'docx' && w !== 'txt' && w !== 'faq');
      if (titleWords.length === 0) continue;

      // Check if words in the FAQ title exist in the user's message (fuzzy)
      const matchCount = titleWords.filter(tw => queryWords.some(qw => qw.includes(tw) || tw.includes(qw))).length;
      const matchPercentageTitle = matchCount / titleWords.length;
      const matchPercentageQuery = matchCount / queryWords.length;

      console.log(`[FAQ DEBUG] Comparing with "${item.title}" | Title Match: ${Math.round(matchPercentageTitle * 100)}% | Query Match: ${Math.round(matchPercentageQuery * 100)}%`);

      // Match if 65% of title words are used, OR if 80% of the query words match the title
      if (matchPercentageTitle >= 0.65 || matchPercentageQuery >= 0.8) {
        console.log(`[FAQ MATCH] Found fuzzy match: ${item.title}`);
        
        let replyText = item.content;
        // Strip out the question part if the user saved the FAQ as "Q: ... A: ..."
        const qIndex = replyText.toUpperCase().indexOf('Q:');
        const aIndex = replyText.toUpperCase().indexOf('A:');
        if (qIndex !== -1 && aIndex !== -1 && aIndex > qIndex) {
          replyText = replyText.substring(aIndex + 2).trim();
        }

        const directResponse: any = {
          reply: replyText,
          action: 'faq',
          status_update: 'Qualified',
          notes: `Matched FAQ: ${item.title}`
        };

        // Promote to lead if they match an FAQ
        lead.is_qualified = true;
        lead.lead_status = 'Hot'; // Ensure they are marked as Hot lead
        lead.lead_score = 10;
        await lead.save();

        let textToSend = directResponse.reply;
        const currentPlan = company?.plan || 'Free';
        const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
        if (limits.hasBranding) {
          textToSend += "\n\n⚡ Powered by ReplyZens";
        }
        directResponse.reply = textToSend;
        await this.logOutboundMessage(lead, directResponse as any);
        await this.sendInstagramMessage(lead.instagram_handle, textToSend, company?.instagram_access_token);
        return directResponse;
      }
    }

    // 3. Preprocess Message
    const normalizedMessage = context.message_text.toLowerCase().trim();

    // 3.5 Execute Playbook Triggers (Deterministic Bypass)
    const playbookSteps = company?.playbook_steps || [];
    if (playbookSteps.length > 0) {
      let currentTriggerMatched = false;
      let matchedActions: string[] = [];
      let playbookTitle = '';

      for (let i = 0; i < playbookSteps.length; i++) {
        const step = playbookSteps[i];
        
        if (step.type === 'trigger') {
          // If we already matched a trigger and collected its actions, we stop evaluating further triggers
          // This keeps it to the first matching trigger block
          if (matchedActions.length > 0) break;

          const keywords = step.value.split(',').map((k: string) => k.toLowerCase().trim()).filter((k: string) => k.length > 0);
          currentTriggerMatched = keywords.some((kw: string) => normalizedMessage.includes(kw));
        }
        
        if (step.type === 'action' && currentTriggerMatched) {
          matchedActions.push(step.value);
          if (!playbookTitle) playbookTitle = step.title;
        }
      }

      if (matchedActions.length > 0) {
        console.log(`[PLAYBOOK EXECUTED] Trigger matched! Executing ${matchedActions.length} actions.`);
        
        // Combine multiple actions into a single multi-line message to avoid rate limits
        let combinedText = matchedActions.join('\n\n');
        
        const currentPlan = company?.plan || 'Free';
        const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
        if (limits.hasBranding) {
          combinedText += "\n\n⚡ Powered by ReplyZens";
        }

        const directResponse: any = {
          reply: combinedText,
          action: 'playbook_automated',
          status_update: 'Qualified',
          notes: `Executed Playbook Action: ${playbookTitle} (+${matchedActions.length - 1} more)`
        };

        lead.is_qualified = true;
        lead.lead_status = 'Hot';
        lead.lead_score = Math.max(lead.lead_score || 0, 8); // boost score
        await lead.save();

        await this.logOutboundMessage(lead, directResponse as any);
        await this.sendInstagramMessage(lead.instagram_handle, combinedText, company?.instagram_access_token);
        
        return directResponse;
      }
    }

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
      let textToSend = aiResponse.reply;
      const currentPlan = company?.plan || 'Free';
      const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
      if (limits.hasBranding) {
        textToSend += "\n\n⚡ Powered by ReplyZens";
      }
      aiResponse.reply = textToSend;
      await this.logOutboundMessage(lead, aiResponse);
      await this.sendInstagramMessage(lead.instagram_handle, textToSend, company?.instagram_access_token);
      
      // 10. Increment AI Usage
      if (company) {
        company.monthly_ai_usage = (company.monthly_ai_usage || 0) + 1;
        await CompanyTable.update(companyId, { monthly_ai_usage: company.monthly_ai_usage });
      }
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

    const playbookSteps = company?.playbook_steps || [];
    let playbookRules = '';
    if (playbookSteps.length > 0) {
      playbookRules = `
═══════════════════════════════
CUSTOM AUTOMATION PLAYBOOK
═══════════════════════════════
You MUST follow these strict playbook rules defined by the business:
${playbookSteps.map((step: any, index: number) => `${index + 1}. [${step.type.toUpperCase()}] ${step.title}: ${step.value}`).join('\n')}

CRITICAL PLAYBOOK INSTRUCTION: If the customer's message triggers any of the above playbook rules, you MUST prioritize executing that action in your reply (e.g., providing the requested link).
`;
    }

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
${playbookRules}
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

  async sendManualMessage(companyId: string, leadId: string, text: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId } });
    const lead = await instagram_lead.findOne({ where: { id: leadId, company_id: companyId } });
    if (!lead) throw new Error('Lead not found');

    await this.sendInstagramMessage(lead.instagram_handle, text, company?.instagram_access_token);
    
    const outboundMsg = new instagram_message();
    outboundMsg.lead_id = lead.id;
    outboundMsg.message_text = text;
    outboundMsg.direction = 'Outbound';
    outboundMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
    outboundMsg.created_on = new Date();
    outboundMsg.company_id = companyId;
    await outboundMsg.save();

    this.instagramGateway.emitNewMessage({ ...outboundMsg, lead });

    lead.last_message_time = new Date();
    await lead.save();

    return { success: true };
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

  async getPlaybook(companyId: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    return { Success: true, Data: company?.playbook_steps || [] };
  }

  async updatePlaybook(companyId: string, steps: any) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (!company) throw new Error('Company not found');
    company.playbook_steps = steps;
    await company.save();
    return { Success: true };
  }

  async getCommentTriggers(companyId: string) {
    return await comment_trigger.find({
      where: { company_id: companyId },
      order: { created_on: 'DESC' }
    });
  }

  async createCommentTrigger(companyId: string, data: any) {
    const trigger = new comment_trigger();
    trigger.company_id = companyId;
    trigger.post_title = data.postTitle || 'All Posts & Reels';
    trigger.keyword = data.keyword.toUpperCase().trim();
    trigger.reply_message = data.replyMessage;
    trigger.is_active = true;
    trigger.created_by_id = '00000000-0000-0000-0000-000000000000';
    trigger.created_on = new Date();
    await trigger.save();
    return { Success: true, Data: trigger };
  }

  async deleteCommentTrigger(companyId: string, id: string) {
    const trigger = await comment_trigger.findOne({ where: { id, company_id: companyId } });
    if (!trigger) throw new Error('Trigger not found');
    await trigger.remove();
    return { Success: true };
  }

  async toggleCommentTrigger(companyId: string, id: string) {
    const trigger = await comment_trigger.findOne({ where: { id, company_id: companyId } });
    if (!trigger) throw new Error('Trigger not found');
    trigger.is_active = !trigger.is_active;
    await trigger.save();
    return { Success: true, Data: trigger };
  }

  async processIncomingComment(changeValue: any, igBusinessId: string) {
    const company = await CompanyTable.findOne({ where: { instagram_business_id: igBusinessId } });
    if (!company) {
      console.error(`[COMMENT WEBHOOK] No company found with instagram_business_id: ${igBusinessId}`);
      return;
    }

    const triggers = await comment_trigger.find({ where: { company_id: company.id, is_active: true } });
    const commentText = changeValue.text.toUpperCase();

    const matchedTrigger = triggers.find(t => {
      const keyword = t.keyword.toUpperCase().trim();
      // Safe regex matching to prevent false positives inside words
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(commentText);
    });

    if (!matchedTrigger) {
      console.log(`[COMMENT WEBHOOK] Comment text "${changeValue.text}" did not match any active keywords.`);
      return;
    }

    console.log(`[COMMENT WEBHOOK] Matched trigger keyword: "${matchedTrigger.keyword}" for comment ID: ${changeValue.id}`);

    // Send DM directly to the commenter's user ID
    // Note: We use the standard messages API (not private_replies) because private_replies
    // is blocked in Meta Development Mode for comments from non-initiated users.
    const commenterId = changeValue.from?.id;
    const mediaId = changeValue.media?.id;
    const commentId = changeValue.id;

    // Strategy 1: Try private_replies (works in Live mode)
    // Strategy 2: Fall back to public comment reply on the post (works in Dev mode too)
    let replySent = false;

    // Try private reply first
    try {
      const url = `https://graph.facebook.com/v21.0/${commentId}/private_replies`;
      await axios.post(url, { message: matchedTrigger.reply_message }, {
        headers: { 'Authorization': `Bearer ${company.instagram_access_token}` }
      });
      console.log(`[COMMENT WEBHOOK] ✅ Private reply sent to comment: ${commentId}`);
      replySent = true;
    } catch (err: any) {
      console.warn(`[COMMENT WEBHOOK] Private reply blocked (likely Dev Mode), falling back to public comment reply...`);
    }

    // Fallback: Post a public comment reply directly on the comment thread
    if (!replySent) {
      try {
        const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
        await axios.post(url, {
          message: `@${changeValue.from?.username || 'there'} ${matchedTrigger.reply_message}`
        }, {
          params: { access_token: company.instagram_access_token }
        });
        console.log(`[COMMENT WEBHOOK] ✅ Public comment reply sent on comment: ${commentId}`);
        replySent = true;
      } catch (error: any) {
        console.error('[COMMENT WEBHOOK ERROR] Public comment reply also failed:', error.response?.data || error.message);
        return;
      }
    }

    if (!replySent) {
      console.error('[COMMENT WEBHOOK ERROR] All reply strategies failed.');
      return;
    }

    // Save user interaction as lead & message history in CRM
    if (changeValue.from && changeValue.from.id) {
      const senderId = changeValue.from.id;
      const customerName = changeValue.from.username || 'Instagram User';

      let lead = await instagram_lead.findOne({ where: { instagram_handle: senderId, company_id: company.id } });
      if (!lead) {
        lead = new instagram_lead();
        lead.instagram_handle = senderId;
        lead.customer_name = customerName;
        lead.company_id = company.id;
        lead.lead_status = 'New';
        lead.is_qualified = false;
        lead.created_by_id = '00000000-0000-0000-0000-000000000000';
        lead.created_on = new Date();
        await lead.save();
      }

      const commentMsg = new instagram_message();
      commentMsg.lead_id = lead.id;
      commentMsg.message_text = `[COMMENT ON REEL/POST] ${changeValue.text}`;
      commentMsg.direction = 'Inbound';
      commentMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
      commentMsg.created_on = new Date();
      commentMsg.company_id = company.id;
      await commentMsg.save();

      const replyMsg = new instagram_message();
      replyMsg.lead_id = lead.id;
      replyMsg.message_text = matchedTrigger.reply_message;
      replyMsg.direction = 'Outbound';
      replyMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
      replyMsg.created_on = new Date();
      replyMsg.company_id = company.id;
      await replyMsg.save();

      this.instagramGateway.emitNewMessage({ ...replyMsg, lead });

      lead.last_message_time = new Date();
      await lead.save();
    }
  }
}
