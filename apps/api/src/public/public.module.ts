import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { AuthModule } from '../auth/auth.module';
import { BranchesModule } from '../branches/branches.module';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [AuthModule, BranchesModule, MenuModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
