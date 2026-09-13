import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { BranchesService } from '../branches/branches.service';
import { MenuService } from '../menu/menu.service';
import { hashToken, verifySignature } from '@tablebite/qr';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthService,
    private branches: BranchesService,
    private menu: MenuService,
  ) {}

  async resolveQr(token: string, sig: string) {
    const secret = process.env.QR_TOKEN_SECRET || 'dev-qr-secret';
    const payload = verifySignature(sig, secret);
    if (!payload) throw new BadRequestException('Invalid QR signature');

    const tokenHash = hashToken(token);
    const qrCode = await this.prisma.qrCode.findUnique({
      where: { tokenHash },
      include: {
        branch: { include: { restaurant: true, hours: true } },
        table: true,
      },
    });

    if (!qrCode || !qrCode.isActive) throw new NotFoundException('QR code not found or inactive');
    if (qrCode.tokenVersion !== payload.version) throw new BadRequestException('QR code has been rotated');

    const isOpen = this.branches.isBranchOpen(qrCode.branch.hours);
    const guestToken = await this.auth.issueGuestToken(
      qrCode.branchId,
      qrCode.tableId || undefined,
      qrCode.branch.restaurantId,
    );

    return {
      sessionToken: guestToken,
      branch: {
        id: qrCode.branch.id,
        name: qrCode.branch.name,
        slug: qrCode.branch.slug,
        restaurantId: qrCode.branch.restaurantId,
        timezone: qrCode.branch.timezone,
        address: qrCode.branch.address,
        phone: qrCode.branch.phone,
        status: qrCode.branch.status,
      },
      restaurant: {
        id: qrCode.branch.restaurant.id,
        name: qrCode.branch.restaurant.name,
        slug: qrCode.branch.restaurant.slug,
        status: qrCode.branch.restaurant.status,
        logoUrl: qrCode.branch.restaurant.logoUrl,
        createdAt: qrCode.branch.restaurant.createdAt.toISOString(),
      },
      table: qrCode.table
        ? { id: qrCode.table.id, branchId: qrCode.branchId, label: qrCode.table.label, area: qrCode.table.area, capacity: qrCode.table.capacity, status: qrCode.table.status }
        : undefined,
      isOpen,
    };
  }

  getMenu(branchSlug: string) {
    return this.menu.getPublicMenu(branchSlug);
  }

  getItem(itemId: string) {
    return this.menu.getItemDetail(itemId);
  }

  searchItems(query: string, branchId?: string) {
    return this.menu.searchItems(query, branchId);
  }
}
