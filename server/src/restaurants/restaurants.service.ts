import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto, ownerId: string) {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        status: 'pending',
        branches: {
          create: {
            name: 'Main Location',
            slug: 'main',
            address: dto.address,
            phone: dto.phone,
            hours: {
              create: Array.from({ length: 7 }, (_, i) => ({
                dayOfWeek: i,
                openTime: '09:00',
                closeTime: '22:00',
              })),
            },
          },
        },
      },
      include: { branches: true },
    });

    const ownerRole = await this.prisma.role.findUniqueOrThrow({ where: { code: 'owner' } });
    await this.prisma.userRole.create({
      data: { userId: ownerId, roleId: ownerRole.id, restaurantId: restaurant.id },
    });

    return restaurant;
  }

  async findById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { branches: true },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findAll(status?: string) {
    return this.prisma.restaurant.findMany({
      where: status ? { status: status as 'pending' | 'active' | 'suspended' } : undefined,
      include: { branches: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
