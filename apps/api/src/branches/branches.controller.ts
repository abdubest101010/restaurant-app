import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('branches')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'platform_superadmin')
  create(@Body() body: { restaurantId: string; name: string; slug: string; timezone?: string; address?: string; phone?: string }) {
    return this.service.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  update(@Param('id') id: string, @Body() body: Record<string, string>) {
    return this.service.update(id, body);
  }

  @Patch(':id/hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  updateHours(@Param('id') id: string, @Body() body: { hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }> }) {
    return this.service.updateHours(id, body.hours);
  }

  @Post(':id/tables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  createTable(@Param('id') id: string, @Body() body: { label: string; area?: string; capacity?: number }) {
    return this.service.createTable(id, body);
  }

  @Get(':id/tables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'waiter')
  getTables(@Param('id') id: string) {
    return this.service.getTables(id);
  }

  @Post(':id/qr-codes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  generateQr(@Param('id') id: string, @Body() body: { tableId?: string }) {
    return this.service.generateQrCode(id, body.tableId);
  }
}
