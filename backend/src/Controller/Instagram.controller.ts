import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { InstagramService } from '@Service/Instagram.service';
import { InstagramMessageContext } from '@Model/Instagram.model';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { AuthBaseController } from './AuthBase.controller';

import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';

@Controller({ path: "Instagram", version: '1' })
@ApiTags("Instagram")
export class InstagramController extends AuthBaseController {

  constructor(
    private _InstagramService: InstagramService,
  ) {
    super()
  }

  // --- PUBLIC ENDPOINTS (META WEBHOOKS & COMPLIANCE) ---

  @Get('Webhook')
  async VerifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const VERIFY_TOKEN = process.env.IG_CRM_VERIFY_TOKEN;
    if (!VERIFY_TOKEN) {
      console.error('[SECURITY] IG_CRM_VERIFY_TOKEN is not configured; refusing webhook verification.');
      throw new HttpException('Webhook not configured', HttpStatus.FORBIDDEN);
    }

    // Meta always sends hub.mode=subscribe, and expects the challenge echoed back verbatim.
    // https://developers.facebook.com/documentation/instagram-platform/webhooks/setup
    const tokenMatches =
      token != null &&
      token.length === VERIFY_TOKEN.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(VERIFY_TOKEN));

    if (mode === 'subscribe' && tokenMatches) {
      return challenge;
    }

    console.error(`[SECURITY] Webhook verification rejected (mode=${mode}).`);
    throw new HttpException('Verification failed', HttpStatus.FORBIDDEN);
  }

  @Post('Webhook')
  async HandleWebhook(@Body() body: any, @Req() req: any) {
    // 1. Verify Webhook Signature (Security)
    const signature = req.headers['x-hub-signature-256'];
    const appSecret = process.env.FB_APP_SECRET;

    if (!appSecret) {
      console.error('[SECURITY] FB_APP_SECRET is not configured; cannot verify webhook signatures.');
      throw new HttpException('Webhook not configured', HttpStatus.FORBIDDEN);
    }

    if (!signature || !req.rawBody) {
      console.error('[SECURITY] Webhook received without signature or rawBody.');
      throw new HttpException('Missing signature or rawBody', HttpStatus.FORBIDDEN);
    }

    const expectedSignature = `sha256=${crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex')}`;
    // Constant-time comparison: a plain !== leaks the expected digest byte by byte.
    const signatureValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!signatureValid) {
      console.error('[SECURITY] Invalid webhook signature detected!');
      // The bypass is a local debugging aid only; it must never weaken production.
      const bypassAllowed =
        process.env.BYPASS_SIGNATURE === 'true' && process.env.NODE_ENV !== 'production';
      if (!bypassAllowed) {
        throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
      }
      console.warn('[SECURITY] BYPASS_SIGNATURE is enabled in a non-production environment.');
    }

    // Payloads carry message bodies and Instagram user ids. Log only the event shape, so
    // customer content never lands in server logs or a screenshared console during review.
    console.log(
      `[WEBHOOK] object=${body?.object} entries=${Array.isArray(body?.entry) ? body.entry.length : 0}`
    );

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        console.log(`Processing Entry ID: ${entry.id}`);

        // FIRE AND FORGET: do not 'await', so Meta gets its 200 immediately.
        // Each promise MUST carry its own catch — an unhandled rejection terminates the
        // Node process, so one transient Meta or database error would take the whole
        // backend down mid-conversation.
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messaging of entry.messaging) {
            this.processMessagingEvent(messaging, entry.id).catch(err =>
              console.error('[WEBHOOK] Messaging event failed:', err?.message || err)
            );
          }
        }

        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            this.processChangeEvent(change, entry.id).catch(err =>
              console.error('[WEBHOOK] Change event failed:', err?.message || err)
            );
          }
        }
      }
    }
    // Meta requires a fast 200 OK response to prevent retries
    return { status: 'EVENT_RECEIVED' };
  }

  /**
   * Meta User Data Deletion Callback.
   *
   * Meta POSTs a `signed_request` identifying the Facebook user who asked for deletion.
   * The signature must be verified with the app secret, and the data must actually be
   * deleted — returning a confirmation code without deleting anything misrepresents
   * compliance. https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
   */
  @Post('DataDeletion')
  async DataDeletion(@Body() body: any) {
    const payload = this.parseSignedRequest(body?.signed_request);
    if (!payload?.user_id) {
      console.error('[DATA DELETION] Rejected request with missing or invalid signed_request.');
      throw new HttpException('Invalid signed_request', HttpStatus.BAD_REQUEST);
    }

    const result = await this._InstagramService.handleMetaDataDeletion(payload.user_id);
    console.log(`[DATA DELETION] Completed for Meta user ${payload.user_id}: ${result.confirmation_code}`);

    return {
      url: `${(process.env.DOMAIN_NAME || 'https://flazly.in').replace(/\/+$/, '')}/data-deletion`,
      confirmation_code: result.confirmation_code
    };
  }

  /**
   * Meta App Deauthorization Callback. Fired when an app user removes Flazly from their
   * Facebook settings, at which point the stored token is dead and must be discarded.
   */
  @Post('Deauthorize')
  async Deauthorize(@Body() body: any) {
    const payload = this.parseSignedRequest(body?.signed_request);
    if (!payload?.user_id) {
      console.error('[DEAUTHORIZE] Rejected request with missing or invalid signed_request.');
      throw new HttpException('Invalid signed_request', HttpStatus.BAD_REQUEST);
    }

    await this._InstagramService.handleMetaDeauthorization(payload.user_id);
    console.log(`[DEAUTHORIZE] Cleared Instagram credentials for Meta user ${payload.user_id}`);
    return { status: 'DEAUTHORIZED' };
  }

  /**
   * Verifies and decodes a Meta `signed_request` (base64url "signature.payload",
   * HMAC-SHA256 over the raw payload segment using the app secret).
   * Returns null when the signature does not check out.
   */
  private parseSignedRequest(signedRequest?: string): any | null {
    const appSecret = process.env.FB_APP_SECRET;
    if (!signedRequest || !appSecret) return null;

    const [encodedSig, encodedPayload] = signedRequest.split('.');
    if (!encodedSig || !encodedPayload) return null;

    try {
      const expected = crypto
        .createHmac('sha256', appSecret)
        .update(encodedPayload)
        .digest();
      const provided = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

      if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        console.error('[SIGNED REQUEST] Signature mismatch.');
        return null;
      }

      const json = Buffer.from(
        encodedPayload.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString('utf8');
      return JSON.parse(json);
    } catch (err: any) {
      console.error('[SIGNED REQUEST] Could not decode:', err.message);
      return null;
    }
  }

  // --- PROTECTED ENDPOINTS (DASHBOARD & CRM) ---

  @UseGuards(JwtAuthGuard)
  @Post('Connect')
  async Connect(@Body() body: { token: string; pageId?: string }, @Req() req: any) {
    if (!body?.token) {
      throw new HttpException('A Facebook access token is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this._InstagramService.linkInstagramAccount(
        req.user?.company_id,
        body.token,
        body.pageId
      );
      return this.SendResponseData(result);
    } catch (err: any) {
      // When the user administers several eligible Pages we cannot guess which one they
      // mean; hand the list back so the UI can ask.
      if (err?.choices) {
        return {
          Success: false,
          Message: err.message,
          Data: { requires_page_selection: true, choices: err.choices }
        };
      }
      throw err;
    }
  }

  /**
   * A human agent takes over a conversation. While held, the automation engine stops
   * replying and outbound messages are attributed to this agent.
   */
  @UseGuards(JwtAuthGuard)
  @Post('Leads/:leadId/Handoff')
  async ClaimConversation(@Param('leadId') leadId: string, @Req() req: any) {
    const result = await this._InstagramService.claimConversation(
      req.user?.company_id,
      leadId,
      req.user?.user_id
    );
    return this.SendResponseData(result);
  }

  /** Returns a conversation to the automation engine. */
  @UseGuards(JwtAuthGuard)
  @Post('Leads/:leadId/Release')
  async ReleaseConversation(@Param('leadId') leadId: string, @Req() req: any) {
    const result = await this._InstagramService.releaseConversation(req.user?.company_id, leadId);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('Disconnect')
  async Disconnect(@Req() req: any) {
    const result = await this._InstagramService.disconnectInstagramAccount(req.user?.company_id);
    return this.SendResponseData(result);
  }

  /**
   * Self-serve data erasure. Backs the "Delete Account & Purge Data" action that the
   * published data-deletion instructions tell users (and Meta reviewers) to use.
   */
  @UseGuards(JwtAuthGuard)
  @Post('PurgeData')
  async PurgeData(@Req() req: any) {
    const companyId = req.user?.company_id;
    if (!companyId) {
      throw new HttpException('No workspace is associated with this account', HttpStatus.BAD_REQUEST);
    }
    const result = await this._InstagramService.purgeCompanyData(companyId);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('Settings')
  async UpdateSettings(@Body() data: any, @Req() req: any) {
    const result = await this._InstagramService.updateIntegrationSettings(req.user?.company_id, data);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('Welcome')
  async SetWelcome(@Body('message') message: string, @Req() req: any) {
    const result = await this._InstagramService.updateWelcomeMessage(req.user?.company_id, message);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('Settings')
  async GetSettings(@Req() req: any) {
    const result = await this._InstagramService.getIntegrationSettings(req.user?.company_id);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('Process')
  async Process(@Body() context: InstagramMessageContext) {
    const result = await this._InstagramService.processIncomingMessage(context);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('Leads')
  async Leads(@Req() req: any, @Query('qualified') qualified?: string) {
    let isQualified: boolean | undefined = undefined;
    if (qualified === 'true') isQualified = true;
    if (qualified === 'false') isQualified = false;
    
    console.log(`[DEBUG] Fetching leads for company: ${req.user?.company_id}, isQualified: ${isQualified}`);
    const leads = await this._InstagramService.getAllLeads(req.user?.company_id, isQualified);
    return { Data: leads };
  }

  @UseGuards(JwtAuthGuard)
  @Get('Messages/:LeadId')
  async Messages(@Param('LeadId') LeadId: string, @Req() req: any) {
    const messages = await this._InstagramService.getMessagesByLead(LeadId, req.user?.company_id);
    return { Data: messages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('SendMessage')
  async SendMessage(@Body() body: { leadId: string, text: string }, @Req() req: any) {
    if (!body?.text?.trim()) {
      throw new HttpException('Message text is required', HttpStatus.BAD_REQUEST);
    }
    const result = await this._InstagramService.sendManualMessage(
      req.user?.company_id,
      body.leadId,
      body.text.trim(),
      req.user?.user_id
    );
    return { Success: true, Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('Balance')
  async Balance(@Req() req: any) {
    const balance = await this._InstagramService.getWalletBalance(req.user?.company_id);
    return { Data: balance };
  }

  @UseGuards(JwtAuthGuard)
  @Get('KnowledgeBase')
  async GetKnowledge(@Req() req: any) {
    const data = await this._InstagramService.getKnowledgeBase(req.user?.company_id);
    return { Data: data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('KnowledgeBase')
  async CreateKnowledge(@Body() data: any, @Req() req: any) {
    const result = await this._InstagramService.createKnowledgeItem(req.user?.company_id, data);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('KnowledgeBase/Upload')
  @UseInterceptors(FileInterceptor('file'))
  async UploadKnowledge(@UploadedFile() file: any, @Req() req: any) {
    const result = await this._InstagramService.uploadKnowledgeFile(req.user?.company_id, file);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('KnowledgeBase/:id')
  async DeleteKnowledge(@Param('id') id: string, @Req() req: any) {
    const result = await this._InstagramService.deleteKnowledgeItem(req.user?.company_id, id);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Put('KnowledgeBase/:id')
  async UpdateKnowledge(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const result = await this._InstagramService.updateKnowledgeItem(req.user?.company_id, id, data);
    return this.SendResponseData(result);
  }

  // --- PRIVATE HELPERS ---

  private async processMessagingEvent(messaging: any, igBusinessId: string) {
    // Extract text, mid, and senderId safely
    const text = messaging.message?.text;
    const mid = messaging.message?.mid;
    const senderId = messaging.sender?.id;

    if (messaging.message_edit) {
      console.log(`[SKIP] message_edit event (MID: ${messaging.message_edit.mid}). Skipping to prevent duplicate fetch errors.`);
    } else if (messaging.message && !messaging.message.is_echo && senderId && text) {
      // Message bodies are customer content; log only that one arrived.
      console.log(`[NEW MESSAGE] MID ${mid} (${text.length} chars) received.`);
      const storyInfo = messaging.message.reply_to?.story;
      await this._InstagramService.processIncomingMessage(senderId, text, mid, igBusinessId, false, storyInfo);
    } else if (messaging.message && messaging.message.attachments && !messaging.message.is_echo && senderId) {
      const attachment = messaging.message.attachments[0];
      if (attachment.type === 'image') {
        const imageUrl = attachment.payload.url;
        console.log(`[NEW IMAGE] "${imageUrl}" from sender: ${senderId}`);
        await this._InstagramService.processIncomingMessage(senderId, `[IMAGE] ${imageUrl}`, mid, igBusinessId);
      } else if (attachment.type === 'story_mention') {
        const storyUrl = attachment.payload?.url || '';
        console.log(`[STORY MENTION] from sender: ${senderId}`);
        await this._InstagramService.processIncomingMessage(senderId, `[STORY_MENTION] ${storyUrl}`, mid, igBusinessId);
      }
    } else if (messaging.message && messaging.message.is_echo) {
      console.log('[SKIP] Echo (message sent by the page itself)');
    } else {
      console.log('[SKIP] Non-message event (read receipt, delivery receipt, etc.)');
    }
  }

  private async processChangeEvent(change: any, igBusinessId: string) {
    console.log(`[WEBHOOK] change field=${change?.field}`);
    if (change.field === 'messages' && change.value && change.value.message) {
      await this._InstagramService.processIncomingMessage(change.value.sender.id, change.value.message.text, change.value.message.mid, igBusinessId);
    } else if (change.field === 'comments' && change.value && change.value.text) {
      console.log(`[COMMENT WEBHOOK] Comment ${change.value.id} on media ${change.value.media?.id}`);
      await this._InstagramService.processIncomingComment(change.value, igBusinessId);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('Prompt')
  async getPrompt(@Req() req: any) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.getPrompt(companyId);
    return { Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('Prompt')
  async updatePrompt(@Req() req: any, @Body() body: { prompt: string }) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.updatePrompt(companyId, body.prompt);
    return { Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('Playbook')
  async getPlaybook(@Req() req: any) {
    const companyId = req.user.company_id;
    return await this._InstagramService.getPlaybook(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('Playbook')
  async updatePlaybook(@Req() req: any, @Body() body: { steps: any }) {
    const companyId = req.user.company_id;
    return await this._InstagramService.updatePlaybook(companyId, body.steps);
  }

  @UseGuards(JwtAuthGuard)
  @Get('CommentTriggers')
  async getCommentTriggers(@Req() req: any) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.getCommentTriggers(companyId);
    return { Success: true, Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('CommentTriggers')
  async createCommentTrigger(@Req() req: any, @Body() body: any) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.createCommentTrigger(companyId, body);
    return { Success: true, Data: result.Data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('CommentTriggers/:id')
  async deleteCommentTrigger(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.deleteCommentTrigger(companyId, id);
    return { Success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('CommentTriggers/:id/toggle')
  async toggleCommentTrigger(@Req() req: any, @Param('id') id: string) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.toggleCommentTrigger(companyId, id);
    return { Success: true, Data: result.Data };
  }

  // --- COMMENTS MANAGEMENT (instagram_business_manage_comments) ---

  @UseGuards(JwtAuthGuard)
  @Get('Media')
  async getMedia(@Req() req: any, @Query('limit') limit?: number, @Query('after') after?: string) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.getMedia(companyId, limit, after);
    return { Success: true, Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('Media/:mediaId/Comments')
  async getComments(@Req() req: any, @Param('mediaId') mediaId: string, @Query('limit') limit?: number, @Query('after') after?: string) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.getComments(companyId, mediaId, limit, after);
    return { Success: true, Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('Comments/:commentId/Reply')
  async replyToComment(@Req() req: any, @Param('commentId') commentId: string, @Body() body: { message: string }) {
    const companyId = req.user.company_id;
    if (!body?.message?.trim()) {
      throw new HttpException('Reply message is required', HttpStatus.BAD_REQUEST);
    }
    const result = await this._InstagramService.replyToComment(companyId, commentId, body.message.trim());
    return { Success: true, Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('Comments/:commentId/Hide')
  async hideComment(@Req() req: any, @Param('commentId') commentId: string, @Body() body: { hide?: boolean }) {
    const companyId = req.user.company_id;
    const hide = body?.hide !== false;
    const result = await this._InstagramService.hideComment(companyId, commentId, hide);
    return { Success: true, Data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('Comments/:commentId')
  async deleteComment(@Req() req: any, @Param('commentId') commentId: string) {
    const companyId = req.user.company_id;
    const result = await this._InstagramService.deleteComment(companyId, commentId);
    return { Success: true, Data: result };
  }
}
