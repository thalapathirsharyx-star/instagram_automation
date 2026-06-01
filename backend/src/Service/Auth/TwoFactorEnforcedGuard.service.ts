import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class TwoFactorEnforcedGuard implements CanActivate {
  constructor(
    @Inject("REDIS_CLIENT") private _RedisClient: Redis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only apply to Super Admin users
    if (user?.user_role_code === 'SUPER_ADMIN') {
      const isEnforced = await this._RedisClient.get('system:2fa_enforced') === 'true';
      
      // If 2FA is enforced globally but the user hasn't enabled it
      if (isEnforced && !user.two_factor_enabled) {
        const path = request.route?.path || '';
        // Allow the setup and verification endpoints so they can enable it
        if (path.includes('2fa/setup') || path.includes('2fa/verify') || path.includes('2fa/confirm')) {
          return true;
        }
        throw new ForbiddenException('Two-Factor Authentication is enforced by policy. You must set up and enable 2FA to access this resource.');
      }
    }

    return true;
  }
}
