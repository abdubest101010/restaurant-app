import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller()
export class MenuController {
  constructor(private service: MenuService) {}

  @Get('admin/menu')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'kitchen')
  getAdminMenu(@Query('branchId') branchId: string) {
    return this.service.getAdminMenu(branchId);
  }

  @Post('admin/menu/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  createCategory(@Body() body: { name: string; restaurantId?: string; branchId?: string; sortOrder?: number }) {
    return this.service.createCategory(body);
  }

  @Patch('admin/menu/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateCategory(id, body as never);
  }

  @Delete('admin/menu/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(id);
  }

  @Post('admin/menu/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  createItem(@Body() body: { categoryId: string; name: string; description?: string; basePrice: number; dietaryTags?: string[] }) {
    return this.service.createItem(body);
  }

  @Patch('admin/menu/items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  updateItem(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateItem(id, body as never);
  }

  @Delete('admin/menu/items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  deleteItem(@Param('id') id: string) {
    return this.service.deleteItem(id);
  }

  @Patch('admin/menu/items/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager', 'kitchen')
  toggleAvailability(@Param('id') id: string) {
    return this.service.toggleAvailability(id);
  }

  @Post('admin/menu/modifier-groups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  createModifierGroup(@Body() body: { restaurantId: string; name: string; minSelect?: number; maxSelect?: number; isRequired?: boolean; options: Array<{ name: string; priceDelta?: number }> }) {
    return this.service.createModifierGroup(body);
  }

  @Post('admin/menu/items/:itemId/modifiers/:groupId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'manager')
  linkModifier(@Param('itemId') itemId: string, @Param('groupId') groupId: string) {
    return this.service.linkModifierToItem(itemId, groupId);
  }
}
