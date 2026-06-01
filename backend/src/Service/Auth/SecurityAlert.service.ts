import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '../Mailer.service';
import { user } from '@Database/Table/Admin/user';

@Injectable()
export class SecurityAlertService {
  private readonly logger = new Logger(SecurityAlertService.name);

  constructor(private readonly _MailerService: MailerService) {}

  async SendAlert(subject: string, message: string) {
    try {
      // Find all Owners
      const owners = await user.createQueryBuilder('u')
        .leftJoinAndSelect('u.user_role', 'ur')
        .where('ur.code = :role', { role: 'SUPER_ADMIN' })
        .andWhere('u.super_admin_sub_role = :subRole', { subRole: 'Owner' })
        .getMany();

      if (owners.length === 0) {
        this.logger.warn('No Super Admin Owners found to receive security alerts.');
        return;
      }

      for (const owner of owners) {
        const mailData = {
          to: owner.email,
          subject: `[SECURITY ALERT] ${subject}`,
          template: message,
          context: {},
          html: false
        };
        await this._MailerService.SendMail(mailData);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send security alert: ${error.message}`);
    }
  }
}
