'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

export function useOrderTracking(orderId: string, onStatusChange?: (status: string) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('room:join_order', { orderId });

    socket.on('guest:order_track', (payload: { toStatus: string }) => {
      onStatusChange?.(payload.toStatus);
    });

    socket.on('order:status_changed', (payload: { toStatus: string }) => {
      onStatusChange?.(payload.toStatus);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, onStatusChange]);

  return socketRef;
}

export function useBranchSocket(branchId: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('room:join_branch', { branchId });

    return () => {
      socket.disconnect();
    };
  }, [branchId]);

  return socketRef;
}
