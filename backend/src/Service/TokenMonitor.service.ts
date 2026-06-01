import { Injectable, OnModuleInit } from '@nestjs/common';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { IsNull, Not, LessThan } from 'typeorm';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
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
  private readonly FOLLOW_UP_INTERVAL = 30 * 60 * 1000;      // Every 30 minutes

  onModuleInit() {
    console.log('[TOKEN MONITOR] Service initialized. Starting background checks...');

    // Run immediately on startup, then on interval
    this.checkAllTokens();
    this.resetMonthlyUsage();
    this.processAutoFollowUps();

    setInterval(() => this.checkAllTokens(), this.TOKEN_CHECK_INTERVAL);
    setInterval(() => this.resetMonthlyUsage(), this.USAGE_RESET_INTERVAL);
    setInterval(() => this.processAutoFollowUps(), this.FOLLOW_UP_INTERVAL);
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

  /**
   * Identifies "Hot" leads that haven't responded in the company-configured delay window
   * and automatically sends a customized follow-up DM to re-engage them.
   */
  private async processAutoFollowUps() {
    try {
      const abandonedLeads = await instagram_lead.find({
        where: {
          lead_status: 'Hot',
          follow_up_sent: false
        },
        relations: ['company']
      });

      if (abandonedLeads.length === 0) return;

      for (const lead of abandonedLeads) {
        const company = lead.company;
        if (!company || !company.instagram_access_token || !company.auto_follow_up_enabled) {
          continue;
        }

        // Evaluate dynamic delay time configured by the company (default to 24 hours)
        const delayHours = company.auto_follow_up_delay_hours ?? 24;
        const delayMs = delayHours * 60 * 60 * 1000;
        const lastMessageMs = lead.last_message_time ? new Date(lead.last_message_time).getTime() : 0;
        
        // Skip if the configured delay time has not elapsed yet
        if (Date.now() - lastMessageMs < delayMs) {
          continue;
        }
        
        // Only follow up if the LAST message in the thread was from US (Outbound)
        // meaning they read it but went cold.
        const lastMsg = await instagram_message.findOne({
          where: { lead_id: lead.id },
          order: { created_on: 'DESC' }
        });

        if (lastMsg && lastMsg.direction === 'Outbound') {
          // Use company-configured follow-up message template, with a friendly default fallback
          const followUpText = company.auto_follow_up_message?.trim() || 
            "Hey! Just checking in to see if you had any other questions or needed help with anything?";
          
          const url = `https://graph.facebook.com/v21.0/${company.instagram_page_id || 'me'}/messages`;
          try {
            await axios.post(
              url,
              {
                recipient: { id: lead.instagram_handle },
                message: { text: followUpText }
              },
              {
                headers: { 'Authorization': `Bearer ${company.instagram_access_token}` }
              }
            );

            // Log the message in CRM
            const newMsg = new instagram_message();
            newMsg.company_id = lead.company_id;
            newMsg.lead_id = lead.id;
            newMsg.message_text = followUpText;
            newMsg.direction = 'Outbound';
            newMsg.action_taken = 'AUTO_FOLLOW_UP';
            newMsg.created_by_id = '00000000-0000-0000-0000-000000000000';
            newMsg.created_on = new Date();
            await newMsg.save();

            // Mark as sent so we don't spam them
            lead.follow_up_sent = true;
            await lead.save();

            console.log(`[FOLLOW UP] Sent auto follow-up to lead ${lead.id} using template message.`);
          } catch (err: any) {
            console.error(`[FOLLOW UP ERROR] Failed to send to ${lead.id}:`, err.response?.data || err.message);
          }
        }
      }
    } catch (err: any) {
      console.error('[FOLLOW UP ERROR] Fatal error during process:', err.message);
    }
  }
}
