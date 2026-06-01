import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ImpersonationBlockGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.impersonation === true) {
      throw new ForbiddenException('Action denied. This operation is not allowed during client impersonation.');
    }

    return true;
  }
}
