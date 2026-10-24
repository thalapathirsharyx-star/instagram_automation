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

import * as crypto from 'crypto';

import { story_context } from '@Database/Table/CRM/story_context';
import { OCRService } from './OCR.service';
import { ProductCatalogService } from './ProductCatalog.service';

/**
 * Graph API version used for every Meta call. Override with META_GRAPH_VERSION so the
 * version can be rolled forward without a code change — Graph versions are deprecated
 * roughly two years after release, and a deprecated version starts failing silently.
 */
export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

/**
 * Webhook fields this integration depends on, for POST /{page-id}/subscribed_apps.
 * `comments` additionally requires Advanced Access to instagram_manage_comments.
 */
export const WEBHOOK_FIELDS = ['messages', 'messaging_postbacks', 'comments'];

/**
 * Permissions the Instagram-API-with-Facebook-Login integration actually calls.
 * `pages_manage_metadata` is required to subscribe a Page to webhooks — without it
 * the subscribed_apps call fails and no real-time events ever arrive.
 */
export const REQUIRED_SCOPES = [
  'instagram_basic',
  'instagram_manage_messages',
  'instagram_manage_comments',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_metadata'
];

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
    private readonly productCatalogService: ProductCatalogService,
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
      let exchangeRes = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: userToken
        }
      });

      const longLivedUserToken = exchangeRes.data.access_token;

      // Record who authorised the connection: Meta's data-deletion and deauthorization
      // callbacks identify the app user by this app-scoped id and nothing else.
      let metaUserId: string | null = null;
      try {
        const meRes = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me`, {
          params: { fields: 'id', access_token: longLivedUserToken }
        });
        metaUserId = meRes.data?.id || null;
      } catch (err: any) {
        console.warn('[CONNECT] Could not resolve the authorising Meta user id:', err.message);
      }

      const pagesRes = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`, {
        params: {
          fields: 'name,access_token,instagram_business_account',
          access_token: longLivedUserToken
        }
      });

      const pages = pagesRes.data.data;
      // Never log the raw response: each page object carries a live Page access token.
      console.log(
        `[CONNECT] Meta returned ${pages?.length || 0} page(s); ` +
        `${pages?.filter((p: any) => p.instagram_business_account).length || 0} with a linked Instagram account.`
      );
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
      if (metaUserId) company.meta_user_id = metaUserId;
      await company.save();

      // Subscribe the linked Page so this app receives `messages` and `comments` notifications.
      // `subscribed_fields` must be a comma-separated string, not a JSON array, and the granting
      // user must have given `pages_manage_metadata` or Graph rejects the call outright.
      // See https://developers.facebook.com/documentation/instagram-platform/webhooks/setup
      const warnings: string[] = [];
      try {
        const subRes = await axios.post(
          `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/subscribed_apps`,
          null,
          {
            params: {
              subscribed_fields: WEBHOOK_FIELDS.join(','),
              access_token: pageAccessToken
            }
          }
        );
        if (subRes.data?.success !== true) {
          warnings.push('Meta did not confirm the webhook subscription. Comment and message automation may not receive events.');
          console.error('[WEBHOOK SUBSCRIBE] Unexpected response:', JSON.stringify(subRes.data));
        } else {
          console.log(`[WEBHOOK SUBSCRIBE] Page ${pageId} subscribed to: ${WEBHOOK_FIELDS.join(',')}`);
        }
      } catch (err: any) {
        const metaErr = err.response?.data?.error;
        console.error('[WEBHOOK SUBSCRIBE FAILED]', JSON.stringify(metaErr || err.message));
        warnings.push(
          `Automatic webhook subscription failed${metaErr?.message ? `: ${metaErr.message}` : ''}. ` +
          'Real-time DM and comment automation will not work until this succeeds. ' +
          'This usually means the pages_manage_metadata permission was not granted.'
        );
      }

      // Report which of the permissions this integration depends on were actually granted,
      // instead of letting the user discover a half-working connection later.
      const missingScopes = await this.findMissingScopes(longLivedUserToken, APP_ID, APP_SECRET);
      if (missingScopes.length > 0) {
        warnings.push(`Missing Meta permissions: ${missingScopes.join(', ')}.`);
      }

      return {
        Success: true,
        Data: {
          business_id: igBusinessId,
          page_name: targetPage.name,
          warnings,
          missing_scopes: missingScopes
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

  /**
   * Returns the REQUIRED_SCOPES the app user did NOT grant, by inspecting the token with
   * debug_token. Returns [] when the check itself cannot be performed, so a transient
   * Graph failure never blocks an otherwise valid connection.
   */
  private async findMissingScopes(userToken: string, appId: string, appSecret: string): Promise<string[]> {
    try {
      const res = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/debug_token`, {
        params: { input_token: userToken, access_token: `${appId}|${appSecret}` }
      });
      const granted: string[] = res.data?.data?.scopes || [];
      if (granted.length === 0) return [];
      return REQUIRED_SCOPES.filter(s => !granted.includes(s));
    } catch (err: any) {
      console.warn('[SCOPE CHECK] Could not inspect granted scopes:', err.response?.data?.error?.message || err.message);
      return [];
    }
  }

  async disconnectInstagramAccount(companyId: string) {
    console.log(`[DISCONNECT] Unlinking Instagram for Company: ${companyId}`);
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (!company) throw new Error('Company not found');
    
    // Unsubscribe the app from the Facebook Page webhooks
    if (company.instagram_page_id && company.instagram_access_token) {
      try {
        await axios.delete(`https://graph.facebook.com/${GRAPH_VERSION}/${company.instagram_page_id}/subscribed_apps`, {
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

  /**
   * Honours Meta's data-deletion callback: removes the Instagram-derived personal data
   * (leads, conversation history, story context) for every workspace the given Meta user
   * authorised, and discards the stored credentials.
   *
   * Returns a confirmation code Meta surfaces to the user. The code is recorded in Redis
   * so a status lookup can confirm the request was genuinely processed.
   */
  async handleMetaDataDeletion(metaUserId: string) {
    const confirmationCode = `DEL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const companies = await CompanyTable.find({ where: { meta_user_id: metaUserId } });

    if (companies.length === 0) {
      // Either the user never connected, or they connected before meta_user_id was
      // recorded. Say so plainly rather than implying data was deleted.
      console.warn(
        `[DATA DELETION] No workspace is mapped to Meta user ${metaUserId}. ` +
        'Nothing to delete. If this account connected before meta_user_id was captured, ' +
        'it must be resolved manually via the documented email process.'
      );
    }

    let deletedLeads = 0;
    let deletedMessages = 0;

    for (const company of companies) {
      const msgResult = await instagram_message.delete({ company_id: company.id });
      deletedMessages += msgResult.affected || 0;

      await story_context.delete({ company_id: company.id });

      const leadResult = await instagram_lead.delete({ company_id: company.id });
      deletedLeads += leadResult.affected || 0;

      // Revoke and discard the Meta credentials for this workspace.
      await this.disconnectInstagramAccount(company.id).catch(err =>
        console.error(`[DATA DELETION] Disconnect failed for company ${company.id}:`, err.message)
      );

      await CompanyTable.update(company.id, { meta_user_id: null as any });
    }

    try {
      await this.redisClient.set(
        `meta_deletion:${confirmationCode}`,
        JSON.stringify({
          meta_user_id: metaUserId,
          companies: companies.map(c => c.id),
          deleted_leads: deletedLeads,
          deleted_messages: deletedMessages,
          completed_at: new Date().toISOString()
        }),
        'EX',
        90 * 24 * 60 * 60
      );
    } catch (err: any) {
      console.error('[DATA DELETION] Could not record the confirmation code:', err.message);
    }

    console.log(
      `[DATA DELETION] ${confirmationCode}: ${companies.length} workspace(s), ` +
      `${deletedLeads} lead(s), ${deletedMessages} message(s) removed.`
    );

    return { confirmation_code: confirmationCode, workspaces: companies.length };
  }

  /**
   * Handles Meta's deauthorization callback. The token is already dead at this point,
   * so the stored copy is cleared; CRM records are kept because the business may still
   * be a paying customer who simply reconnects. Full erasure goes through
   * handleMetaDataDeletion.
   */
  async handleMetaDeauthorization(metaUserId: string) {
    const companies = await CompanyTable.find({ where: { meta_user_id: metaUserId } });
    for (const company of companies) {
      await CompanyTable.update(company.id, {
        instagram_access_token: null as any,
        instagram_business_id: null as any,
        instagram_page_id: null as any,
        instagram_username: null as any
      });
      console.log(`[DEAUTHORIZE] Cleared Instagram credentials for company ${company.id}.`);
    }
    return { workspaces: companies.length };
  }

  /**
   * Self-serve erasure for the in-app "Delete Account & Purge Data" action, matching what
   * the published data-deletion instructions promise.
   */
  async purgeCompanyData(companyId: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (!company) throw new Error('Workspace not found');

    if (company.instagram_access_token) {
      await this.disconnectInstagramAccount(companyId).catch(err =>
        console.error(`[PURGE] Disconnect failed for company ${companyId}:`, err.message)
      );
    }

    const msgResult = await instagram_message.delete({ company_id: companyId });
    await story_context.delete({ company_id: companyId });
    await comment_trigger.delete({ company_id: companyId });
    await knowledge_base.delete({ company_id: companyId });
    const leadResult = await instagram_lead.delete({ company_id: companyId });

    await CompanyTable.update(companyId, {
      meta_user_id: null as any,
      instagram_access_token: null as any,
      instagram_business_id: null as any,
      instagram_page_id: null as any,
      instagram_username: null as any,
      status: false as any
    });

    console.log(
      `[PURGE] Company ${companyId}: removed ${leadResult.affected || 0} lead(s) and ` +
      `${msgResult.affected || 0} message(s); workspace deactivated.`
    );

    return {
      Success: true,
      Data: {
        deleted_leads: leadResult.affected || 0,
        deleted_messages: msgResult.affected || 0
      }
    };
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
        const profileRes = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${context.instagram_handle}?fields=name&access_token=${company?.instagram_access_token}`);
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
          textToSend += "\n\n⚡ Powered by Flazly";
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
              const res = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${storyInfo.id}`, {
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
          textToSend += "\n\n⚡ Powered by Flazly";
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
    this.instagramGateway.emitNewMessage({
      id: inboundMsg.id,
      lead_id: inboundMsg.lead_id,
      company_id: inboundMsg.company_id,
      message_text: inboundMsg.message_text,
      direction: inboundMsg.direction,
      created_on: inboundMsg.created_on,
      lead
    });
    // Handle Image Messages (Simple Approach)
    if (context.message_text.startsWith('[IMAGE]')) {
      const currentPlan = company?.plan || 'Free';
      const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.Free;
      let replyText = "I received your image! Let me connect you with a human to check it.";
      if (limits.hasBranding) {
        replyText += "\n\n⚡ Powered by Flazly";
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
    // NOTE: This only triggers for specific, substantial queries. Greetings and short messages
    // are always routed to the LLM for a natural conversational response.
    const knowledgeItems = await knowledge_base.find({ where: { company_id: companyId } });
    console.log(`[FAQ DEBUG] Checking ${knowledgeItems.length} items in Brain Base for company ${companyId}`);

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryWords = normalize(context.message_text).split(' ').filter(w => w.length >= 3); // Only consider words with 3+ chars
    console.log(`[FAQ DEBUG] Normalized Query Words: ${JSON.stringify(queryWords)}`);

    // Skip FAQ shortcut for greetings and very short messages — let the LLM handle them naturally
    const greetings = ['hi', 'hey', 'hello', 'hii', 'hiii', 'yo', 'yoo', 'sup', 'hai', 'helo', 'vanakkam', 'namaste', 'thanks', 'thank', 'ok', 'okay', 'cool', 'bye', 'good', 'morning', 'evening', 'night'];
    const rawNormalized = normalize(context.message_text);
    const isGreeting = greetings.includes(rawNormalized) || queryWords.length === 0;

    if (!isGreeting && queryWords.length >= 1) {
      for (const item of knowledgeItems) {
        const titleWords = normalize(item.title).split(' ').filter(w => w !== 'pdf' && w !== 'docx' && w !== 'txt' && w !== 'faq' && w.length >= 3);
        if (titleWords.length === 0) continue;

        // Check if words in the FAQ title exist in the user's message (fuzzy)
        // Require exact word match (not substring) to prevent false positives
        const matchCount = titleWords.filter(tw => queryWords.some(qw => qw === tw || (qw.length >= 4 && tw.length >= 4 && (qw.includes(tw) || tw.includes(qw))))).length;
        const matchPercentageTitle = matchCount / titleWords.length;
        const matchPercentageQuery = matchCount / queryWords.length;

        console.log(`[FAQ DEBUG] Comparing with "${item.title}" | Title Match: ${Math.round(matchPercentageTitle * 100)}% | Query Match: ${Math.round(matchPercentageQuery * 100)}%`);

        // Match only if BOTH title match is strong AND query match is strong
        if (matchPercentageTitle >= 0.65 && matchPercentageQuery >= 0.5 && matchCount >= 1) {
          console.log(`[FAQ MATCH] Found strong match: ${item.title}`);
          
          // FAQ matched — but DON'T send raw content. Let the LLM handle it naturally.
          // The knowledge base context will be injected into the LLM prompt automatically.
          console.log(`[FAQ] Routing matched FAQ "${item.title}" through LLM for natural response.`);
          break; // Let it fall through to the LLM call below
        }
      }
    } else {
      console.log(`[FAQ SKIP] Greeting or short message detected ("${rawNormalized}"). Routing to LLM.`);
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
          combinedText += "\n\n⚡ Powered by Flazly";
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

    // Trigger typing indicator immediately before the AI starts "thinking"
    await this.sendSenderAction(lead.instagram_handle, 'typing_on', company?.instagram_access_token);

    // 5. Dynamic AI Classification
    const aiResponse = await this.aiService.generateAiReply(context.message_text, lead, companyId);

    if (aiResponse.reply) {
      // Decrement stock if order confirmed
      if (aiResponse.confirmed_order && aiResponse.confirmed_order.sku) {
        try {
          const orderSku = aiResponse.confirmed_order.sku;
          const orderQty = parseInt(aiResponse.confirmed_order.quantity, 10) || 1;
          const orderSize = aiResponse.confirmed_order.size;
          const orderColor = aiResponse.confirmed_order.color;
          console.log(`[ORDER CONFIRMED] Decrementing stock for SKU: ${orderSku}, Qty: ${orderQty}, Size: ${orderSize || 'N/A'}, Color: ${orderColor || 'N/A'}`);
          await this.productCatalogService.decrementStock(companyId, orderSku, orderQty, { size: orderSize, color: orderColor });
        } catch (err: any) {
          console.error('[ORDER STOCK DECREMENT ERROR]', err.message);
        }
      }
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
      if (aiResponse.notes) lead.notes = aiResponse.notes;
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
        textToSend += "\n\n⚡ Powered by Flazly";
      }
      aiResponse.reply = textToSend;

      // Simulate additional human typing latency (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.logOutboundMessage(lead, aiResponse);
      await this.sendInstagramMessage(lead.instagram_handle, textToSend, company?.instagram_access_token);
      
      // 10. Increment AI Usage
      if (company) {
        const usage = aiResponse._usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        console.log(`[TOKEN ANALYTICS] Company: ${companyId} | Prompt: ${usage.prompt_tokens} | Completion: ${usage.completion_tokens} | Total: ${usage.total_tokens}`);

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
          template: `Hello,\n\nYour company "${company.name}" has reached 100% of its monthly AI messaging limits (${usage}/${limit} messages) for the '${company.plan}' plan.\n\nAutomated AI responses are temporarily offline until the counter resets or you upgrade your plan.\n\nBest regards,\nFlazly Team`,
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
          template: `Hello,\n\nYour company "${company.name}" has used ${usage} out of ${limit} of its monthly AI messaging limits (80% reached) for the '${company.plan}' plan.\n\nTo ensure uninterrupted service, you can upgrade your plan in the billing settings.\n\nBest regards,\nFlazly Team`,
          context: {},
          html: false
        });
        console.log(`[ALERT 80%] Sent usage approaching 80% warning to ${company.email}`);
      }
    }
  }



  private async fetchUserProfile(instagramId: string, token: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}`, {
        params: { fields: 'name', access_token: token }
      });
      return res.data;
    } catch (e) {
      return null;
    }
  }

  private async fetchMessageDetails(mid: string, token: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${mid}`, {
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
    // Mark every automated reply so it is never mistaken for a human agent message.
    outboundMsg.action_taken = (response as any)?.action ? `AI_${(response as any).action}` : 'AI_REPLY';
    outboundMsg.ai_notes = (response as any)?.notes || null;
    outboundMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
    outboundMsg.created_on = new Date();
    outboundMsg.company_id = lead.company_id;
    await outboundMsg.save();

    // Notify the UI via WebSocket
    this.instagramGateway.emitNewMessage({
      id: outboundMsg.id,
      lead_id: outboundMsg.lead_id,
      company_id: outboundMsg.company_id,
      message_text: outboundMsg.message_text,
      direction: outboundMsg.direction,
      created_on: outboundMsg.created_on,
      lead
    });

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

  private async sendSenderAction(recipientId: string, action: string, token: string) {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/messages`;
    const payload = { recipient: { id: recipientId }, sender_action: action };
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      await axios.post(url, payload, { headers, timeout: 5000 });
    } catch (e: any) {
      console.error(`[IG ERROR] Failed to send sender_action '${action}':`, e.response?.data || e.message);
    }
  }

  /**
   * Sends a DM. Returns the outcome rather than throwing, so the automated paths keep
   * their existing fire-and-forget behaviour while interactive callers can surface the
   * real Meta error instead of reporting a message that was never delivered.
   */
  private async sendInstagramMessage(
    recipientId: string,
    text: string,
    token: string,
    isHumanAgent: boolean = false
  ): Promise<{ ok: boolean; error?: string }> {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/messages`;
    const payload: any = { recipient: { id: recipientId }, message: { text } };

    // Only set when the caller has established the 24-hour window has closed.
    if (isHumanAgent) {
      payload.messaging_type = 'MESSAGE_TAG';
      payload.tag = 'HUMAN_AGENT';
    } else {
      payload.messaging_type = 'RESPONSE';
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    let lastError = 'Unknown error';

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await axios.post(url, payload, { headers, timeout: 15000 });
        return { ok: true };
      } catch (error: any) {
        const errData = error.response?.data;
        const errStatus = error.response?.status;
        const errMsg = error.message;
        lastError = errData?.error?.message || errMsg;
        console.error(`[IG ERROR] Message failed to send (attempt ${attempt}/2):`, JSON.stringify({ status: errStatus, data: errData, message: errMsg }));

        if (attempt < 2 && (errStatus === 429 || errStatus >= 500)) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        break;
      }
    }
    return { ok: false, error: lastError };
  }

  /**
   * Returns true when the standard 24-hour messaging window for this conversation has
   * closed, i.e. the HUMAN_AGENT tag is both permitted and required to deliver a reply.
   *
   * The tag must NOT be attached inside the window: Meta restricts message-tag use to
   * its approved cases, and tagging an ordinary in-window reply is misuse.
   * https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy
   */
  private async isOutsideStandardWindow(leadId: string): Promise<boolean> {
    const lastInbound = await instagram_message.findOne({
      where: { lead_id: leadId, direction: 'Inbound' },
      order: { created_on: 'DESC' }
    });
    // No inbound message on record: there is no window to extend, so do not tag.
    if (!lastInbound?.created_on) return false;
    const ageMs = Date.now() - new Date(lastInbound.created_on).getTime();
    return ageMs > 24 * 60 * 60 * 1000;
  }

  async sendManualMessage(companyId: string, leadId: string, text: string, agentUserId?: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId } });
    if (!company?.instagram_access_token) {
      throw new Error('Instagram account not connected for this workspace');
    }
    const lead = await instagram_lead.findOne({ where: { id: leadId, company_id: companyId } });
    if (!lead) throw new Error('Lead not found');

    // A human agent is replying from the inbox. Only escalate to the HUMAN_AGENT tag when
    // the 24-hour window has already closed; inside the window send a standard response.
    const useHumanAgentTag = await this.isOutsideStandardWindow(leadId);
    if (useHumanAgentTag) {
      console.log(`[HUMAN AGENT] Lead ${leadId} is outside the 24h window; sending with HUMAN_AGENT tag.`);
    }
    const sendResult = await this.sendInstagramMessage(
      lead.instagram_handle,
      text,
      company.instagram_access_token,
      useHumanAgentTag
    );

    // Never log an undelivered message as sent — the agent must see the real failure.
    if (!sendResult.ok) {
      throw new Error(`Instagram did not accept the message: ${sendResult.error}`);
    }

    const outboundMsg = new instagram_message();
    outboundMsg.lead_id = lead.id;
    outboundMsg.message_text = text;
    outboundMsg.direction = 'Outbound';
    // Distinguishes a human agent's reply from an AI-generated one, both in the UI and
    // in the audit trail Meta asks for when reviewing the Human Agent feature.
    outboundMsg.action_taken = useHumanAgentTag ? 'HUMAN_AGENT_TAGGED_REPLY' : 'HUMAN_AGENT_REPLY';
    outboundMsg.created_by_id = agentUserId || '00000000-0000-0000-0000-000000000000';
    outboundMsg.created_on = new Date();
    outboundMsg.company_id = companyId;
    await outboundMsg.save();

    this.instagramGateway.emitNewMessage({ ...outboundMsg, lead });

    lead.last_message_time = new Date();
    await lead.save();

    return outboundMsg;
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

  async updateKnowledgeItem(companyId: string, id: string, data: any) {
    return await this.knowledgeBaseService.updateKnowledgeItem(companyId, id, data);
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
    const commenterId = changeValue.from?.id;
    const commentId = changeValue.id;

    // The public fallback reply below is itself a comment, so Meta delivers a `comments`
    // event for it. Without this guard a reply containing its own trigger keyword would
    // make the app reply to itself indefinitely.
    if (commenterId && igBusinessId && String(commenterId) === String(igBusinessId)) {
      console.log(`[COMMENT WEBHOOK] Skipping our own comment (${commentId}).`);
      return;
    }

    const company = await CompanyTable.findOne({ where: { instagram_business_id: igBusinessId } });
    if (!company) {
      console.error(`[COMMENT WEBHOOK] No company found with instagram_business_id: ${igBusinessId}`);
      return;
    }

    if (commenterId && company.instagram_page_id && String(commenterId) === String(company.instagram_page_id)) {
      console.log(`[COMMENT WEBHOOK] Skipping comment authored by the connected Page (${commentId}).`);
      return;
    }

    // Meta retries a webhook delivery until it gets a 200, and may redeliver afterwards.
    // Claim each comment id once so a retry cannot produce a second reply.
    if (commentId) {
      const dedupeKey = `ig_comment_seen:${company.id}:${commentId}`;
      try {
        const claimed = await this.redisClient.set(dedupeKey, '1', 'EX', 7 * 24 * 60 * 60, 'NX');
        if (claimed !== 'OK') {
          console.log(`[COMMENT WEBHOOK] Duplicate delivery for comment ${commentId}; ignoring.`);
          return;
        }
      } catch (err: any) {
        // Redis unavailable: continue rather than dropping a genuine event.
        console.warn('[COMMENT WEBHOOK] Dedupe check unavailable:', err.message);
      }
    }

    const triggers = await comment_trigger.find({ where: { company_id: company.id, is_active: true } });
    const commentText = String(changeValue.text || '').toUpperCase();

    const matchedTrigger = triggers.find(t => {
      const keywords = t.keyword.split(',').map(k => k.trim().toUpperCase()).filter(k => k.length > 0);
      return keywords.some(kw => {
        // Safe regex matching to prevent false positives inside words
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        return regex.test(commentText);
      });
    });

    if (!matchedTrigger) {
      console.log(`[COMMENT WEBHOOK] Comment text "${changeValue.text}" did not match any active keywords.`);
      return;
    }

    console.log(`[COMMENT WEBHOOK] Matched trigger keyword: "${matchedTrigger.keyword}" for comment ID: ${changeValue.id}`);

    const mediaId = changeValue.media?.id;

    // Strategy 1: Try private_replies (works in Live mode)
    // Strategy 2: Fall back to public comment reply on the post (works in Dev mode too)
    let replySent = false;

    // Try private reply first
    try {
      const url = `https://graph.facebook.com/${GRAPH_VERSION}/${commentId}/private_replies`;
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
        const url = `https://graph.facebook.com/${GRAPH_VERSION}/${commentId}/replies`;
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

  // --- COMMENTS MANAGEMENT (instagram_business_manage_comments) ---

  async getMedia(companyId: string, limit: number = 25, after?: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (!company || !company.instagram_business_id || !company.instagram_access_token) {
      throw new Error('Instagram account not connected for this workspace');
    }

    try {
      const params: any = {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments_count,like_count',
        limit: Math.min(Number(limit) || 25, 50),
        access_token: company.instagram_access_token
      };
      if (after) {
        params.after = after;
      }

      const response = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${company.instagram_business_id}/media`, { params });
      return response.data;
    } catch (error: any) {
      console.error('[INSTAGRAM GET MEDIA ERROR]', error.response?.data || error.message);
      const metaMsg = error.response?.data?.error?.message || error.message;
      throw new Error(`Meta API Error: ${metaMsg}`);
    }
  }

  /**
   * Confirms the given media id belongs to the workspace's own connected Instagram account
   * before any comment is read or modified. The access token already scopes Graph to that
   * account, but checking here turns a confusing Meta error into a clear 403 and stops a
   * tenant from probing ids that are not theirs.
   */
  private async assertOwnsMedia(company: any, mediaId: string) {
    const res = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}`, {
      params: { fields: 'id,owner', access_token: company.instagram_access_token }
    });
    const ownerId = res.data?.owner?.id;
    if (ownerId && String(ownerId) !== String(company.instagram_business_id)) {
      throw new Error('FORBIDDEN_MEDIA: This post does not belong to the connected Instagram account.');
    }
  }

  /**
   * Confirms the comment hangs off media owned by the workspace's connected account.
   */
  private async assertOwnsComment(company: any, commentId: string) {
    const res = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${commentId}`, {
      params: { fields: 'id,media{id,owner}', access_token: company.instagram_access_token }
    });
    const ownerId = res.data?.media?.owner?.id;
    if (ownerId && String(ownerId) !== String(company.instagram_business_id)) {
      throw new Error('FORBIDDEN_COMMENT: This comment does not belong to the connected Instagram account.');
    }
  }

  private async requireConnectedCompany(companyId: string) {
    const company = await CompanyTable.findOne({ where: { id: companyId as any } });
    if (!company || !company.instagram_business_id || !company.instagram_access_token) {
      throw new Error('Instagram account not connected for this workspace');
    }
    return company;
  }

  async getComments(companyId: string, mediaId: string, limit: number = 50, after?: string) {
    const company = await this.requireConnectedCompany(companyId);

    try {
      await this.assertOwnsMedia(company, mediaId);

      const params: any = {
        fields: 'id,text,timestamp,username,like_count,hidden,replies{id,text,timestamp,username}',
        limit: Math.min(Number(limit) || 50, 100),
        access_token: company.instagram_access_token
      };
      if (after) {
        params.after = after;
      }

      const response = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}/comments`, { params });
      return response.data;
    } catch (error: any) {
      if (String(error.message).startsWith('FORBIDDEN_MEDIA')) throw error;
      console.error('[INSTAGRAM GET COMMENTS ERROR]', error.response?.data || error.message);
      const metaMsg = error.response?.data?.error?.message || error.message;
      throw new Error(`Meta API Error: ${metaMsg}`);
    }
  }

  async replyToComment(companyId: string, commentId: string, message: string) {
    const company = await this.requireConnectedCompany(companyId);

    try {
      await this.assertOwnsComment(company, commentId);

      const url = `https://graph.facebook.com/${GRAPH_VERSION}/${commentId}/replies`;
      const response = await axios.post(url, null, {
        params: { message, access_token: company.instagram_access_token }
      });
      return response.data;
    } catch (error: any) {
      if (String(error.message).startsWith('FORBIDDEN_COMMENT')) throw error;
      console.error('[INSTAGRAM REPLY COMMENT ERROR]', error.response?.data || error.message);
      throw new Error(`Meta API Error: ${this.describeCommentError(error)}`);
    }
  }

  async hideComment(companyId: string, commentId: string, hide: boolean = true) {
    const company = await this.requireConnectedCompany(companyId);

    try {
      await this.assertOwnsComment(company, commentId);

      const url = `https://graph.facebook.com/${GRAPH_VERSION}/${commentId}`;
      const response = await axios.post(url, null, {
        params: {
          hide,
          access_token: company.instagram_access_token
        }
      });
      return { success: true, hidden: hide, data: response.data };
    } catch (error: any) {
      if (String(error.message).startsWith('FORBIDDEN_COMMENT')) throw error;
      console.error('[INSTAGRAM HIDE COMMENT ERROR]', error.response?.data || error.message);
      throw new Error(`Meta API Error: ${this.describeCommentError(error)}`);
    }
  }

  async deleteComment(companyId: string, commentId: string) {
    const company = await this.requireConnectedCompany(companyId);

    try {
      await this.assertOwnsComment(company, commentId);

      const url = `https://graph.facebook.com/${GRAPH_VERSION}/${commentId}`;
      const response = await axios.delete(url, {
        params: { access_token: company.instagram_access_token }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      if (String(error.message).startsWith('FORBIDDEN_COMMENT')) throw error;
      console.error('[INSTAGRAM DELETE COMMENT ERROR]', error.response?.data || error.message);
      throw new Error(`Meta API Error: ${this.describeCommentError(error)}`);
    }
  }

  /**
   * Turns Meta's comment errors into something an operator can act on. Comments can be
   * deleted by their author or removed from your own media, a hidden comment cannot be
   * replied to, and a comment deleted on Instagram disappears from the Graph entirely —
   * each of these surfaces as a generic Graph error otherwise.
   */
  private describeCommentError(error: any): string {
    const err = error.response?.data?.error;
    const code = err?.code;
    const subcode = err?.error_subcode;
    const metaMsg = err?.message || error.message;

    if (error.response?.status === 404 || code === 803) {
      return 'This comment no longer exists on Instagram — it may have been deleted by its author. Refresh the comment list.';
    }
    if (code === 190) {
      return 'The Instagram connection has expired or been revoked. Reconnect the account in Meta Integration.';
    }
    if (code === 200 || code === 10) {
      return `Instagram refused this action for the connected account (${metaMsg}). This usually means the instagram_manage_comments permission is missing or still limited to Standard Access.`;
    }
    if (subcode) {
      return `${metaMsg} (code ${code}/${subcode})`;
    }
    return metaMsg;
  }
}
