import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateToken, hashToken, signPayload, buildQrUrl, generateQrDataUrl } from '@tablebite/qr';
import type { BranchHoursDto } from '@tablebite/types';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { restaurantId: string; name: string; slug: string; timezone?: string; address?: string; phone?: string }) {
    return this.prisma.branch.create({
      data: {
        ...data,
        hours: {
          create: Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            openTime: '09:00',
            closeTime: '22:00',
          })),
        },
      },
    });
  }

  async findById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { hours: true, restaurant: true },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, data: Partial<{ name: string; address: string; phone: string; timezone: string; status: string }>) {
    return this.prisma.branch.update({ where: { id }, data: data as never });
  }

  async updateHours(branchId: string, hours: BranchHoursDto[]) {
    await this.prisma.branchHours.deleteMany({ where: { branchId } });
    await this.prisma.branchHours.createMany({
      data: hours.map((h) => ({ branchId, ...h })),
    });
    return this.findById(branchId);
  }

  async createTable(branchId: string, data: { label: string; area?: string; capacity?: number }) {
    return this.prisma.restaurantTable.create({
      data: { branchId, label: data.label, area: data.area, capacity: data.capacity || 4 },
    });
  }

  async getTables(branchId: string) {
    return this.prisma.restaurantTable.findMany({
      where: { branchId },
      include: { qrCodes: { where: { isActive: true }, take: 1 } },
      orderBy: { label: 'asc' },
    });
  }

  async generateQrCode(branchId: string, tableId?: string) {
    const branch = await this.findById(branchId);
    const token = generateToken();
    const tokenHash = hashToken(token);

    if (tableId) {
      await this.prisma.qrCode.updateMany({
        where: { tableId, isActive: true },
        data: { isActive: false },
      });
    }

    const qrCode = await this.prisma.qrCode.create({
      data: { branchId, tableId, tokenHash, tokenVersion: 1, isActive: true },
    });

    const secret = process.env.QR_TOKEN_SECRET || 'dev-qr-secret';
    const sig = signPayload({ qrCodeId: qrCode.id, branchId, tableId, version: 1 }, secret);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = buildQrUrl(baseUrl, token, sig);
    const qrImage = await generateQrDataUrl(url);

    return { qrCodeId: qrCode.id, token, url, qrImage, tableId };
  }

  isBranchOpen(hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!todayHours || todayHours.isClosed) return false;

    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }
}
