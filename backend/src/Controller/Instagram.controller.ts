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
            const mid = messaging.message?.mid || messaging.message_edit?.mid;
            const senderId = messaging.sender?.id;

            if (messaging.message && !messaging.message.is_echo && senderId) {
              console.log(`Message detected: "${text}" from sender: ${senderId}`);
              await this._InstagramService.processIncomingMessage(senderId, text, mid);
            } else if (messaging.message_edit && mid) {
              console.log('Message edit event received. Attempting fallback recovery...');
              // If senderId is missing, the service's fetch-fallback will need to handle it
              await this._InstagramService.processIncomingMessage(senderId || 'FETCH_PENDING', text, mid);
            } else if (messaging.message && messaging.message.is_echo) {
              console.log('Ignored Echo (Message sent by us)');
            } else {
              console.log('Non-message event or missing ID (e.g. read/delivery receipt)');
            }
          }
        }
        
        // Handle 'changes' structure
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            console.log('Change event received:', JSON.stringify(change));
            if (change.field === 'messages' && change.value && change.value.message) {
              console.log(`Message detected in changes: "${change.value.message.text}" from sender: ${change.value.sender.id}`);
              await this._InstagramService.processIncomingMessage(change.value.sender.id, change.value.message.text, change.value.message.mid);
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
