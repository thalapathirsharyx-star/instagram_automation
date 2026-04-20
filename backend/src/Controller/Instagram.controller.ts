import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  @Post('Process')
  async Process(@Body() context: InstagramMessageContext) {
    const result = await this._InstagramService.processIncomingMessage(context);
    return this.SendResponseData(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('Leads')
  async Leads(@Req() req: any) {
    const leads = await this._InstagramService.getAllLeads(req.user?.company_id);
    return { Data: leads };
  }

  @UseGuards(JwtAuthGuard)
  @Get('Messages/:LeadId')
  async Messages(@Param('LeadId') LeadId: string, @Req() req: any) {
    const messages = await this._InstagramService.getMessagesByLead(LeadId, req.user?.company_id);
    return { Data: messages };
  }

  @UseGuards(JwtAuthGuard)
  @Get('Balance')
  async Balance(@Req() req: any) {
    const balance = await this._InstagramService.getWalletBalance(req.user?.company_id);
    return { Data: balance };
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
}
