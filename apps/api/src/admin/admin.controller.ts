import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_superadmin', 'platform_moderator')
export class AdminController {
  constructor(private service: AdminService) {}

  @Post('restaurants/:id/approve')
  approve(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.approveRestaurant(id, req.user.sub);
  }

  @Post('restaurants/:id/reject')
  reject(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.rejectRestaurant(id, req.user.sub);
  }

  @Post('restaurants/:id/deactivate')
  @Roles('platform_superadmin')
  deactivate(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.deactivateRestaurant(id, req.user.sub);
  }

  @Post('restaurants/:id/activate')
  @Roles('platform_superadmin')
  activate(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.activateRestaurant(id, req.user.sub);
  }

  @Patch('commissions')
  @Roles('platform_superadmin')
  updateCommission(@Body() body: { restaurantId: string; rate: number }, @Req() req: { user: { sub: string } }) {
    return this.service.updateCommission(body.restaurantId, body.rate, req.user.sub);
  }

  @Get('analytics')
  getAnalytics() {
    return this.service.getPlatformAnalytics();
  }

  @Get('payouts')
  getPayouts() {
    return this.service.listPayouts();
  }

  @Post('payouts/:id/paid')
  @Roles('platform_superadmin')
  markPayoutPaid(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.markPayoutPaid(id, req.user.sub);
  }

  @Get('audit-logs')
  getAuditLogs(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.getAuditLogs(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 50);
  }
}
