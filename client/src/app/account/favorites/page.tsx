'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { customerApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function FavoritesPage() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    customerApi.favorites().then((data) => setItems(data as Array<Record<string, unknown>>)).catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>
        {items.length === 0 && <p className="text-gray-500">Heart items from the menu to save them here.</p>}
        <div className="space-y-3">
          {items.map((fav) => {
            const item = fav.menuItem as { id: string; name: string; basePrice: number; description?: string };
            return (
              <div key={fav.id as string} className="flex items-center justify-between rounded-xl border bg-white p-4">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{formatPrice(Number(item.basePrice))}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/menu/main/item/${item.id}`}><Button size="sm">View</Button></Link>
                  <Button size="sm" variant="outline" onClick={() => customerApi.toggleFavorite(item.id).then(() => customerApi.favorites().then(setItems))}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
