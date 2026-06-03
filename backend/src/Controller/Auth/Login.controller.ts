import { Controller, Post, Body, UseGuards, Ip } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { ForgotPasswordModel, ResetPasswordModel, RegisterModel } from '@Model/Admin/User.model';
import { UserLoginModel } from '@Model/Admin/UserLogin.model';
import { UserService } from '@Service/Admin/User.service';
import { AuthService } from '@Service/Auth/Auth.service';
import { AuthBaseController } from '@Controller/AuthBase.controller';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { CurrentUser } from '@Helper/Common.helper';

export class VerifyEmailModel {
  token: string;
}

export class ResendVerificationModel {
  email: string;
}

export class Verify2FaModel {
  token: string;
}

export class Confirm2FaModel {
  temp_token: string;
  totp_code: string;
}

@Controller({ path: "Auth", version: '1' })
@ApiTags("Auth")
export class LoginController extends AuthBaseController {
  constructor(
    private _AuthService: AuthService,
    private _UserService: UserService
  ) {
    super();
  }

  @Post('Login')
  async UserLogin(@Body() UserLogin: UserLoginModel) {
    const result = await this._AuthService.ValidateUser(UserLogin.email, UserLogin.password);
    return { Type: ResponseEnum.Success, Message: 'Login Successfully', result };
  }

  @Post('GoogleLogin')
  async GoogleLogin(@Body() data: { email: string }) {
    const result = await this._AuthService.GoogleLogin(data.email);
    return { Type: ResponseEnum.Success, Message: 'Logged in via Google Successfully', result };
  }

  @Post('Register')
  async Register(@Body() RegisterData: RegisterModel) {
    const result = await this._AuthService.Register(RegisterData);
    return { Type: ResponseEnum.Success, Message: 'Registered Successfully', result };
  }

  @Post('VerifyEmail')
  async VerifyEmail(@Body() data: VerifyEmailModel) {
    const result = await this._AuthService.VerifyEmailToken(data.token);
    return { Type: ResponseEnum.Success, Message: 'Email verified successfully', result };
  }

  @Post('ResendVerification')
  async ResendVerification(@Body() data: ResendVerificationModel) {
    const result = await this._AuthService.ResendVerificationEmail(data.email);
    return { Type: ResponseEnum.Success, Message: 'Verification email sent successfully', result };
  }

  @Post('ForgotPassword')
  async ForgotPassword(@Body() ForgotPasswordData: ForgotPasswordModel) {
    const Result = await this._UserService.ForgotPassword(ForgotPasswordData.email);
    if (Result.status) {
      return this.SendResponse(ResponseEnum.Success, "Forgot password request accepted, please check mail");
    }
    else {
      return this.SendResponse(ResponseEnum.Error, Result.message);
    }
  }

  @Post('ResetPassword')
  async ResetPassword(@Body() ResetPasswordData: ResetPasswordModel) {
    await this._UserService.ResetPassword(ResetPasswordData);
    return this.SendResponse(ResponseEnum.Success, "Password reseted successfully");
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async Setup2FA(@CurrentUser() UserId: string) {
    const result = await this._AuthService.Setup2FA(UserId);
    return { Type: ResponseEnum.Success, Message: '2FA setup initialized', result };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async Verify2FA(@CurrentUser() UserId: string, @Body() data: Verify2FaModel) {
    const result = await this._AuthService.Verify2FA(UserId, data.token);
    return { Type: ResponseEnum.Success, Message: '2FA verified and enabled successfully', result };
  }

  @Post('2fa/confirm')
  async Confirm2FA(@Body() data: Confirm2FaModel, @Ip() ip: string) {
    const result = await this._AuthService.Confirm2FA(data.temp_token, data.totp_code, ip);
    return { Type: ResponseEnum.Success, Message: '2FA confirmed successfully', result };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async Disable2FA(@CurrentUser() UserId: string) {
    const result = await this._AuthService.Disable2FA(UserId);
    return { Type: ResponseEnum.Success, Message: '2FA disabled successfully', result };
  }
}
