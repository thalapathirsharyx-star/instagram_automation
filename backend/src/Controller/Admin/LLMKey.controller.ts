import { Controller, Get, Patch, Body, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JWTAuthController } from '@Controller/JWTAuth.controller';
import { ResponseEnum } from '@Helper/Enum/ResponseEnum';
import { AdminSubRoleGuard, SuperAdminRoles } from '@Service/Auth/AdminSubRoleGuard.service';
import { JwtAuthGuard } from '@Service/Auth/JwtAuthGuard.service';
import { SecurityAlertService } from '@Service/Auth/SecurityAlert.service';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

function getKeysFromEnv() {
  const content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const openai = content.match(/^OPENAI_API_KEY=(.*)$/m)?.[1]?.trim() || process.env.OPENAI_API_KEY || '';
  const gemini = content.match(/^GEMINI_API_KEY=(.*)$/m)?.[1]?.trim() || process.env.GEMINI_API_KEY || '';
  const groq = content.match(/^GROQ_API_KEY=(.*)$/m)?.[1]?.trim() || process.env.GROQ_API_KEY || '';
  return { openai, gemini, groq };
}

function saveKeysToEnv(openai: string, gemini: string, groq: string) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  const updateOrAdd = (key: string, value: string) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      if (content.length > 0 && !content.endsWith('\n')) {
        content += '\n';
      }
      content += `${key}=${value}\n`;
    }
  };

  updateOrAdd('OPENAI_API_KEY', openai);
  updateOrAdd('GEMINI_API_KEY', gemini);
  updateOrAdd('GROQ_API_KEY', groq);

  fs.writeFileSync(envPath, content, 'utf8');

  // Update in-memory immediately for active services
  process.env.OPENAI_API_KEY = openai;
  process.env.GEMINI_API_KEY = gemini;
  process.env.GROQ_API_KEY = groq;
}

function maskKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

@Controller({ path: "Admin/LLMKeys", version: '1' })
@ApiTags("LLM Keys")
export class LLMKeyController extends JWTAuthController {

  constructor(private readonly _SecurityAlertService: SecurityAlertService) {
    super();
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

    const keys = getKeysFromEnv();
    return {
      Type: ResponseEnum.Success,
      Data: {
        openai: maskKey(keys.openai),
        gemini: maskKey(keys.gemini),
        groq: maskKey(keys.groq)
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

    const currentKeys = getKeysFromEnv();
    
    const newOpenai = (body.openai && body.openai.includes('...')) ? currentKeys.openai : body.openai;
    const newGemini = (body.gemini && body.gemini.includes('...')) ? currentKeys.gemini : body.gemini;
    const newGroq = (body.groq && body.groq.includes('...')) ? currentKeys.groq : body.groq;

    saveKeysToEnv(newOpenai, newGemini, newGroq);

    return {
      Type: ResponseEnum.Success,
      Message: 'LLM provider keys updated successfully.'
    };
  }
}
