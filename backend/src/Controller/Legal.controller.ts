import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({ path: "Legal", version: '1' })
@ApiTags("Legal")
export class LegalController {

  @Get('Privacy')
  getPrivacyPolicy() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Privacy Policy - Instagram CRM</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
          h1 { color: #8A2BE2; }
        </style>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p>Last updated: April 16, 2026</p>
        <p>This Privacy Policy describes how we handle your information when you use our Instagram CRM automation service.</p>
        
        <h2>1. Information We Collect</h2>
        <p>We receive and process Instagram Direct Messages (DMs) to provide automation and CRM features. This includes message text, sender IDs, and timestamps.</p>
        
        <h2>2. How We Use Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Display conversations in your CRM dashboard.</li>
          <li>Provide AI-powered auto-replies.</li>
          <li>Manage leads and customer interactions.</li>
        </ul>
        
        <h2>3. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data from unauthorized access.</p>
        
        <h2>4. Third-Party Services</h2>
        <p>We interact with the Meta Graph API to receive and send messages. Your data is processed in accordance with Meta's Privacy Policy.</p>
        
        <p>If you have any questions, please contact us at support@example.com.</p>
      </body>
      </html>
    `;
  }

  @Get('Terms')
  getTermsOfService() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Terms of Service - Instagram CRM</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
          h1 { color: #8A2BE2; }
        </style>
      </head>
      <body>
        <h1>Terms of Service</h1>
        <p>Last updated: April 16, 2026</p>
        <p>By using our Instagram CRM, you agree to the following terms:</p>
        
        <h2>1. Compliance with Meta Policies</h2>
        <p>You agree to use this automation tool in full compliance with Meta's Platform Policy and Community Standards.</p>
        
        <h2>2. Prohibited Uses</h2>
        <p>You may not use this tool for spamming, harassment, or any illegal activities.</p>
        
        <h2>3. Disclaimer</h2>
        <p>The service is provided "as is" without any warranties. We are not responsible for any suspension of your Instagram account resulting from the use of automation.</p>
        
        <p>If you have any questions, please contact us at support@example.com.</p>
      </body>
      </html>
    `;
  }
}
