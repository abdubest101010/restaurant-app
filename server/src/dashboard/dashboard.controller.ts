import { Controller, Get, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import type { OrderStatus } from '@tablebite/types';

class UpdateStatusDto {
  @IsString()
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

class UpdateItemStatusDto {
  @IsIn(['queued', 'preparing', 'ready', 'served', 'cancelled'])
  status!: 'queued' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('context')
  @Roles('owner', 'manager', 'kitchen', 'waiter')
  getContext(@Req() req: { user: { sub: string } }) {
    return this.service.getContext(req.user.sub);
  }

  @Get('orders')
  @Roles('owner', 'manager', 'kitchen', 'waiter')
  getOrders(@Query('branchId') branchId: string, @Query('status') status?: string) {
    return this.service.getLiveOrders(branchId, status);
  }

  @Get('kitchen')
  @Roles('owner', 'manager', 'kitchen')
  getKitchen(@Query('branchId') branchId: string) {
    return this.service.getKitchenQueue(branchId);
  }

  @Patch('orders/:id/status')
  @Roles('owner', 'manager', 'kitchen', 'waiter')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.service.updateOrderStatus(id, body.status, req.user.sub, body.note);
  }

  @Patch('orders/:id/items/:itemId')
  @Roles('owner', 'manager', 'kitchen')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateItemStatusDto,
  ) {
    return this.service.updateItemStatus(id, itemId, body.status);
  }

  @Get('analytics')
  @Roles('owner', 'manager')
  getAnalytics(@Query('branchId') branchId: string, @Query('days') days?: string) {
    return this.service.getAnalytics(branchId, days ? parseInt(days) : 30);
  }
}
