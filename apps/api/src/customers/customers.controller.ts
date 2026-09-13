import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get('favorites')
  favorites(@Req() req: { user: { sub: string } }) {
    return this.service.listFavorites(req.user.sub);
  }

  @Post('favorites/:menuItemId')
  toggleFavorite(@Param('menuItemId') menuItemId: string, @Req() req: { user: { sub: string } }) {
    return this.service.toggleFavorite(req.user.sub, menuItemId);
  }

  @Get('addresses')
  addresses(@Req() req: { user: { sub: string } }) {
    return this.service.listAddresses(req.user.sub);
  }

  @Post('addresses')
  createAddress(
    @Body() body: { label?: string; street: string; city: string; state?: string; zip?: string; country?: string; isDefault?: boolean },
    @Req() req: { user: { sub: string } },
  ) {
    return this.service.createAddress(req.user.sub, body);
  }

  @Delete('addresses/:id')
  deleteAddress(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.deleteAddress(req.user.sub, id);
  }

  @Get('reviews')
  reviews(@Req() req: { user: { sub: string } }) {
    return this.service.listReviews(req.user.sub);
  }

  @Post('reviews')
  createReview(
    @Body() body: { orderId?: string; menuItemId?: string; rating: number; comment?: string },
    @Req() req: { user: { sub: string } },
  ) {
    return this.service.createReview(req.user.sub, body);
  }

  @Post('orders/:id/reorder')
  reorder(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.service.reorder(req.user.sub, id);
  }
}
