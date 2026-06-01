import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditLogService } from '@Service/Admin/AuditLog.service';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { AuditLogLazyLoadModel } from '@Model/Admin/AuditLog.model';
import { AdminSubRoleGuard, SuperAdminRoles } from '@Service/Auth/AdminSubRoleGuard.service';

@Controller({ path: "AuditLog", version: '1' })
@ApiTags("Audit Log")
@UseGuards(AdminSubRoleGuard)
@SuperAdminRoles('Owner', 'Security', 'Support')
export class AuditLogController extends JWTAuthController {

  constructor(private _AuditLogService: AuditLogService) {
    super()
  }

  @Get('LazyLoadList')
  async LazyLoadList(@Body() AuditLogLazyLoadData: AuditLogLazyLoadModel) {
    const AuditLogListData = await this._AuditLogService.LazyLoadList(AuditLogLazyLoadData);
    return this.SendResponseData({ data: AuditLogListData.data, total: AuditLogListData.total_record });
  }

  @Post('DetailList')
  async DetailList(@Body() EventLog: any) {
    const AuditLogListData = await this._AuditLogService.DetailList(EventLog);
    return this.SendResponseData(AuditLogListData);
  }
}
