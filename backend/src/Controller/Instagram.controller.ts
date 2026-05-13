import { Body, Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { InstagramService } from '@Service/Instagram.service';
import { InstagramMessageContext } from '@Model/Instagram.model';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { AuthBaseController } from './AuthBase.controller';

import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { UseGuards } from '@nestjs/common';

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
    const VERIFY_TOKEN = 'IG_CRM_VERIFY_TOKEN'; // This should ideally be in env
    if (mode && token === VERIFY_TOKEN) {
      return challenge;
    }
    return 'Verification Failed';
  }

  @Post('Webhook')
  async HandleWebhook(@Body() body: any) {
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
      url: `${process.env.DOMAIN_NAME || 'https://replyzens.com'}/data-deletion`,
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
      await this._InstagramService.processIncomingMessage(senderId, text, mid, igBusinessId);
    } else if (messaging.message && messaging.message.attachments && !messaging.message.is_echo && senderId) {
      const attachment = messaging.message.attachments[0];
      if (attachment.type === 'image') {
        const imageUrl = attachment.payload.url;
        console.log(`[NEW IMAGE] "${imageUrl}" from sender: ${senderId}`);
        await this._InstagramService.processIncomingMessage(senderId, `[IMAGE] ${imageUrl}`, mid, igBusinessId);
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
}
