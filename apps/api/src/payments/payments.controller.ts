import { Controller, Post, Body, Param, Headers, Req, UseGuards, RawBodyRequest } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { CreateIntentDto, MarkCashDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('stripe/create-intent')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  createIntent(@Body() body: CreateIntentDto) {
    return this.service.createPaymentIntent(body.orderId);
  }

  @Post('stripe/webhook')
  webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    return this.service.handleWebhook(req.rawBody as Buffer, signature);
  }

  @Post('cash/mark-due')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  markCashDue(@Body() body: MarkCashDto) {
    return this.service.markCashDue(body.orderId);
  }

  @Post('cash/:id/settle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'waiter')
  settleCash(@Param('id') id: string) {
    return this.service.settleCash(id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  refund(@Param('id') id: string) {
    return this.service.refund(id);
  }
}
