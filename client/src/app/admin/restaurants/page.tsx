'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Array<Record<string, unknown>>>([]);
  const [filter, setFilter] = useState('');
  const [rates, setRates] = useState<Record<string, string>>({});

  const load = () => adminApi.getRestaurants(filter || undefined).then(setRestaurants);
  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <div className="flex gap-2">
          {['', 'pending', 'active', 'suspended'].map((s) => (
            <Button key={s} variant={filter === s ? 'primary' : 'outline'} size="sm" onClick={() => setFilter(s)}>
              {s || 'All'}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {restaurants.map((r) => (
          <div key={r.id as string} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
            <div>
              <h3 className="font-semibold">{r.name as string}</h3>
              <p className="text-sm text-gray-500">{r.slug as string} · commission {(Number(r.commissionRate) * 100).toFixed(1)}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={r.status as string} />
              {r.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => adminApi.approveRestaurant(r.id as string).then(load)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => adminApi.rejectRestaurant(r.id as string).then(load)}>Reject</Button>
                </>
              )}
              {r.status === 'active' && (
                <Button size="sm" variant="outline" onClick={() => adminApi.deactivateRestaurant(r.id as string).then(load)}>Deactivate</Button>
              )}
              {r.status === 'suspended' && (
                <Button size="sm" onClick={() => adminApi.activateRestaurant(r.id as string).then(load)}>Activate</Button>
              )}
              <Input
                className="w-20"
                placeholder="5%"
                value={rates[r.id as string] ?? ''}
                onChange={(e) => setRates((prev) => ({ ...prev, [r.id as string]: e.target.value }))}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const pct = parseFloat(rates[r.id as string] || '0');
                  if (!Number.isNaN(pct)) adminApi.updateCommission(r.id as string, pct / 100).then(load);
                }}
              >
                Set %
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
