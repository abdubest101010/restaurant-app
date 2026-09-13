import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import type { OrderStatus } from '@tablebite/types';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
  ) {}

  async getLiveOrders(branchId: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        branchId,
        status: status ? (status as OrderStatus) : { in: ['placed', 'confirmed', 'preparing', 'ready'] },
      },
      include: {
        items: { include: { modifiers: true } },
        table: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getKitchenQueue(branchId: string) {
    return this.prisma.order.findMany({
      where: {
        branchId,
        status: { in: ['confirmed', 'preparing'] },
      },
      include: {
        items: { include: { modifiers: true }, where: { status: { not: 'served' } } },
        table: true,
      },
      orderBy: { placedAt: 'asc' },
    });
  }

  async getContext(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true, restaurant: true, branch: true } },
      },
    });

    const staffRole = user.userRoles.find((r) =>
      ['owner', 'manager', 'kitchen', 'waiter'].includes(r.role.code),
    );
    if (!staffRole?.restaurantId) {
      return { restaurantId: null, branchId: null, restaurantName: null, branchName: null, role: null };
    }

    let branch = staffRole.branch;
    if (!branch) {
      branch = await this.prisma.branch.findFirst({
        where: { restaurantId: staffRole.restaurantId, status: 'active' },
      });
    }

    return {
      restaurantId: staffRole.restaurantId,
      restaurantName: staffRole.restaurant?.name || null,
      branchId: branch?.id || null,
      branchName: branch?.name || null,
      branchSlug: branch?.slug || null,
      role: staffRole.role.code,
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, actorId: string, note?: string) {
    return this.orders.updateStatus(orderId, status, actorId, note);
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: 'queued' | 'preparing' | 'ready' | 'served' | 'cancelled',
  ) {
    await this.prisma.orderItem.update({
      where: { id: itemId, orderId },
      data: { status },
    });
    return this.orders.findById(orderId);
  }

  async getAnalytics(branchId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: { branchId, status: 'completed', placedAt: { gte: since } },
      include: { items: true, payments: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.itemNameSnapshot;
        if (!itemCounts[key]) itemCounts[key] = { name: key, count: 0, revenue: 0 };
        itemCounts[key].count += item.quantity;
        itemCounts[key].revenue += Number(item.unitPriceSnapshot) * item.quantity;
      }
    }

    const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 10);

    const cardPayments = orders.filter((o) => o.payments.some((p) => p.provider === 'stripe')).length;
    const cashPayments = orders.filter((o) => o.payments.some((p) => p.provider === 'cash')).length;

    return {
      period: { days, since: since.toISOString() },
      totalRevenue,
      orderCount,
      avgOrderValue,
      topItems,
      paymentMix: { card: cardPayments, cash: cashPayments },
    };
  }
}
