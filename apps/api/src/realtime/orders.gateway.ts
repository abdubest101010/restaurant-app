import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS, type OrderStatusChangedPayload, type OrderCreatedPayload } from '@tablebite/realtime';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_BRANCH)
  handleJoinBranch(client: Socket, payload: { branchId: string }) {
    client.join(`branch:${payload.branchId}`);
    return { event: 'joined', room: `branch:${payload.branchId}` };
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ORDER)
  handleJoinOrder(client: Socket, payload: { orderId: string }) {
    client.join(`order:${payload.orderId}`);
    return { event: 'joined', room: `order:${payload.orderId}` };
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(client: Socket, payload: { room: string }) {
    client.leave(payload.room);
  }

  emitOrderCreated(branchId: string, payload: OrderCreatedPayload) {
    this.server.to(`branch:${branchId}`).emit(SOCKET_EVENTS.ORDER_CREATED, payload);
    this.server.to(`branch:${branchId}`).emit(SOCKET_EVENTS.KITCHEN_NEW_ORDER, payload);
  }

  emitOrderStatusChanged(branchId: string, orderId: string, payload: OrderStatusChangedPayload) {
    this.server.to(`branch:${branchId}`).emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, payload);
    this.server.to(`order:${orderId}`).emit(SOCKET_EVENTS.GUEST_ORDER_TRACK, payload);
  }
}
