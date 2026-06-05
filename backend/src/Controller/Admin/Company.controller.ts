import { Body, Controller, Get, Patch, Put, Post, Req, Param, ForbiddenException, UseGuards } from '@nestjs/common';
import { CompanyModel } from '@Model/Admin/Company.model';
import { CurrentUser } from '@Helper/Common.helper';
import { ApiTags } from '@nestjs/swagger';
import { CompanyService } from '@Service/Admin/Company.service';
import { AuthService } from '@Service/Auth/Auth.service';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { AdminSubRoleGuard, SuperAdminRoles } from '@Service/Auth/AdminSubRoleGuard.service';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { ImpersonationBlockGuard } from '@Service/Auth/ImpersonationBlockGuard.service';
import * as crypto from 'crypto';
import { invoice } from '@Database/Table/Admin/invoice';
import { payment_transaction } from '@Database/Table/Admin/payment_transaction';
import { subscription } from '@Database/Table/Admin/subscription';
const Razorpay = require('razorpay');

@Controller({ path: "Company", version: '1' })
@ApiTags("Company")
export class CompanyController extends JWTAuthController {

  constructor(
    private _CompanyService: CompanyService,
    private _AuthService: AuthService
  ) {
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
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner', 'Support')
  async GetAllForAdmin(@Req() req: any) {
    if (req.user.user_role_code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can access this list');
    }
    return await this._CompanyService.GetAllForAdmin();
  }

  @Patch('Admin/ToggleStatus/:id')
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner')
  async ToggleStatus(@Param('id') id: string, @CurrentUser() UserId: string, @Req() req: any) {
    if (req.user.user_role_code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can manage client status');
    }
    await this._CompanyService.ToggleStatus(id, UserId);
    return this.SendResponse(ResponseEnum.Success, 'Client status updated');
  }

  @Put('UpdatePlan')
  @UseGuards(ImpersonationBlockGuard)
  async UpdatePlan(@Body() body: { plan: string }, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }
    await this._CompanyService.UpdatePlan(user.company_id, body.plan, user.user_id);
    return this.SendResponse(ResponseEnum.Success, `Subscription updated to ${body.plan}`);
  }

  @Post('CreateRazorpayOrder')
  @UseGuards(ImpersonationBlockGuard)
  async CreateRazorpayOrder(@Body() body: { plan: string }, @Req() req: any) {
    if (!req.user?.company_id) {
      return this.SendResponse(ResponseEnum.Error, "No company associated with this account.");
    }

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
        receipt: `rcpt_${String(req.user?.company_id || 'unkn').substring(0,8)}_${Date.now()}`
      });

      return { Type: ResponseEnum.Success, Data: order };
    } catch (err: any) {
      console.error('Razorpay Error:', err);
      return this.SendResponse(ResponseEnum.Error, `Failed to create Razorpay order: ${err?.error?.description || err.message || 'Unknown error'}`);
    }
  }

  @Post('VerifyRazorpayPayment')
  @UseGuards(ImpersonationBlockGuard)
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
      
      // Determine amount for logging based on plan
      let amount = 0;
      if (body.plan === 'Pro') amount = 2499;
      else if (body.plan === 'Business') amount = 5999;

      try {
        // Create Invoice
        const invNumber = `INV-${Date.now()}-${user.company_id.substring(0, 4).toUpperCase()}`;
        const newInvoice = new invoice();
        newInvoice.company_id = user.company_id;
        newInvoice.invoice_number = invNumber;
        newInvoice.amount_due = amount;
        newInvoice.amount_paid = amount;
        newInvoice.currency = 'INR';
        newInvoice.invoice_status = 'paid';
        newInvoice.due_date = new Date();
        newInvoice.created_by_id = user.user_id;
        newInvoice.created_on = new Date();
        const invResult = await invoice.insert(newInvoice);
        newInvoice.id = invResult.identifiers[0].id;

        // Create Transaction
        const newTx = new payment_transaction();
        newTx.company_id = user.company_id;
        newTx.invoice_id = newInvoice.id;
        newTx.amount = amount;
        newTx.currency = 'INR';
        newTx.payment_status = 'succeeded';
        newTx.payment_method = 'razorpay';
        newTx.provider_transaction_id = body.razorpay_payment_id;
        newTx.provider_response = { order_id: body.razorpay_order_id, payment_id: body.razorpay_payment_id };
        newTx.created_by_id = user.user_id;
        newTx.created_on = new Date();
        await payment_transaction.insert(newTx);

        // Create or Update Subscription
        let sub = await subscription.findOne({ where: { company_id: user.company_id } });
        if (!sub) {
          sub = new subscription();
          sub.company_id = user.company_id;
          sub.created_by_id = user.user_id;
          sub.created_on = new Date();
        }
        sub.plan_id = body.plan;
        sub.subscription_status = 'active';
        sub.current_period_start = new Date();
        
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);
        sub.current_period_end = periodEnd;
        sub.payment_provider_subscription_id = body.razorpay_order_id;
        sub.updated_by_id = user.user_id;
        sub.updated_on = new Date();
        
        if (sub.id) {
          await subscription.update(sub.id, sub);
        } else {
          await subscription.insert(sub);
        }
      } catch (err) {
        console.error("Failed to log billing tables:", err);
      }

      return this.SendResponse(ResponseEnum.Success, `Subscription upgraded to ${body.plan} successfully!`);
    } else {
      return this.SendResponse(ResponseEnum.Error, "Payment verification failed. Invalid signature.");
    }
  }

  @Put('AutomationSettings')
  async UpdateAutomationSettings(@Body() body: any, @Req() req: any) {
    const user = req.user;
    if (!user?.company_id) return this.SendResponse(ResponseEnum.Error, "No company associated.");
    
    await this._CompanyService.UpdateAutomationSettings(user.company_id, body, user.user_id);
    return this.SendResponse(ResponseEnum.Success, "Automation settings updated.");
  }

  @Post('Admin/Impersonate/:companyId')
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner', 'Support')
  async Impersonate(@Param('companyId') companyId: string, @CurrentUser() UserId: string) {
    const result = await this._AuthService.Impersonate(UserId, companyId);
    return { Type: ResponseEnum.Success, Message: 'Impersonation session started', result };
  }

  @Get('Invoices')
  @UseGuards(ImpersonationBlockGuard)
  async GetInvoices(@Req() req: any) {
    const user = req.user;
    if (!user?.company_id) return this.SendResponse(ResponseEnum.Error, "No company associated.");

    try {
      const invoices = await invoice.createQueryBuilder('i')
        .where('i.company_id = :companyId', { companyId: user.company_id })
        .orderBy('i.created_on', 'DESC')
        .addSelect('i.created_on')
        .getMany();
      return { Type: ResponseEnum.Success, Data: invoices };
    } catch (err) {
      console.error(err);
      return this.SendResponse(ResponseEnum.Error, "Failed to fetch invoices");
    }
  }
}