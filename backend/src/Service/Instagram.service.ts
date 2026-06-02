import { Injectable, Inject } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { comment_trigger } from '@Database/Table/CRM/comment_trigger';
import { InstagramMessageContext, InstagramActionResponse } from '@Model/Instagram.model';
import { InstagramGateway } from '../Gateway/Instagram.gateway';
import { AIService } from './AI.service';
import { KnowledgeBaseService } from './KnowledgeBase.service';
import axios from 'axios';
import { PLAN_LIMITS } from '@Config/PlanLimits';
import { MoreThan } from 'typeorm';
import { MailerService } from './Mailer.service';
import { Redis } from 'ioredis';

import { story_context } from '@Database/Table/CRM/story_context';
import { OCRService } from './OCR.service';

@Injectable()
export class InstagramService {
  private processedMids = new Set<string>();
  private readonly CACHE_LIMIT = 500;

  constructor(
    private readonly instagramGateway: InstagramGateway,
    private readonly aiService: AIService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly mailerService: MailerService,
    private readonly ocrService: OCRService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) { }

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

    } catch (error: any) {
      console.error('[CONNECT FAILED]', error);
      if (error.response?.data?.error?.message) {
        throw new Error(`Meta API Error: ${error.response.data.error.message}`);
      }
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

  async processIncomingMessage(input: InstagramMessageContext | string, text?: string, messageId?: string, igBusinessId?: string, skipDedupe = false, storyInfo?: { id: string, url?: string }): Promise<InstagramActionResponse | void> {
    if (messageId && this.processedMids.has(messageId) && !skipDedupe) {
      return;
    }
    if (messageId) {
      this.processedMids.add(messageId);
      // Fix memory leak: Enforce CACHE_LIMIT
      if (this.processedMids.size > this.CACHE_LIMIT) {
        const iterator = this.processedMids.values();
        this.processedMids.delete(iterator.next().value);
      }
    }

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
    } else {
      // Reset follow-up status when user replies so they can be followed up again if they go cold later
      if (lead.follow_up_sent) {
        lead.follow_up_sent = false;
        await lead.save();
      }
    }

    // Process story reply OCR if storyInfo is present
    if (storyInfo && storyInfo.id && company) {
      try {
        console.log(`[STORY REPLY DETECTED] Story ID: ${storyInfo.id}`);
        // 1. Check if we already have story_context saved
        let sc = await story_context.findOne({ where: { instagram_story_id: storyInfo.id, company_id: companyId } });
        if (!sc) {
          console.log(`[STORY REPLY] Context not found. Fetching media from Meta...`);
          let storyMediaUrl = storyInfo.url;
          
          // Fetch the real media_url from Meta Graph API
          if (company.instagram_access_token) {
            try {
              const res = await axios.get(`https://graph.facebook.com/v21.0/${storyInfo.id}`, {
                params: {
                  fields: 'media_url,media_type',
                  access_token: company.instagram_access_token
                }
              });
              if (res.data?.media_url) {
                storyMediaUrl = res.data.media_url;
                console.log(`[STORY REPLY] Successfully retrieved Meta media URL: ${storyMediaUrl}`);
              }
            } catch (err: any) {
              console.error('[STORY REPLY ERROR] Failed to fetch story details from Graph API:', err.response?.data || err.message);
            }
          }

          if (storyMediaUrl) {
            // Download & OCR
            const ocrText = await this.ocrService.extractTextFromUrl(storyMediaUrl);
            if (ocrText && ocrText.trim().length > 0) {
              // Analyze with LLM to get structured JSON
              const structuredData = await this.aiService.analyzeStoryOcrText(ocrText);
              
              sc = new story_context();
              sc.company_id = companyId;
              sc.instagram_story_id = storyInfo.id;
              sc.story_media_url = storyMediaUrl;
              sc.ocr_text = ocrText;
              sc.structured_data = structuredData;
              sc.created_by_id = '00000000-0000-0000-0000-000000000000';
              sc.created_on = new Date();
              await sc.save();
              console.log(`[STORY REPLY] Saved new story context:`, JSON.stringify(structuredData));
            }
          }
        } else {
          console.log(`[STORY REPLY] Existing story context found:`, JSON.stringify(sc.structured_data));
        }

        if (sc) {
          lead.last_story_context_id = sc.id;
          await lead.save();
        }
      } catch (err: any) {
        console.error('[STORY OCR PROCESS ERROR] Failed in OCR story flow:', err.message);
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

    // -- 2. STORY MENTION AUTOMATION --
    if (context.message_text.startsWith('[STORY_MENTION]')) {
      console.log(`[STORY MENTION DETECTED] for company ${companyId}`);
      if (company?.story_mention_enabled && company.story_mention_message) {
        // Send auto-reply
        const currentPlan = company?.plan || 'Free';
        const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
        let textToSend = company.story_mention_message;
        if (limits.hasBranding) {
          textToSend += "\n\n⚡ Powered by ReplyZens";
        }
        
        await this.logOutboundMessage(lead, {
          reply: textToSend,
          action: 'story_mention_auto_reply',
          notes: 'Auto-reply to story mention.'
        } as any);
        await this.sendInstagramMessage(lead.instagram_handle, textToSend, company.instagram_access_token);
        
        // Boost score slightly for engagement
        lead.lead_score = (lead.lead_score || 0) + 2;
        await lead.save();
        return;
      } else {
        return;
      }
    }

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
    const aiResponse = await this.aiService.generateAiReply(context.message_text, lead, companyId);

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
        
        // Track consumption limits and trigger proactive alerting
        await this.checkAndSendUsageAlert(company, limits);
      }
    }

    return aiResponse;
  }

  private async checkAndSendUsageAlert(company: any, limits: any) {
    if (!company || !company.email) return;

    const usage = company.monthly_ai_usage || 0;
    const limit = limits.aiMessagesLimit;
    if (limit <= 0) return;

    const percent = (usage / limit) * 100;
    const currentMonth = company.ai_usage_reset_month || new Date().toISOString().slice(0, 7);

    // 100% Exceeded alert
    if (percent >= 100) {
      const key = `ai_usage_alert_100:${company.id}:${currentMonth}`;
      const sent = await this.redisClient.get(key);
      if (!sent) {
        await this.redisClient.set(key, 'true', 'EX', 30 * 24 * 60 * 60); // 30 days expiry
        await this.mailerService.SendMail({
          to: company.email,
          subject: `[ALERT] AI Response Limits Reached - ${company.name}`,
          template: `Hello,\n\nYour company "${company.name}" has reached 100% of its monthly AI messaging limits (${usage}/${limit} messages) for the '${company.plan}' plan.\n\nAutomated AI responses are temporarily offline until the counter resets or you upgrade your plan.\n\nBest regards,\nReplyZens Team`,
          context: {},
          html: false
        });
        console.log(`[ALERT 100%] Sent usage limit exhausted alert to ${company.email}`);
      }
    }
    // 80% Warning alert
    else if (percent >= 80) {
      const key = `ai_usage_alert_80:${company.id}:${currentMonth}`;
      const sent = await this.redisClient.get(key);
      if (!sent) {
        await this.redisClient.set(key, 'true', 'EX', 30 * 24 * 60 * 60); // 30 days expiry
        await this.mailerService.SendMail({
          to: company.email,
          subject: `[WARNING] AI Response Limit approaching 80% - ${company.name}`,
          template: `Hello,\n\nYour company "${company.name}" has used ${usage} out of ${limit} of its monthly AI messaging limits (80% reached) for the '${company.plan}' plan.\n\nTo ensure uninterrupted service, you can upgrade your plan in the billing settings.\n\nBest regards,\nReplyZens Team`,
          context: {},
          html: false
        });
        console.log(`[ALERT 80%] Sent usage approaching 80% warning to ${company.email}`);
      }
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
    return await this.knowledgeBaseService.getKnowledgeBase(companyId);
  }

  async createKnowledgeItem(companyId: string, data: any) {
    return await this.knowledgeBaseService.createKnowledgeItem(companyId, data);
  }

  async deleteKnowledgeItem(companyId: string, id: string) {
    return await this.knowledgeBaseService.deleteKnowledgeItem(companyId, id);
  }

  async uploadKnowledgeFile(companyId: string, file: any) {
    return await this.knowledgeBaseService.uploadKnowledgeFile(companyId, file);
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
        welcome_message: company?.welcome_message,
        auto_follow_up_enabled: company?.auto_follow_up_enabled || false,
        auto_follow_up_delay_hours: company?.auto_follow_up_delay_hours ?? 24,
        auto_follow_up_message: company?.auto_follow_up_message || '',
        story_mention_enabled: company?.story_mention_enabled || false,
        story_mention_message: company?.story_mention_message || '',
        auto_reply_enabled: company?.auto_reply_enabled !== false, // default true
        human_handoff_alerts: company?.human_handoff_alerts !== false, // default true
        timezone: company?.timezone || 'UTC',
        working_hours_start: company?.working_hours_start || '09:00',
        working_hours_end: company?.working_hours_end || '18:00',
        ooo_message: company?.ooo_message || ''
      }
    };
  }

  async updateIntegrationSettings(companyId: string, data: any) {
    const company = await CompanyTable.findOneBy({ id: companyId as any });
    if (!company) throw new Error('Company not found');
    
    if (data.welcome_message !== undefined) company.welcome_message = data.welcome_message;
    if (data.auto_follow_up_enabled !== undefined) company.auto_follow_up_enabled = data.auto_follow_up_enabled;
    if (data.auto_follow_up_delay_hours !== undefined) company.auto_follow_up_delay_hours = data.auto_follow_up_delay_hours;
    if (data.auto_follow_up_message !== undefined) company.auto_follow_up_message = data.auto_follow_up_message;
    if (data.story_mention_enabled !== undefined) company.story_mention_enabled = data.story_mention_enabled;
    if (data.story_mention_message !== undefined) company.story_mention_message = data.story_mention_message;
    if (data.auto_reply_enabled !== undefined) company.auto_reply_enabled = data.auto_reply_enabled;
    if (data.human_handoff_alerts !== undefined) company.human_handoff_alerts = data.human_handoff_alerts;
    if (data.timezone !== undefined) company.timezone = data.timezone;
    if (data.working_hours_start !== undefined) company.working_hours_start = data.working_hours_start;
    if (data.working_hours_end !== undefined) company.working_hours_end = data.working_hours_end;
    if (data.ooo_message !== undefined) company.ooo_message = data.ooo_message;

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
