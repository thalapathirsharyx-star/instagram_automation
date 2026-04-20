import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { company } from '@Database/Table/Admin/company';
import { user } from '@Database/Table/Admin/user';

@Controller({ path: "Admin/Stats", version: '1' })
@ApiTags("Admin")
export class AdminStatsController {

  @UseGuards(JwtAuthGuard)
  @Get()
  async GetGlobalStats() {
    // Only fetch if super admin - for now we just return the counts
    const [totalLeads, totalMessages, totalClients, totalUsers] = await Promise.all([
      instagram_lead.count(),
      instagram_message.count(),
      company.count(),
      user.count()
    ]);

    const revenue = await company.createQueryBuilder("c")
      .select("SUM(c.wallet_balance)", "total")
      .getRawOne();

    return {
      Data: {
        totalLeads,
        totalMessages,
        totalClients,
        totalUsers,
        totalRevenue: parseFloat(revenue?.total || '0')
      }
    };
  }
}
