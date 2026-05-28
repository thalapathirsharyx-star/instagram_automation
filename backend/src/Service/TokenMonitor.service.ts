import { Injectable, OnModuleInit } from '@nestjs/common';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { IsNull, Not } from 'typeorm';
import axios from 'axios';

/**
 * TokenMonitorService handles two critical background tasks:
 * 1. Token Health Monitoring — periodically validates Facebook Page Access Tokens
 * 2. Monthly AI Usage Reset — auto-resets usage counters at the start of each month
 *
 * Runs on module init with setInterval (no @nestjs/schedule dependency needed).
 */
@Injectable()
export class TokenMonitorService implements OnModuleInit {

  private readonly TOKEN_CHECK_INTERVAL = 6 * 60 * 60 * 1000; // Every 6 hours
  private readonly USAGE_RESET_INTERVAL = 60 * 60 * 1000;      // Every 1 hour

  onModuleInit() {
    console.log('[TOKEN MONITOR] Service initialized. Starting background checks...');

    // Run immediately on startup, then on interval
    this.checkAllTokens();
    this.resetMonthlyUsage();

    setInterval(() => this.checkAllTokens(), this.TOKEN_CHECK_INTERVAL);
    setInterval(() => this.resetMonthlyUsage(), this.USAGE_RESET_INTERVAL);
  }

  /**
   * Validates all stored Facebook Page Access Tokens by calling the debug_token endpoint.
   * Logs warnings for expired or invalid tokens.
   */
  private async checkAllTokens() {
    try {
      const companies = await CompanyTable.find({
        where: {
          instagram_access_token: Not(IsNull()),
          instagram_business_id: Not(IsNull())
        }
      });

      if (companies.length === 0) return;

      const APP_ID = process.env.FB_APP_ID;
      const APP_SECRET = process.env.FB_APP_SECRET;

      if (!APP_ID || !APP_SECRET) {
        console.warn('[TOKEN MONITOR] FB_APP_ID or FB_APP_SECRET not configured. Skipping token checks.');
        return;
      }

      const appToken = `${APP_ID}|${APP_SECRET}`;

      for (const company of companies) {
        try {
          const res = await axios.get('https://graph.facebook.com/v21.0/debug_token', {
            params: {
              input_token: company.instagram_access_token,
              access_token: appToken
            }
          });

          const data = res.data?.data;
          if (!data) continue;

          if (!data.is_valid) {
            console.error(`[TOKEN MONITOR] ❌ INVALID TOKEN for company "${company.name}" (${company.id}). Token has been revoked or expired.`);
            // Future: Send email notification or in-app alert to the user
            continue;
          }

          // Check if token expires within 7 days
          if (data.expires_at && data.expires_at > 0) {
            const expiresAt = new Date(data.expires_at * 1000);
            const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry <= 7) {
              console.warn(`[TOKEN MONITOR] ⚠️ Token for company "${company.name}" expires in ${daysUntilExpiry} days (${expiresAt.toISOString()}). User needs to reconnect.`);
            } else if (daysUntilExpiry <= 30) {
              console.log(`[TOKEN MONITOR] 🔔 Token for company "${company.name}" expires in ${daysUntilExpiry} days.`);
            } else {
              console.log(`[TOKEN MONITOR] ✅ Token for company "${company.name}" is valid (expires in ${daysUntilExpiry} days).`);
            }
          } else {
            // Token does not expire (long-lived page token)
            console.log(`[TOKEN MONITOR] ✅ Token for company "${company.name}" is valid (non-expiring page token).`);
          }

        } catch (err: any) {
          console.error(`[TOKEN MONITOR] Error checking token for company "${company.name}":`, err.response?.data || err.message);
        }
      }
    } catch (err: any) {
      console.error('[TOKEN MONITOR] Fatal error during token check:', err.message);
    }
  }

  /**
   * Checks all companies and resets monthly_ai_usage to 0 if the current month
   * has changed since the last reset. Uses the ai_usage_reset_month column to track state.
   */
  private async resetMonthlyUsage() {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-05"

      const companies = await CompanyTable.find({
        where: {
          instagram_business_id: Not(IsNull())
        }
      });

      for (const company of companies) {
        // If the stored month differs from the current month, reset the counter
        if (company.ai_usage_reset_month !== currentMonth && company.monthly_ai_usage > 0) {
          console.log(`[USAGE RESET] Resetting AI usage for company "${company.name}" (was: ${company.monthly_ai_usage}, month: ${company.ai_usage_reset_month} → ${currentMonth})`);
          company.monthly_ai_usage = 0;
          company.ai_usage_reset_month = currentMonth;
          await CompanyTable.update(company.id, {
            monthly_ai_usage: 0,
            ai_usage_reset_month: currentMonth
          });
        }
      }
    } catch (err: any) {
      console.error('[USAGE RESET] Error during monthly reset:', err.message);
    }
  }
}
