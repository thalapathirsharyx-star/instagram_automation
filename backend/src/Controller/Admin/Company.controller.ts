import { Body, Controller, Get, Patch, Put, Post, Req, Param, ForbiddenException } from '@nestjs/common';
import { CompanyModel } from '@Model/Admin/Company.model';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { CompanyService } from '@Service/Admin/Company.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Controller({ path: "Company", version: '1' })
@ApiTags("Company")
export class CompanyController extends JWTAuthController {

  constructor(private _CompanyService: CompanyService) {
    super()
  }

  @Get('Get')
  async Get() {
    const EmailData = await this._CompanyService.Get();
    return EmailData;
  }

  @Patch('Update')
  async Update(@Body() CompanyData: CompanyModel, @CurrentUser() UserId: string) {
    if (CompanyData.id > "0") {
      await this._CompanyService.Update(CompanyData.id, CompanyData, UserId);
    }
    else {
      await this._CompanyService.Insert(CompanyData, UserId);
    }
    return this.SendResponse(ResponseEnum.Success, ResponseEnum.Updated);
  }


  @Get('Admin/All')
  async GetAllForAdmin(@Req() req: any) {
    if (req.user.user_role_code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can access this list');
    }
    return await this._CompanyService.GetAllForAdmin();
  }

  @Patch('Admin/ToggleStatus/:id')
  async ToggleStatus(@Param('id') id: string, @CurrentUser() UserId: string, @Req() req: any) {
    if (req.user.user_role_code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can manage client status');
    }
    await this._CompanyService.ToggleStatus(id, UserId);
    return this.SendResponse(ResponseEnum.Success, 'Client status updated');
  }

  @Put('UpdatePlan')
  async UpdatePlan(@Body() body: { plan: string }, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    await this._CompanyService.UpdatePlan(user.company_id, body.plan, user.user_id);
    return this.SendResponse(ResponseEnum.Success, `Subscription updated to ${body.plan}`);
  }

  @Post('CreateRazorpayOrder')
  async CreateRazorpayOrder(@Body() body: { plan: string }, @Req() req: any) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return this.SendResponse(ResponseEnum.Error, 'Razorpay keys are not configured on the server.');
    }

    let amount = 0;
    if (body.plan === 'Pro') amount = 249900; // paise
    else if (body.plan === 'Business') amount = 599900;
    else return this.SendResponse(ResponseEnum.Error, 'Invalid plan selected.');

    try {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await rzp.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: `rcpt_${req.user.company_id.substring(0,8)}_${Date.now()}`
      });

      return { Type: ResponseEnum.Success, Data: order };
    } catch (err: any) {
      console.error('Razorpay Error:', err);
      return this.SendResponse(ResponseEnum.Error, 'Failed to create Razorpay order.');
    }
  }

  @Post('VerifyRazorpayPayment')
  async VerifyRazorpayPayment(@Body() body: {
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    plan: string
  }, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) return this.SendResponse(ResponseEnum.Error, "No company associated.");

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(body.razorpay_order_id + "|" + body.razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature === body.razorpay_signature) {
      await this._CompanyService.UpdatePlan(user.company_id, body.plan, user.user_id);
      return this.SendResponse(ResponseEnum.Success, `Subscription upgraded to ${body.plan} successfully!`);
    } else {
      return this.SendResponse(ResponseEnum.Error, "Payment verification failed. Invalid signature.");
    }
  }

}