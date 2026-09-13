import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MenuCategoryDto, MenuItemDto } from '@tablebite/types';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getPublicMenu(branchSlug: string, restaurantSlug?: string) {
    const branch = await this.prisma.branch.findFirst({
      where: restaurantSlug
        ? { slug: branchSlug, restaurant: { slug: restaurantSlug } }
        : { slug: branchSlug },
      include: {
        restaurant: true,
        menuCategories: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              include: { images: { orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });

    if (!branch) throw new NotFoundException('Branch not found');

    return {
      branch: { id: branch.id, name: branch.name, slug: branch.slug },
      restaurant: { id: branch.restaurant.id, name: branch.restaurant.name, slug: branch.restaurant.slug, logoUrl: branch.restaurant.logoUrl },
      categories: branch.menuCategories.map((c) => this.mapCategory(c)),
    };
  }

  async getAdminMenu(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        restaurant: true,
        menuCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              include: { images: { orderBy: { sortOrder: 'asc' } } },
              orderBy: { name: 'asc' },
            },
          },
        },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return {
      branch: { id: branch.id, name: branch.name, slug: branch.slug },
      restaurant: { id: branch.restaurant.id, name: branch.restaurant.name },
      categories: branch.menuCategories.map((c) => this.mapCategory(c)),
    };
  }

  async getItemDetail(itemId: string): Promise<MenuItemDto> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: { options: { where: { isAvailable: true } } },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Item not found');
    return this.mapItem(item);
  }

  async searchItems(query: string, branchId?: string) {
    return this.prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
        ...(branchId ? { category: { branchId } } : {}),
      },
      include: { images: { take: 1 } },
      take: 20,
    });
  }

  async createCategory(data: { name: string; restaurantId?: string; branchId?: string; sortOrder?: number }) {
    return this.prisma.menuCategory.create({ data });
  }

  async updateCategory(id: string, data: Partial<{ name: string; sortOrder: number; isVisible: boolean }>) {
    return this.prisma.menuCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.menuCategory.delete({ where: { id } });
  }

  async createItem(data: { categoryId: string; name: string; description?: string; basePrice: number; dietaryTags?: string[]; isFeatured?: boolean }) {
    return this.prisma.menuItem.create({
      data: { ...data, basePrice: data.basePrice },
    });
  }

  async updateItem(id: string, data: Partial<{ name: string; description: string; basePrice: number; isAvailable: boolean; isFeatured: boolean; dietaryTags: string[] }>) {
    return this.prisma.menuItem.update({ where: { id }, data: data as never });
  }

  async deleteItem(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async toggleAvailability(id: string) {
    const item = await this.prisma.menuItem.findUniqueOrThrow({ where: { id } });
    return this.prisma.menuItem.update({ where: { id }, data: { isAvailable: !item.isAvailable } });
  }

  async createModifierGroup(data: { restaurantId: string; name: string; minSelect?: number; maxSelect?: number; isRequired?: boolean; options: Array<{ name: string; priceDelta?: number }> }) {
    return this.prisma.modifierGroup.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name,
        minSelect: data.minSelect ?? 0,
        maxSelect: data.maxSelect ?? 1,
        isRequired: data.isRequired ?? false,
        options: { create: data.options.map((o) => ({ name: o.name, priceDelta: o.priceDelta ?? 0 })) },
      },
      include: { options: true },
    });
  }

  async linkModifierToItem(menuItemId: string, modifierGroupId: string) {
    return this.prisma.menuItemModifierGroup.create({ data: { menuItemId, modifierGroupId } });
  }

  private mapCategory(c: { id: string; name: string; sortOrder: number; isVisible: boolean; items: unknown[] }): MenuCategoryDto {
    return {
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
      isVisible: c.isVisible,
      items: (c.items as Array<Record<string, unknown>>).map((i) => this.mapItem(i)),
    };
  }

  private mapItem(item: Record<string, unknown>): MenuItemDto {
    const modifierGroups = item.modifierGroups as Array<{ modifierGroup: Record<string, unknown> }> | undefined;
    return {
      id: item.id as string,
      name: item.name as string,
      description: (item.description as string) || null,
      basePrice: Number(item.basePrice),
      currency: item.currency as string,
      isAvailable: item.isAvailable as boolean,
      isFeatured: item.isFeatured as boolean,
      dietaryTags: Array.isArray(item.dietaryTags) ? (item.dietaryTags as string[]) : [],
      images: ((item.images as Array<Record<string, unknown>>) || []).map((img) => ({
        id: img.id as string,
        url: img.url as string,
        altText: (img.altText as string) || null,
      })),
      modifierGroups: modifierGroups?.map((mg) => {
        const g = mg.modifierGroup;
        return {
          id: g.id as string,
          name: g.name as string,
          minSelect: g.minSelect as number,
          maxSelect: g.maxSelect as number,
          isRequired: g.isRequired as boolean,
          options: ((g.options as Array<Record<string, unknown>>) || []).map((o) => ({
            id: o.id as string,
            name: o.name as string,
            priceDelta: Number(o.priceDelta),
            isAvailable: o.isAvailable as boolean,
          })),
        };
      }),
    };
  }
}
