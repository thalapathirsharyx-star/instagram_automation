import { Body, Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
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
    const VERIFY_TOKEN = process.env.IG_CRM_VERIFY_TOKEN || 'IG_CRM_VERIFY_TOKEN';
    if (mode && token === VERIFY_TOKEN) {
      return challenge;
    }
    return 'Verification Failed';
  }

  @Post('Webhook')
  async HandleWebhook(@Body() body: any, @Req() req: any) {
    // 1. Verify Webhook Signature (Security)
    const signature = req.headers['x-hub-signature-256'];
    const appSecret = process.env.FB_APP_SECRET;
    
    if (signature && appSecret && req.rawBody) {
      const expectedSignature = `sha256=${crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex')}`;
      if (signature !== expectedSignature) {
        console.error('[SECURITY] Invalid webhook signature detected!');
        console.error(`- Loaded FB_APP_SECRET prefix: ${appSecret.slice(0, 4)}... (length: ${appSecret.length})`);
        console.error(`- Received Header Signature: ${signature}`);
        console.error(`- Computed Expected Signature: ${expectedSignature}`);
        console.error(`- rawBody Type: ${typeof req.rawBody} (isBuffer: ${Buffer.isBuffer(req.rawBody)})`);
        console.error(`- rawBody Length: ${req.rawBody.length}`);
        console.error(`- rawBody Content: "${req.rawBody.toString('utf-8')}"`);
        
        if (process.env.BYPASS_SIGNATURE === 'true') {
          console.warn('[SECURITY WARNING] Bypassing invalid signature check because BYPASS_SIGNATURE=true is set in environment!');
        } else {
          throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
        }
      }
    } else {
      console.warn('[SECURITY WARNING] Webhook received without signature validation. Ensure rawBody is enabled and FB_APP_SECRET is set.');
    }

    // MEGA-LOG: See everything exactly as it arrives
    console.log('--- START WEBHOOK PAYLOAD ---');
    console.log(JSON.stringify(body, null, 2));
    console.log('--- END WEBHOOK PAYLOAD ---');

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        console.log(`Processing Entry ID: ${entry.id}`);

        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messaging of entry.messaging) {
            // FIRE AND FORGET: Do not 'await' so we can respond to Meta immediately
            this.processMessagingEvent(messaging, entry.id);
          }
        }
        
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            this.processChangeEvent(change, entry.id);
          }
        }
      }
    }
    // Meta requires a fast 200 OK response to prevent retries
    return { status: 'EVENT_RECEIVED' };
  }

  /**
   * Meta User Data Deletion Callback
   * Required for Meta App Review compliance.
   */
  @Post('DataDeletion')
  async DataDeletion(@Body() body: any) {
    console.log('--- META DATA DELETION REQUEST ---');
    console.log(body);
    
    // In a production app, you would decode the signed_request here
    // and queue the user's data for deletion.
    
    return {
      url: `${process.env.DOMAIN_NAME || 'https://replyzens.in'}/data-deletion`,
      confirmation_code: `DEL-${Math.random().toString(36).substring(7).toUpperCase()}`
    };
  }

  /**
   * Meta App Deauthorization Callback
   * Required for Meta App Review compliance.
   */
  @Post('Deauthorize')
  async Deauthorize(@Body() body: any) {
    console.log('--- META DEAUTHORIZATION REQUEST ---');
    console.log(body);
    
    // Logic to handle deauthorization (e.g., mark tokens as invalid)
    
    return { status: 'DEAUTHORIZED' };
  }

  // --- PROTECTED ENDPOINTS (DASHBOARD & CRM) ---

  @UseGuards(JwtAuthGuard)
  @Post('Connect')
  async Connect(@Body('token') token: string, @Req() req: any) {
    const result = await this._InstagramService.linkInstagramAccount(req.user?.company_id, token);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('Disconnect')
  async Disconnect(@Req() req: any) {
    const result = await this._InstagramService.disconnectInstagramAccount(req.user?.company_id);
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
    const result = await this._InstagramService.sendManualMessage(req.user?.company_id, body.leadId, body.text);
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

  // --- PRIVATE HELPERS ---

  private async processMessagingEvent(messaging: any, igBusinessId: string) {
    console.log('Messaging event received:', JSON.stringify(messaging));
    
    // Extract text, mid, and senderId safely
    const text = messaging.message?.text;
    const mid = messaging.message?.mid;
    const senderId = messaging.sender?.id;

    if (messaging.message_edit) {
      const editMid = messaging.message_edit.mid;
      const numEdit = messaging.message_edit.num_edit ?? 0;
      if (numEdit === 0) {
        console.log(`[NEW DM via message_edit] num_edit=0, MID: ${editMid}. Attempting content fetch...`);
        await this._InstagramService.processIncomingMessage('FETCH_PENDING', undefined, editMid, igBusinessId);
      } else {
        console.log(`[SKIP] message_edit event (num_edit=${numEdit}, MID: ${editMid}). Actual edit — skipping.`);
      }
    } else if (messaging.message && !messaging.message.is_echo && senderId && text) {
      console.log(`[NEW MESSAGE] "${text}" from sender: ${senderId}`);
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
    console.log('Change event received:', JSON.stringify(change));
    if (change.field === 'messages' && change.value && change.value.message) {
      console.log(`Message detected in changes: "${change.value.message.text}" from sender: ${change.value.sender.id}`);
      await this._InstagramService.processIncomingMessage(change.value.sender.id, change.value.message.text, change.value.message.mid, igBusinessId);
    } else if (change.field === 'comments' && change.value && change.value.text) {
      console.log(`[COMMENT WEBHOOK] Comment detected: "${change.value.text}" on media ID: ${change.value.media?.id}`);
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
}
