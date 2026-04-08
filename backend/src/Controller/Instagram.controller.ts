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
    // Meta sends events in an 'entry' array
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        for (const messaging of entry.messaging) {
          if (messaging.message && !messaging.message.is_echo) {
            const context: InstagramMessageContext = {
              customer_name: 'IG User', // We can fetch full name later with Profile API
              instagram_handle: messaging.sender.id, // Using Sender ID as handle for now
              message_text: messaging.message.text,
              conversation_history: [],
              tags: [],
              lead_status: 'New',
              last_message_time: new Date(),
              product_context: [], // Default empty context
              auto_reply_settings: {
                is_enabled: true,
                min_delay_ms: 1000,
                max_delay_ms: 3000,
                allow_ai_override: true
              }
            };

            // Real-time processing through our decision engine
            await this._InstagramService.processIncomingMessage(context);
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
    return this.SendResponseData(leads);
  }

  @Get('Messages/:LeadId')
  async Messages(@Param('LeadId') LeadId: string) {
    const messages = await this._InstagramService.getMessagesByLead(LeadId);
    return this.SendResponseData(messages);
  }
}
