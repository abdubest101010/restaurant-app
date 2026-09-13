import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from '../realtime/orders.gateway';
import type { CreateOrderDto, OrderDto, OrderStatus } from '@tablebite/types';

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  draft: ['placed', 'cancelled'],
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Optional() private gateway?: OrdersGateway,
  ) {}

  async create(dto: CreateOrderDto, customerId?: string) {
    let subtotal = 0;
    const orderItems: Array<{
      menuItemId: string;
      itemNameSnapshot: string;
      unitPriceSnapshot: number;
      quantity: number;
      note?: string;
      modifiers: Array<{ modifierOptionId?: string; modifierNameSnapshot: string; priceDeltaSnapshot: number }>;
    }> = [];

    for (const cartItem of dto.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: cartItem.menuItemId },
        include: {
          modifierGroups: {
            include: { modifierGroup: { include: { options: true } } },
          },
        },
      });
      if (!menuItem || !menuItem.isAvailable) {
        throw new BadRequestException(`Item ${cartItem.menuItemId} is unavailable`);
      }

      let itemPrice = Number(menuItem.basePrice);
      const modifiers: Array<{ modifierOptionId?: string; modifierNameSnapshot: string; priceDeltaSnapshot: number }> = [];

      if (cartItem.modifierOptionIds?.length) {
        for (const optId of cartItem.modifierOptionIds) {
          for (const mg of menuItem.modifierGroups) {
            const opt = mg.modifierGroup.options.find((o) => o.id === optId);
            if (opt) {
              itemPrice += Number(opt.priceDelta);
              modifiers.push({
                modifierOptionId: opt.id,
                modifierNameSnapshot: opt.name,
                priceDeltaSnapshot: Number(opt.priceDelta),
              });
            }
          }
        }
      }

      subtotal += itemPrice * cartItem.quantity;
      orderItems.push({
        menuItemId: menuItem.id,
        itemNameSnapshot: menuItem.name,
        unitPriceSnapshot: itemPrice,
        quantity: cartItem.quantity,
        note: cartItem.note,
        modifiers,
      });
    }

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const order = await this.prisma.order.create({
      data: {
        branchId: dto.branchId,
        tableId: dto.tableId,
        customerId,
        orderType: dto.orderType,
        status: 'draft',
        subtotal,
        tax,
        total,
        specialInstructions: dto.specialInstructions,
        items: {
          create: orderItems.map((item) => ({
            menuItemId: item.menuItemId,
            itemNameSnapshot: item.itemNameSnapshot,
            unitPriceSnapshot: item.unitPriceSnapshot,
            quantity: item.quantity,
            note: item.note,
            modifiers: { create: item.modifiers },
          })),
        },
      },
      include: { items: { include: { modifiers: true } } },
    });

    const mapped = this.mapOrder(order);
    this.gateway?.emitOrderCreated(order.branchId, {
      orderId: order.id,
      branchId: order.branchId,
      tableId: order.tableId || undefined,
      orderType: order.orderType,
      total: Number(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      timestamp: new Date().toISOString(),
    });
    return mapped;
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { modifiers: true } }, statusEvents: { orderBy: { createdAt: 'desc' } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.mapOrder(order);
  }

  async confirm(id: string) {
    return this.transitionStatus(id, 'placed');
  }

  async cancel(id: string, actorId?: string) {
    return this.transitionStatus(id, 'cancelled', actorId);
  }

  async updateStatus(id: string, status: OrderStatus, actorId?: string, note?: string) {
    return this.transitionStatus(id, status, actorId, note);
  }

  async getOrderHistory(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId, status: { not: 'draft' } },
      include: { items: { include: { modifiers: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return orders.map((o) => this.mapOrder(o));
  }

  private async transitionStatus(id: string, toStatus: OrderStatus, actorId?: string, note?: string) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id } });
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${toStatus}`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: toStatus,
        placedAt: toStatus === 'placed' ? new Date() : order.placedAt,
        statusEvents: {
          create: { fromStatus: order.status, toStatus, actorUserId: actorId, note },
        },
      },
      include: { items: { include: { modifiers: true } } },
    });

    const mapped = this.mapOrder(updated);
    this.gateway?.emitOrderStatusChanged(updated.branchId, updated.id, {
      orderId: updated.id,
      branchId: updated.branchId,
      fromStatus: order.status,
      toStatus,
      timestamp: new Date().toISOString(),
    });
    return mapped;
  }

  async updateItemStatus(orderId: string, itemId: string, status: 'queued' | 'preparing' | 'ready' | 'served' | 'cancelled') {
    const item = await this.prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
    if (!item) throw new NotFoundException('Order item not found');

    await this.prisma.orderItem.update({ where: { id: itemId }, data: { status } });

    const remaining = await this.prisma.orderItem.count({
      where: { orderId, status: { notIn: ['ready', 'served', 'cancelled'] } },
    });
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (remaining === 0 && ['confirmed', 'preparing'].includes(order.status)) {
      return this.transitionStatus(orderId, 'ready');
    }
    if (status === 'preparing' && order.status === 'confirmed') {
      return this.transitionStatus(orderId, 'preparing');
    }
    return this.findById(orderId);
  }

  private mapOrder(order: Record<string, unknown>): OrderDto {
    const items = order.items as Array<Record<string, unknown>>;
    return {
      id: order.id as string,
      branchId: order.branchId as string,
      tableId: (order.tableId as string) || null,
      orderType: order.orderType as OrderDto['orderType'],
      status: order.status as OrderDto['status'],
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      serviceFee: Number(order.serviceFee),
      discount: Number(order.discount),
      total: Number(order.total),
      currency: order.currency as string,
      specialInstructions: (order.specialInstructions as string) || null,
      placedAt: order.placedAt ? (order.placedAt as Date).toISOString() : null,
      createdAt: (order.createdAt as Date).toISOString(),
      items: items.map((item) => ({
        id: item.id as string,
        itemNameSnapshot: item.itemNameSnapshot as string,
        unitPriceSnapshot: Number(item.unitPriceSnapshot),
        quantity: item.quantity as number,
        note: (item.note as string) || null,
        status: item.status as string,
        modifiers: ((item.modifiers as Array<Record<string, unknown>>) || []).map((m) => ({
          id: m.id as string,
          modifierNameSnapshot: m.modifierNameSnapshot as string,
          priceDeltaSnapshot: Number(m.priceDeltaSnapshot),
        })),
      })),
    };
  }
}
