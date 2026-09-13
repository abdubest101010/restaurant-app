'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  const { branchId } = useDashboardContext();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (branchId) dashboardApi.getAnalytics(branchId, 30).then(setData);
  }, [branchId]);

  if (!data) {
    return <div className="text-center py-20 text-gray-500">Sign in as owner or manager to view analytics.</div>;
  }

  const topItems = data.topItems as Array<{ name: string; count: number; revenue: number }>;
  const paymentMix = data.paymentMix as { card: number; cash: number };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics (Last 30 Days)</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold">{formatPrice(data.totalRevenue as number)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-3xl font-bold">{data.orderCount as number}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-3xl font-bold">{formatPrice(data.avgOrderValue as number)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Top Items</h2>
          {topItems?.map((item, i) => (
            <div key={item.name} className="flex justify-between py-2 border-b last:border-0">
              <span>{i + 1}. {item.name} ({item.count}x)</span>
              <span className="font-medium">{formatPrice(item.revenue)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Payment Mix</h2>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Card</span><span>{paymentMix?.card || 0} orders</span></div>
            <div className="flex justify-between"><span>Cash</span><span>{paymentMix?.cash || 0} orders</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
