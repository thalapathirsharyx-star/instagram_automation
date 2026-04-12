import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstagramService } from '@Service/Instagram.service';
import { InstagramMessageContext } from '@Model/Instagram.model';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { AuthBaseController } from './AuthBase.controller';

@Controller({ path: "Instagram", version: '1' })
@ApiTags("Instagram")
export class InstagramController extends AuthBaseController {

  constructor(
    private _InstagramService: InstagramService,
  ) {
    super()
  }

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
        // Log individual entry for debugging
        console.log(`Processing Entry ID: ${entry.id}`);

        // Handle 'messaging' structure
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messaging of entry.messaging) {
            console.log('Messaging event received:', JSON.stringify(messaging));
            
            // Extract text, mid, and senderId safely
            const text = messaging.message?.text;
            const mid = messaging.message?.mid;
            const senderId = messaging.sender?.id;

            if (messaging.message_edit) {
              const editMid = messaging.message_edit.mid;
              const numEdit = messaging.message_edit.num_edit ?? 0;
              if (numEdit === 0) {
                // In Instagram Graph API v25.0, NEW messages in existing threads arrive as
                // message_edit with num_edit: 0 (the "0th version" = original send).
                // We attempt to fetch the content and process as a new inbound message.
                console.log(`[NEW DM via message_edit] num_edit=0, MID: ${editMid}. Attempting content fetch...`);
                await this._InstagramService.processIncomingMessage('FETCH_PENDING', undefined, editMid, entry.id);
              } else {
                // num_edit > 0 means a user genuinely edited an existing message — skip it.
                console.log(`[SKIP] message_edit event (num_edit=${numEdit}, MID: ${editMid}). Actual edit — skipping.`);
              }
            } else if (messaging.message && !messaging.message.is_echo && senderId && text) {
              // This is a real new inbound message with all required data
              console.log(`[NEW MESSAGE] "${text}" from sender: ${senderId}`);
              await this._InstagramService.processIncomingMessage(senderId, text, mid, entry.id);
            } else if (messaging.message && messaging.message.is_echo) {
              console.log('[SKIP] Echo (message sent by the page itself)');
            } else {
              console.log('[SKIP] Non-message event (read receipt, delivery receipt, etc.)');
            }
          }
        }
        
        // Handle 'changes' structure
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            console.log('Change event received:', JSON.stringify(change));
            if (change.field === 'messages' && change.value && change.value.message) {
              console.log(`Message detected in changes: "${change.value.message.text}" from sender: ${change.value.sender.id}`);
              await this._InstagramService.processIncomingMessage(change.value.sender.id, change.value.message.text, change.value.message.mid, entry.id);
            }
          }
        }
      }
    }
    return { status: 'EVENT_RECEIVED' };
  }

  @Post('Process')
  async Process(@Body() context: InstagramMessageContext) {
    const result = await this._InstagramService.processIncomingMessage(context);
    return this.SendResponseData(result);
  }

  @Get('Leads')
  async Leads() {
    const leads = await this._InstagramService.getAllLeads();
    return { Data: leads };
  }

  @Get('Messages/:LeadId')
  async Messages(@Param('LeadId') LeadId: string) {
    const messages = await this._InstagramService.getMessagesByLead(LeadId);
    return { Data: messages };
  }

  @Get('Balance')
  async Balance() {
    const balance = await this._InstagramService.getWalletBalance();
    return { Data: balance };
  }
}
