import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  create(@Body() dto: CreateOrderDto, @Req() req: { user?: { sub: string; type: string } }) {
    const customerId = req.user?.type === 'access' ? req.user.sub : undefined;
    return this.service.create(dto, customerId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  history(@Req() req: { user: { sub: string } }) {
    return this.service.getOrderHistory(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    const order = await this.service.findById(id);
    return { orderId: order.id, status: order.status };
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.service.confirm(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.cancel(id, req.user.sub);
  }
}
