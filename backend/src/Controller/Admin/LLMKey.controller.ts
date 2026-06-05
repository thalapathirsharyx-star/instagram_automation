import { Controller, Get, Patch, Body, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { AdminSubRoleGuard, SuperAdminRoles } from '@Service/Auth/AdminSubRoleGuard.service';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { SecurityAlertService } from '@Service/Auth/SecurityAlert.service';
import { EncryptionService } from '@Service/Encryption.service';
import { system_setting } from '@Database/Table/Admin/system_setting';

function maskKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

@Controller({ path: "Admin/LLMKeys", version: '1' })
@ApiTags("LLM Keys")
export class LLMKeyController extends JWTAuthController {

  constructor(
    private readonly _SecurityAlertService: SecurityAlertService,
    private readonly _EncryptionService: EncryptionService
  ) {
    super();
  }

  private async getSetting(key: string): Promise<string> {
    const setting = await system_setting.findOne({ where: { setting_key: key } });
    if (!setting || !setting.setting_value) return '';
    try {
      return this._EncryptionService.Decrypt(setting.setting_value);
    } catch {
      return '';
    }
  }

  private async saveSetting(key: string, value: string, description: string) {
    let setting = await system_setting.findOne({ where: { setting_key: key } });
    if (!setting) {
      setting = new system_setting();
      setting.setting_key = key;
      setting.description = description;
    }
    setting.setting_value = this._EncryptionService.Encrypt(value);
    setting.updated_on = new Date();
    await setting.save();
    
    // Also push to process.env so existing services can use it immediately
    process.env[key] = value;
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner', 'Security')
  async GetKeys(@Req() req: any) {
    if (req.user?.user_role_code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform administrators can access LLM provider keys.');
    }
    
    // Send immediate security alert for LLM keys view
    await this._SecurityAlertService.SendAlert(
      'LLM Keys Accessed',
      `Super Admin user ${req.user.email} (sub-role: ${req.user.super_admin_sub_role}) has viewed the platform LLM keys.`
    );

    // Fetch from database, fallback to .env for initial migration
    const openai = await this.getSetting('OPENAI_API_KEY') || process.env.OPENAI_API_KEY || '';
    const gemini = await this.getSetting('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || '';
    const groq = await this.getSetting('GROQ_API_KEY') || process.env.GROQ_API_KEY || '';

    return {
      Type: ResponseEnum.Success,
      Data: {
        openai: maskKey(openai),
        gemini: maskKey(gemini),
        groq: maskKey(groq)
      }
    };
  }

  @Patch('Update')
  @UseGuards(JwtAuthGuard, AdminSubRoleGuard)
  @SuperAdminRoles('Owner', 'Security')
  async UpdateKeys(@Body() body: { openai: string; gemini: string; groq: string }, @Req() req: any) {
    if (req.user?.user_role_code !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only platform administrators can update LLM provider keys.');
    }
    
    // Send immediate security alert for LLM keys update/rotation
    await this._SecurityAlertService.SendAlert(
      'LLM Keys Rotated',
      `Super Admin user ${req.user.email} (sub-role: ${req.user.super_admin_sub_role}) has updated/rotated the platform LLM keys.`
    );

    const currentOpenai = await this.getSetting('OPENAI_API_KEY') || process.env.OPENAI_API_KEY || '';
    const currentGemini = await this.getSetting('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || '';
    const currentGroq = await this.getSetting('GROQ_API_KEY') || process.env.GROQ_API_KEY || '';
    
    const newOpenai = (body.openai && body.openai.includes('...')) ? currentOpenai : body.openai;
    const newGemini = (body.gemini && body.gemini.includes('...')) ? currentGemini : body.gemini;
    const newGroq = (body.groq && body.groq.includes('...')) ? currentGroq : body.groq;

    await this.saveSetting('OPENAI_API_KEY', newOpenai || '', 'Global OpenAI API Key');
    await this.saveSetting('GEMINI_API_KEY', newGemini || '', 'Global Google Gemini API Key');
    await this.saveSetting('GROQ_API_KEY', newGroq || '', 'Global Groq API Key');

    return {
      Type: ResponseEnum.Success,
      Message: 'LLM provider keys updated successfully in the database.'
    };
  }
}
