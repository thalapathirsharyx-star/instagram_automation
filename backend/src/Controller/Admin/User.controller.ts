import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards, Inject } from '@nestjs/common';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '@Service/Admin/User.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ChangePasswordModel, UserModel } from '@Model/Admin/User.model';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { AdminSubRoleGuard, SuperAdminRoles } from '@Service/Auth/AdminSubRoleGuard.service';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { Redis } from 'ioredis';

@Controller({ path: "User", version: '1' })
@ApiTags("User")
export class UserController extends JWTAuthController {

  constructor(
    private _UserService: UserService,
    @Inject("REDIS_CLIENT") private _RedisClient: Redis
  ) {
    super()
  }

  @Get('List')
  async List() {
    const UserListData = await this._UserService.GetAllExpectSuperAdmin();
    return this.SendResponseData(UserListData);
  }

  @Get('ById/:Id')
  async ById(@Param('Id') Id: string) {
    const UserData = await this._UserService.GetById(Id);
    return this.SendResponseData(UserData);
  }

  @Post('Insert')
  async Insert(@Body() UserData: UserModel, @CurrentUser() UserId: string) {
    const ResultData = await this._UserService.Insert(UserData, UserId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Created, ResultData.id);
  }

  @Put('Update/:Id')
  async Update(@Param('Id') Id: string, @Body() UserData: UserModel, @CurrentUser() UserId: string) {
    await this._UserService.Update(Id, UserData, UserId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }

  @Patch('SuspendOrActivate/:Id')
  async SuspendOrActivate(@Param('Id') id: string, @CurrentUser() UserId: string) {
    const UserData = await this._UserService.SuspendOrActivate(id, UserId);
    if (UserData.status == true) {
      return this.SendResponse(ResponseEnum.Success, ResponseEnum.Activated);
    }
    else {
      return this.SendResponse(ResponseEnum.Success, ResponseEnum.Suspended);
    }
  }

  @Post('ChangePassword')
  async ChangePassword(@Body() ChangePasswordData: ChangePasswordModel, @CurrentUser() UserId: string) {
    await this._UserService.ChangePassword(UserId, ChangePasswordData);
    return this.SendResponse(ResponseEnum.Success, "Password changed successfully");
  }

  @Put('ResetPassword/:Id')
  async ResetPassword(@Param('Id') Id: string, @Body() UserData: UserModel, @CurrentUser() UserId: string) {
    await this._UserService.UserResetPassword(Id, UserData, UserId);
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Reset);
  }

  @Put('UpdateProfile')
  @UseGuards(JwtAuthGuard)
  async UpdateProfile(@Body() body: { email: string }, @CurrentUser() UserId: string) {
    try {
      await this._UserService.UpdateProfile(UserId, body.email);
      return this.SendResponse(ResponseEnum.Success, "Profile updated successfully");
    } catch (e: any) {
      return this.SendResponse(ResponseEnum.Error, e.message);
    }
  }

  @Post('Admin/Create')
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner')
  async CreateAdmin(@Body() body: any, @CurrentUser() UserId: string) {
    const result = await this._UserService.InsertAdmin(body, UserId);
    return this.SendResponseData(result);
  }

  @Get('Admin/2fa-policy')
  async Get2faPolicy() {
    const enforced = await this._RedisClient.get('system:2fa_enforced') === 'true';
    return { enforced };
  }

  @Patch('Admin/2fa-policy')
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner', 'Security')
  async Toggle2faPolicy(@Body() body: { enforce: boolean }) {
    await this._RedisClient.set('system:2fa_enforced', body.enforce ? 'true' : 'false');
    return { success: true, enforced: body.enforce };
  }
}

