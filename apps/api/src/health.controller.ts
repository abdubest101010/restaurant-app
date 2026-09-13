import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import type { HealthResponse } from '@tablebite/types';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: { database: dbOk, redis: false },
    };
  }
}
