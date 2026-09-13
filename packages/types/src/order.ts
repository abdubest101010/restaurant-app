export type OrderStatus =
  | 'draft'
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine_in' | 'pickup' | 'delivery';

export interface CartItemDto {
  menuItemId: string;
  quantity: number;
  note?: string;
  modifierOptionIds?: string[];
}

export interface CreateOrderDto {
  branchId: string;
  tableId?: string;
  orderType: OrderType;
  items: CartItemDto[];
  specialInstructions?: string;
}

export interface OrderDto {
  id: string;
  branchId: string;
  tableId: string | null;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  serviceFee: number;
  discount: number;
  total: number;
  currency: string;
  specialInstructions: string | null;
  placedAt: string | null;
  items: OrderItemDto[];
  createdAt: string;
}

export interface OrderItemDto {
  id: string;
  itemNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  note: string | null;
  status: string;
  modifiers: OrderItemModifierDto[];
}

export interface OrderItemModifierDto {
  id: string;
  modifierNameSnapshot: string;
  priceDeltaSnapshot: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  note?: string;
}
