export const SOCKET_EVENTS = {
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_ITEM_READY: 'order:item_ready',

  // Kitchen events
  KITCHEN_NEW_ORDER: 'kitchen:new_order',
  KITCHEN_ITEM_UPDATE: 'kitchen:item_update',

  // Guest events
  GUEST_ORDER_TRACK: 'guest:order_track',

  // Room join/leave
  JOIN_BRANCH: 'room:join_branch',
  JOIN_ORDER: 'room:join_order',
  LEAVE_ROOM: 'room:leave',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface OrderStatusChangedPayload {
  orderId: string;
  branchId: string;
  fromStatus: string;
  toStatus: string;
  timestamp: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  branchId: string;
  tableId?: string;
  orderType: string;
  total: number;
  itemCount: number;
  timestamp: string;
}

export interface OrderItemReadyPayload {
  orderId: string;
  orderItemId: string;
  itemName: string;
  timestamp: string;
}

export interface JoinBranchPayload {
  branchId: string;
}

export interface JoinOrderPayload {
  orderId: string;
}
