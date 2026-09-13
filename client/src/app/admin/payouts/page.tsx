'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Array<Record<string, unknown>>>([]);

  const load = () => adminApi.getPayouts().then(setPayouts);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payout tracking</h1>
      <div className="space-y-3">
        {payouts.length === 0 && <p className="text-gray-500">No payout records yet.</p>}
        {payouts.map((p) => {
          const restaurant = p.restaurant as { name: string };
          return (
            <div key={p.id as string} className="flex items-center justify-between rounded-xl border bg-white p-4">
              <div>
                <p className="font-semibold">{restaurant?.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(p.periodStart as string).toLocaleDateString()} – {new Date(p.periodEnd as string).toLocaleDateString()}
                </p>
                {(p.notes as string) && <p className="text-xs text-gray-400">{p.notes as string}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatPrice(Number(p.amount))}</span>
                <Badge status={p.status as string} />
                {p.status === 'pending' && (
                  <Button size="sm" onClick={() => adminApi.markPayoutPaid(p.id as string).then(load)}>Mark paid</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
