import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamService } from '@Service/Team.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';

@Controller({ path: "Team", version: '1' })
@ApiTags("Team")
export class TeamController extends JWTAuthController {
  constructor(private _TeamService: TeamService) {
    super();
  }

  @Get('List')
  async GetTeamMembers(@Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    const data = await this._TeamService.getTeamMembers(user.company_id);
    return { Type: ResponseEnum.Success, Success: true, Data: data };
  }

  @Post('Add')
  async AddTeamMember(@Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    
    try {
      const data = await this._TeamService.addTeamMember(user.company_id, body);
      return { Type: ResponseEnum.Success, Message: 'Team member added successfully', data };
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Delete('Remove/:id')
  async RemoveTeamMember(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (!user || !user.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }

    try {
      await this._TeamService.removeTeamMember(user.company_id, id);
      return this.SendResponse(ResponseEnum.Success, "Team member removed successfully");
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }
}
