import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SequenceService } from '@Service/Sequence.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ImpersonationBlockGuard } from '@Service/Auth/ImpersonationBlockGuard.service';

@Controller({ path: "Sequence", version: '1' })
@ApiTags("Sequence")
export class SequenceController extends JWTAuthController {
  constructor(private _SequenceService: SequenceService) {
    super();
  }

  @Get('List')
  async ListSequences(@Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    const data = await this._SequenceService.listSequences(user.company_id);
    return { Type: ResponseEnum.Success, Success: true, Data: data };
  }

  @Get(':id')
  async GetSequence(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      const data = await this._SequenceService.getSequence(user.company_id, id);
      return { Type: ResponseEnum.Success, Success: true, Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Post('Create')
  @UseGuards(ImpersonationBlockGuard)
  async CreateSequence(@Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      const data = await this._SequenceService.createSequence(user.company_id, body);
      return { Type: ResponseEnum.Success, Message: 'Sequence created', Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Put('Update/:id')
  @UseGuards(ImpersonationBlockGuard)
  async UpdateSequence(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      const data = await this._SequenceService.updateSequence(user.company_id, id, body);
      return { Type: ResponseEnum.Success, Message: 'Sequence updated', Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Delete('Delete/:id')
  @UseGuards(ImpersonationBlockGuard)
  async DeleteSequence(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      await this._SequenceService.deleteSequence(user.company_id, id);
      return this.SendResponse(ResponseEnum.Success, "Sequence deleted");
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Post('Activate/:id')
  @UseGuards(ImpersonationBlockGuard)
  async ActivateSequence(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      const result = await this._SequenceService.activateSequence(user.company_id, id);
      return { Type: ResponseEnum.Success, Message: `Sequence activated. Enrolled ${result.new_enrollments} leads.`, Data: result };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }
}
