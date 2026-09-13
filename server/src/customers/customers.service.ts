import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
  ) {}

  listFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { menuItem: { include: { images: { take: 1 }, category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleFavorite(userId: string, menuItemId: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!item) throw new NotFoundException('Menu item not found');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_menuItemId: { userId, menuItemId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, menuItemId } });
    return { favorited: true };
  }

  listAddresses(userId: string) {
    return this.prisma.savedAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(
    userId: string,
    data: { label?: string; street: string; city: string; state?: string; zip?: string; country?: string; isDefault?: boolean },
  ) {
    if (data.isDefault) {
      await this.prisma.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.savedAddress.create({
      data: {
        userId,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country || 'US',
        isDefault: Boolean(data.isDefault),
      },
    });
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.prisma.savedAddress.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.savedAddress.delete({ where: { id } });
    return { success: true };
  }

  listReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { menuItem: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReview(userId: string, data: { orderId?: string; menuItemId?: string; rating: number; comment?: string }) {
    if (data.rating < 1 || data.rating > 5) throw new BadRequestException('Rating must be 1-5');
    if (data.orderId) {
      const order = await this.prisma.order.findFirst({ where: { id: data.orderId, customerId: userId } });
      if (!order) throw new BadRequestException('You can only review your own orders');
      if (order.status !== 'completed') throw new BadRequestException('Order must be completed before review');
    }
    return this.prisma.review.create({
      data: {
        userId,
        orderId: data.orderId,
        menuItemId: data.menuItemId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }

  async reorder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: { items: { include: { modifiers: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.orders.create(
      {
        branchId: order.branchId,
        tableId: order.tableId || undefined,
        orderType: order.orderType,
        specialInstructions: order.specialInstructions || undefined,
        items: order.items.map((item) => ({
          menuItemId: item.menuItemId || '',
          quantity: item.quantity,
          note: item.note || undefined,
          modifierOptionIds: item.modifiers.map((m) => m.modifierOptionId).filter(Boolean) as string[],
        })),
      },
      userId,
    );
  }
}
