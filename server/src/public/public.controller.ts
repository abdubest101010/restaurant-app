import { Controller, Get, Param, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private service: PublicService) {}

  @Get('qr/:token')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  resolveQr(@Param('token') token: string, @Query('sig') sig: string) {
    return this.service.resolveQr(token, sig);
  }

  @Get('branches/:slug/menu')
  getMenu(@Param('slug') slug: string) {
    return this.service.getMenu(slug);
  }

  @Get('menu/search')
  search(@Query('q') q: string, @Query('branchId') branchId?: string) {
    return this.service.searchItems(q, branchId);
  }

  @Get('menu/item/:id')
  getItem(@Param('id') id: string) {
    return this.service.getItem(id);
  }
}
