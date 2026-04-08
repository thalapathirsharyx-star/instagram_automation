import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
