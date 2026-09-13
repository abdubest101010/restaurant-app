'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { orderApi, paymentApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingOrderId = searchParams.get('reorder');
  const { items, branchId, tableId, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
  const [orderType, setOrderType] = useState<'dine_in' | 'pickup'>(tableId ? 'dine_in' : 'pickup');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tax = total * 0.08;
  const grandTotal = total + tax;

  async function handleCheckout() {
    if (!existingOrderId && !branchId) {
      setError('No branch context. Please scan a QR code or open the demo menu first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let orderId = existingOrderId;
      if (!orderId) {
        const order = await orderApi.create({
          branchId,
          tableId: orderType === 'dine_in' ? tableId || undefined : undefined,
          orderType,
          specialInstructions: instructions || undefined,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note,
            modifierOptionIds: item.modifierOptionIds,
          })),
        }) as { id: string };
        orderId = order.id;
      }

      if (paymentMethod === 'cash') {
        await paymentApi.markCash(orderId);
      } else {
        await paymentApi.createIntent(orderId);
      }

      clearCart();
      router.push(`/order/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-4">{error}</div>}
        <div className="rounded-xl border bg-white p-4 mb-6 space-y-2">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
          <div className="flex justify-between"><span>Tax (8%)</span><span>{formatPrice(tax)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span><span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
        <h2 className="font-semibold mb-3">Order type</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['dine_in', 'pickup'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`rounded-lg border p-3 text-sm font-medium ${orderType === type ? 'border-primary-500 bg-primary-50' : ''}`}
            >
              {type === 'dine_in' ? 'Dine in' : 'Pickup'}
            </button>
          ))}
        </div>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="mb-6 w-full rounded-lg border p-3 text-sm"
          rows={2}
          placeholder="Special instructions for the kitchen..."
        />
        <h2 className="font-semibold mb-3">Payment Method</h2>
        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
            <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
            <div>
              <span className="font-medium">Pay with Card</span>
              <p className="text-xs text-gray-500">Stripe test mode, or local demo confirmation if keys are unset</p>
            </div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
            <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
            <div>
              <span className="font-medium">Pay at Counter</span>
              <p className="text-xs text-gray-500">Pay when your order is ready</p>
            </div>
          </label>
        </div>
        <Button onClick={handleCheckout} disabled={loading || (!existingOrderId && items.length === 0)} className="w-full" size="lg">
          {loading ? 'Processing...' : `Place Order — ${formatPrice(grandTotal)}`}
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
