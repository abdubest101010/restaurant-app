'use client';

import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { useBranchSocket } from '@/hooks/useOrderTracking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

const COLUMNS = ['placed', 'confirmed', 'preparing', 'ready'];

export default function DashboardPage() {
  const { ctx, loading: ctxLoading, branchId } = useDashboardContext();
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);

  const loadOrders = useCallback(() => {
    if (!branchId) return;
    dashboardApi.getOrders(branchId).then(setOrders);
  }, [branchId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const socketRef = useBranchSocket(branchId);
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on('order:created', loadOrders);
    socket.on('order:status_changed', loadOrders);
    return () => { socket.off('order:created', loadOrders); socket.off('order:status_changed', loadOrders); };
  }, [socketRef, loadOrders]);

  async function advanceStatus(orderId: string, status: string) {
    await dashboardApi.updateStatus(orderId, status);
    loadOrders();
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = orders.filter((o) => o.status === col);
    return acc;
  }, {} as Record<string, Array<Record<string, unknown>>>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Orders</h1>
          {ctx?.branchName && <p className="text-sm text-gray-500">{ctx.restaurantName} · {ctx.branchName}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders}>Refresh</Button>
      </div>

      {ctxLoading && <p className="text-sm text-gray-500 mb-4">Loading branch context...</p>}
      {!ctxLoading && !branchId && (
        <div className="rounded-lg bg-yellow-50 p-4 mb-6 text-sm">
          Sign in with a restaurant staff account to load this branch&apos;s orders.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col} className="rounded-xl bg-gray-100 p-3">
            <h2 className="font-semibold capitalize mb-3 flex items-center gap-2">
              {col} <span className="text-xs bg-white rounded-full px-2 py-0.5">{(grouped[col] || []).length}</span>
            </h2>
            <div className="space-y-2">
              {(grouped[col] || []).map((order) => {
                const items = order.items as Array<Record<string, unknown>>;
                const table = order.table as Record<string, string> | null;
                return (
                  <div key={order.id as string} className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono">#{(order.id as string).slice(0, 8)}</span>
                      <Badge status={order.status as string} />
                    </div>
                    {table && <p className="text-xs text-gray-500 mb-1">Table {table.label}</p>}
                    {items?.map((item) => (
                      <p key={item.id as string} className="text-sm">{item.quantity as number}x {item.itemNameSnapshot as string}</p>
                    ))}
                    <p className="font-semibold text-sm mt-2">{formatPrice(Number(order.total))}</p>
                    {col !== 'ready' && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          const next = COLUMNS[COLUMNS.indexOf(col) + 1];
                          if (next) advanceStatus(order.id as string, next);
                        }}
                      >
                        Move to {COLUMNS[COLUMNS.indexOf(col) + 1]}
                      </Button>
                    )}
                    {col === 'ready' && (
                      <Button size="sm" className="w-full mt-2" onClick={() => advanceStatus(order.id as string, 'completed')}>
                        Mark Completed
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
