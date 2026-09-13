'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { customerApi, orderApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { OrderDto } from '@tablebite/types';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) orderApi.history().then((data) => setOrders(data as OrderDto[])).catch(() => undefined);
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || 'My account'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Button variant="outline" onClick={() => { logout(); router.push('/'); }}>Sign out</Button>
        </div>

        <div className="flex gap-3 mb-8">
          <Link href="/account/favorites"><Button variant="secondary" size="sm">Favorites</Button></Link>
          <Link href="/account/addresses"><Button variant="secondary" size="sm">Addresses</Button></Link>
          <Link href="/register-restaurant"><Button variant="outline" size="sm">Register a restaurant</Button></Link>
        </div>

        <h2 className="text-lg font-semibold mb-3">Order history</h2>
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-gray-500">No orders yet. Scan a table QR or browse the demo menu.</p>}
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/order/${order.id}`} className="font-mono text-sm hover:text-primary-600">
                  #{order.id.slice(0, 8)}
                </Link>
                <Badge status={order.status} />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {order.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(', ')}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{formatPrice(order.total)}</span>
                <div className="flex gap-2">
                  <Link href={`/order/${order.id}`}><Button size="sm" variant="outline">Track</Button></Link>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const created = await customerApi.reorder(order.id) as { id: string };
                      router.push(`/checkout?reorder=${created.id}`);
                    }}
                  >
                    Reorder
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
