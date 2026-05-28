import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BroadcastService } from '@Service/Broadcast.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { PLAN_LIMITS } from '@Config/PlanLimits';
import { company as CompanyTable } from '@Database/Table/Admin/company';

@Controller({ path: "Broadcast", version: '1' })
@ApiTags("Broadcast")
export class BroadcastController extends JWTAuthController {
  constructor(private _BroadcastService: BroadcastService) {
    super();
  }

  @Get('List')
  async ListBroadcasts(@Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    const data = await this._BroadcastService.listBroadcasts(user.company_id);
    return { Type: ResponseEnum.Success, Success: true, Data: data };
  }

  @Get(':id')
  async GetBroadcast(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    const data = await this._BroadcastService.getBroadcast(user.company_id, id);
    if (!data) return this.SendResponse(ResponseEnum.Error, "Broadcast not found");
    return { Type: ResponseEnum.Success, Success: true, Data: data };
  }

  @Post('Create')
  async CreateBroadcast(@Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    
    const company = await CompanyTable.findOne({ where: { id: user.company_id } });
    const limits = PLAN_LIMITS[company?.plan || 'Free'] || PLAN_LIMITS.Free;
    if (!limits.hasBroadcasts) {
      return this.SendResponse(ResponseEnum.Error, "Broadcasts are not supported on your current plan. Please upgrade to Pro or higher.");
    }

    try {
      const data = await this._BroadcastService.createBroadcast(user.company_id, body);
      return { Type: ResponseEnum.Success, Message: 'Broadcast created', Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Put('Update/:id')
  async UpdateBroadcast(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      const data = await this._BroadcastService.updateBroadcast(user.company_id, id, body);
      return { Type: ResponseEnum.Success, Message: 'Broadcast updated', Data: data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Delete('Delete/:id')
  async DeleteBroadcast(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    try {
      await this._BroadcastService.deleteBroadcast(user.company_id, id);
      return this.SendResponse(ResponseEnum.Success, "Broadcast deleted");
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Post('AudienceCount')
  async GetAudienceCount(@Body() body: { filters: any }, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    const count = await this._BroadcastService.getAudienceCount(user.company_id, body.filters);
    return { Type: ResponseEnum.Success, Success: true, Data: count };
  }

  @Post('Send/:id')
  async SendBroadcast(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }

    const company = await CompanyTable.findOne({ where: { id: user.company_id } });
    const limits = PLAN_LIMITS[company?.plan || 'Free'] || PLAN_LIMITS.Free;
    if (!limits.hasBroadcasts) {
      return this.SendResponse(ResponseEnum.Error, "Broadcasts are not supported on your current plan. Please upgrade to Pro or higher.");
    }

    try {
      const result = await this._BroadcastService.sendBroadcast(user.company_id, id);
      return { Type: ResponseEnum.Success, Message: 'Broadcast sending started', Data: result };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }
}
