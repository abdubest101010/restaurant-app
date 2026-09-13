export interface MenuCategoryDto {
  id: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
  items: MenuItemDto[];
}

export interface MenuItemDto {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  currency: string;
  isAvailable: boolean;
  isFeatured: boolean;
  dietaryTags: string[];
  images: MenuItemImageDto[];
  modifierGroups?: ModifierGroupDto[];
}

export interface MenuItemImageDto {
  id: string;
  url: string;
  altText: string | null;
}

export interface ModifierGroupDto {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: ModifierOptionDto[];
}

export interface ModifierOptionDto {
  id: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface CreateMenuCategoryDto {
  name: string;
  sortOrder?: number;
  branchId?: string;
}

export interface CreateMenuItemDto {
  categoryId: string;
  name: string;
  description?: string;
  basePrice: number;
  dietaryTags?: string[];
  isFeatured?: boolean;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  basePrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  dietaryTags?: string[];
}
