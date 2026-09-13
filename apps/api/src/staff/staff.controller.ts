import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private service: StaffService) {}

  @Get()
  @Roles('owner', 'manager')
  list(@Query('restaurantId') restaurantId: string) {
    return this.service.list(restaurantId);
  }

  @Post()
  @Roles('owner')
  invite(
    @Body()
    body: {
      restaurantId: string;
      email: string;
      displayName?: string;
      roleCode: string;
      branchId?: string;
    },
  ) {
    return this.service.invite(body);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
