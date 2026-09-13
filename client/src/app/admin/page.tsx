'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default function AdminOverviewPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setData);
  }, []);

  if (!data) return <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />;

  const restaurants = data.restaurants as { total: number; active: number; pending: number };
  const orders = data.orders as { total: number };
  const revenue = data.revenue as { total: number };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Restaurants</p>
            <p className="text-3xl font-bold">{restaurants.total}</p>
            <p className="text-xs text-gray-400">{restaurants.active} active, {restaurants.pending} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold">{orders.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Platform Revenue</p>
            <p className="text-3xl font-bold">{formatPrice(revenue.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-3xl font-bold text-yellow-600">{restaurants.pending}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
