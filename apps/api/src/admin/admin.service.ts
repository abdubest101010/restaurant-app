import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async approveRestaurant(id: string, actorId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: { status: 'active' },
    });

    await this.prisma.auditLog.create({
      data: { actorId, action: 'restaurant.approve', entityType: 'restaurant', entityId: id },
    });

    return updated;
  }

  async rejectRestaurant(id: string, actorId: string) {
    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: { status: 'suspended' },
    });
    await this.prisma.auditLog.create({
      data: { actorId, action: 'restaurant.reject', entityType: 'restaurant', entityId: id },
    });
    return updated;
  }

  async updateCommission(restaurantId: string, rate: number, actorId: string) {
    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { commissionRate: rate },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'commission.update',
        entityType: 'restaurant',
        entityId: restaurantId,
        metadata: { rate },
      },
    });
    return updated;
  }

  async getPlatformAnalytics() {
    const [restaurantCount, activeRestaurants, totalOrders, pendingRestaurants] = await Promise.all([
      this.prisma.restaurant.count(),
      this.prisma.restaurant.count({ where: { status: 'active' } }),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.restaurant.count({ where: { status: 'pending' } }),
    ]);

    const revenue = await this.prisma.order.aggregate({
      where: { status: 'completed' },
      _sum: { total: true },
    });

    return {
      restaurants: { total: restaurantCount, active: activeRestaurants, pending: pendingRestaurants },
      orders: { total: totalOrders },
      revenue: { total: Number(revenue._sum.total || 0) },
    };
  }

  async deactivateRestaurant(id: string, actorId: string) {
    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: { status: 'suspended' },
    });
    await this.prisma.auditLog.create({
      data: { actorId, action: 'restaurant.deactivate', entityType: 'restaurant', entityId: id },
    });
    return updated;
  }

  async activateRestaurant(id: string, actorId: string) {
    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: { status: 'active' },
    });
    await this.prisma.auditLog.create({
      data: { actorId, action: 'restaurant.activate', entityType: 'restaurant', entityId: id },
    });
    return updated;
  }

  listPayouts() {
    return this.prisma.payout.findMany({
      include: { restaurant: { select: { id: true, name: true, slug: true, commissionRate: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPayoutPaid(id: string, actorId: string) {
    const updated = await this.prisma.payout.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: { actorId, action: 'payout.paid', entityType: 'payout', entityId: id },
    });
    return updated;
  }

  async getAuditLogs(page = 1, pageSize = 50) {
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: { actor: { select: { id: true, email: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count(),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
