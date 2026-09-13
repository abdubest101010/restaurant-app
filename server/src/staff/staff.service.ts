import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const STAFF_ROLES = ['owner', 'manager', 'kitchen', 'waiter'];

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async list(restaurantId: string) {
    return this.prisma.userRole.findMany({
      where: { restaurantId, role: { code: { in: STAFF_ROLES } } },
      include: {
        user: { select: { id: true, email: true, displayName: true, status: true } },
        role: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { user: { email: 'asc' } },
    });
  }

  async invite(data: {
    restaurantId: string;
    email: string;
    displayName?: string;
    roleCode: string;
    branchId?: string;
  }) {
    if (!STAFF_ROLES.includes(data.roleCode)) {
      throw new BadRequestException('Invalid staff role');
    }

    const role = await this.prisma.role.findUniqueOrThrow({ where: { code: data.roleCode } });
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: data.restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    let user = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user) {
      const passwordHash = await bcrypt.hash('welcome123', 12);
      user = await this.prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          displayName: data.displayName || data.email.split('@')[0],
          authIdentities: { create: { provider: 'password', passwordHash } },
        },
      });
    }

    const existing = await this.prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id, restaurantId: data.restaurantId },
    });
    if (existing) throw new BadRequestException('Staff member already has this role');

    return this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        restaurantId: data.restaurantId,
        branchId: data.branchId,
      },
      include: {
        user: { select: { id: true, email: true, displayName: true } },
        role: true,
      },
    });
  }

  async remove(userRoleId: string) {
    await this.prisma.userRole.delete({ where: { id: userRoleId } });
    return { success: true };
  }
}
