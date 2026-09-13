import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
  }

  async createPaymentIntent(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status !== 'draft') throw new BadRequestException('Order is not in draft status');

    const secret = process.env.STRIPE_SECRET_KEY || '';
    const demoMode = !secret || secret.includes('placeholder') || secret.includes('sk_test_...');

    if (demoMode) {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'stripe',
          providerPaymentId: `demo_${order.id}`,
          amount: order.total,
          status: 'pending',
          currency: order.currency,
        },
      });
      await this.orders.confirm(orderId);
      await this.orders.updateStatus(orderId, 'confirmed');
      return { demoMode: true, clientSecret: null, paymentIntentId: null };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: order.currency.toLowerCase(),
      metadata: { orderId: order.id },
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'stripe',
        providerPaymentId: paymentIntent.id,
        amount: order.total,
        status: 'pending',
        currency: order.currency,
      },
    });

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, demoMode: false };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new BadRequestException('Webhook secret not configured');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.orderId;

      await this.prisma.payment.updateMany({
        where: { providerPaymentId: pi.id },
        data: { status: 'captured', paidAt: new Date() },
      });

      if (orderId) {
        await this.orders.confirm(orderId);
        await this.orders.updateStatus(orderId, 'confirmed');
      }
    }

    return { received: true };
  }

  async markCashDue(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    await this.prisma.payment.create({
      data: {
        orderId,
        provider: 'cash',
        amount: order.total,
        status: 'pending',
        currency: order.currency,
      },
    });

    await this.orders.confirm(orderId);
    return this.orders.findById(orderId);
  }

  async settleCash(paymentId: string) {
    const payment = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    if (payment.provider !== 'cash') throw new BadRequestException('Not a cash payment');

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'captured', paidAt: new Date() },
    });

    return { success: true };
  }

  async refund(paymentId: string) {
    const payment = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    if (!payment.providerPaymentId) throw new BadRequestException('No provider payment ID');

    if (payment.provider === 'stripe') {
      await this.stripe.refunds.create({ payment_intent: payment.providerPaymentId });
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'refunded' },
    });

    return { success: true };
  }
}
