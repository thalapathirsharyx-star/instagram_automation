import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_ROLES_KEY = 'super_admin_roles';
export const SuperAdminRoles = (...roles: ('Owner' | 'Support' | 'Security')[]) => SetMetadata(SUPER_ADMIN_ROLES_KEY, roles);

@Injectable()
export class AdminSubRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<('Owner' | 'Support' | 'Security')[]>(
      SUPER_ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no specific sub-roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // If they aren't even a Super Admin, don't check sub-role restrictions (handled by standard roles)
    if (user?.user_role_code !== 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(user.super_admin_sub_role);
    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Requires one of the following Super Admin sub-roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
