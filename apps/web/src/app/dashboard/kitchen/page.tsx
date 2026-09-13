'use client';

import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { useBranchSocket } from '@/hooks/useOrderTracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function KitchenPage() {
  const { branchId } = useDashboardContext();
  const [tickets, setTickets] = useState<Array<Record<string, unknown>>>([]);

  const load = useCallback(() => {
    if (branchId) dashboardApi.getKitchen(branchId).then(setTickets);
  }, [branchId]);

  useEffect(() => { load(); }, [load]);

  const socketRef = useBranchSocket(branchId);
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const refresh = () => load();
    socket.on('kitchen:new_order', refresh);
    socket.on('order:status_changed', refresh);
    return () => { socket.off('kitchen:new_order', refresh); socket.off('order:status_changed', refresh); };
  }, [socketRef, load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No active tickets</p>
          <p className="text-sm">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const items = ticket.items as Array<Record<string, unknown>>;
            const table = ticket.table as Record<string, string> | null;
            return (
              <div key={ticket.id as string} className="rounded-xl border-2 border-yellow-400 bg-white p-4">
                <div className="flex justify-between mb-3">
                  <span className="font-bold text-lg">#{(ticket.id as string).slice(0, 8)}</span>
                  <Badge status={ticket.status as string} />
                </div>
                {table && <p className="text-sm text-gray-500 mb-2">Table {table.label}</p>}
                <div className="space-y-2">
                  {items?.map((item) => (
                    <div key={item.id as string} className="flex justify-between items-center border-b pb-2 gap-2">
                      <span className="font-medium">{item.quantity as number}x {item.itemNameSnapshot as string}</span>
                      <div className="flex items-center gap-2">
                        <Badge status={item.status as string} />
                        {item.status !== 'ready' && (
                          <Button size="sm" variant="outline" onClick={() => dashboardApi.updateItemStatus(ticket.id as string, item.id as string, 'ready').then(load)}>
                            Ready
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => dashboardApi.updateStatus(ticket.id as string, 'ready').then(load)}
                >
                  Mark All Ready
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
