import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subscription } from '@Database/Table/Admin/subscription';
import { company } from '@Database/Table/Admin/company';
import { LessThan } from 'typeorm';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.debug('Running subscription expiration check...');
    
    try {
      const now = new Date();

      // Find all active subscriptions where the period end is in the past
      const expiredSubscriptions = await subscription.find({
        where: {
          subscription_status: 'active',
          current_period_end: LessThan(now)
        }
      });

      if (expiredSubscriptions.length > 0) {
        this.logger.debug(`Found ${expiredSubscriptions.length} expired subscriptions. Processing downgrades...`);
        
        for (const sub of expiredSubscriptions) {
          // Update Subscription Status
          sub.subscription_status = 'expired';
          await subscription.update(sub.id, { subscription_status: 'expired' });

          // Downgrade the Company to Free plan
          const comp = await company.findOne({ where: { id: sub.company_id } });
          if (comp) {
            await company.update(comp.id, { 
              plan: 'Free',
              plan_expires_at: null
            });
            this.logger.log(`Downgraded company ${comp.name} to Free plan due to subscription expiration.`);
          }
        }
      } else {
        this.logger.debug('No expired subscriptions found.');
      }
    } catch (error) {
      this.logger.error('Failed to process subscription expirations', error);
    }
  }
}
