'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import type { MenuItemDto, ModifierGroupDto } from '@tablebite/types';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, itemCount } = useCart();
  const [item, setItem] = useState<MenuItemDto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');

  useEffect(() => {
    publicApi.getItem(params.itemId as string).then(setItem);
  }, [params.itemId]);

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  }

  function selectModifier(group: ModifierGroupDto, optionId: string) {
    setSelectedModifiers((prev) => ({ ...prev, [group.id]: optionId }));
  }

  function getTotalPrice() {
    if (!item) return 0;
    let total = item.basePrice;
    for (const group of item.modifierGroups || []) {
      const selectedId = selectedModifiers[group.id];
      const option = group.options.find((o) => o.id === selectedId);
      if (option) total += option.priceDelta;
    }
    return total * quantity;
  }

  function handleAddToCart() {
    if (!item) return;
    const modifierOptionIds: string[] = [];
    const modifierNames: string[] = [];
    const modifierPrices: number[] = [];

    for (const group of item.modifierGroups || []) {
      const selectedId = selectedModifiers[group.id];
      const option = group.options.find((o) => o.id === selectedId);
      if (option) {
        modifierOptionIds.push(option.id);
        modifierNames.push(option.name);
        modifierPrices.push(option.priceDelta);
      }
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.basePrice,
      quantity,
      note: note || undefined,
      modifierOptionIds,
      modifierNames,
      modifierPrices,
    });

    router.push(`/menu/${params.branchSlug}`);
  }

  const canAdd = !(item.modifierGroups || []).some(
    (g) => g.isRequired && !selectedModifiers[g.id],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={itemCount} />
      <div className="mx-auto max-w-lg px-4 py-6">
        {item.images[0] && (
          <div className="relative h-64 w-full overflow-hidden rounded-xl mb-6">
            <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { customerApi } = await import('@/lib/api');
              await customerApi.toggleFavorite(item.id);
            }}
          >
            Favorite
          </Button>
        </div>
        {item.description && <p className="text-gray-600 mt-2">{item.description}</p>}
        <p className="text-xl font-semibold text-primary-600 mt-3">{formatPrice(item.basePrice)}</p>

        {(item.modifierGroups || []).map((group) => (
          <div key={group.id} className="mt-6">
            <h3 className="font-semibold mb-2">
              {group.name} {group.isRequired && <span className="text-red-500">*</span>}
            </h3>
            <div className="space-y-2">
              {group.options.map((option) => (
                <label key={option.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={group.id}
                      checked={selectedModifiers[group.id] === option.id}
                      onChange={() => selectModifier(group, option.id)}
                      className="text-primary-500"
                    />
                    <span>{option.name}</span>
                  </div>
                  {option.priceDelta > 0 && <span className="text-sm text-gray-500">+{formatPrice(option.priceDelta)}</span>}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <label className="font-semibold">Special Instructions</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm"
            rows={2}
            placeholder="Any special requests..."
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
            <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleAddToCart} disabled={!canAdd} size="lg">
            Add to Cart — {formatPrice(getTotalPrice())}
          </Button>
        </div>
      </div>
    </div>
  );
}
