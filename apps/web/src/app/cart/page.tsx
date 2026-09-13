'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={0} />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Browse the menu and add some items!</p>
          <Link href="/menu/main"><Button>Browse Menu</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={itemCount} />
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        <div className="space-y-3 mb-6">
          {items.map((item, index) => {
            const modTotal = (item.modifierPrices || []).reduce((s, p) => s + p, 0);
            const lineTotal = (item.price + modTotal) * item.quantity;
            return (
              <div key={index} className="rounded-xl border bg-white p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.modifierNames?.map((name, i) => (
                      <p key={i} className="text-xs text-gray-500">+ {name}</p>
                    ))}
                    {item.note && <p className="text-xs text-gray-400 italic mt-1">{item.note}</p>}
                  </div>
                  <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}>-</Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity + 1)}>+</Button>
                  </div>
                  <span className="font-semibold">{formatPrice(lineTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border bg-white p-4 mb-6">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Tax calculated at checkout</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={clearCart} className="flex-1">Clear</Button>
          <Link href="/checkout" className="flex-1"><Button className="w-full">Checkout</Button></Link>
        </div>
      </div>
    </div>
  );
}
