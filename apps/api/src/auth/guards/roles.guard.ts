import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '@tablebite/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!user?.roles) throw new ForbiddenException('Insufficient permissions');

    const userRoleCodes = user.roles.map((r) => r.roleCode);
    const hasRole = requiredRoles.some((role) => userRoleCodes.includes(role));

    if (!hasRole) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
