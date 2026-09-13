export interface RestaurantDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  createdAt: string;
}

export interface BranchDto {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  timezone: string;
  address: string | null;
  phone: string | null;
  status: string;
}

export interface CreateRestaurantDto {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
}

export interface CreateBranchDto {
  restaurantId: string;
  name: string;
  slug: string;
  timezone?: string;
  address?: string;
  phone?: string;
}

export interface TableDto {
  id: string;
  branchId: string;
  label: string;
  area: string | null;
  capacity: number;
  status: string;
}

export interface QrResolveResponse {
  sessionId: string;
  branch: BranchDto;
  restaurant: RestaurantDto;
  table?: TableDto;
  isOpen: boolean;
}

export interface BranchHoursDto {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}
