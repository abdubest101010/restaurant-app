'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, ChefHat, Bell } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { OrderDto } from '@tablebite/types';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: CheckCircle },
  { key: 'confirmed', label: 'Confirmed', icon: Clock },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Bell },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDto | null>(null);

  const refreshOrder = useCallback(() => {
    orderApi.get(orderId).then(setOrder);
  }, [orderId]);

  useEffect(() => { refreshOrder(); }, [refreshOrder]);

  useOrderTracking(orderId, () => refreshOrder());

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <Badge status={order.status} className="mt-2" />
        </div>

        <div className="relative mb-8">
          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div key={step.key} className="flex items-center gap-4 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'} ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  {isCurrent && <p className="text-xs text-primary-500">Current status</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Order Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
              <div>
                <span>{item.quantity}x {item.itemNameSnapshot}</span>
                {item.modifiers.map((m) => (
                  <p key={m.id} className="text-xs text-gray-500">+ {m.modifierNameSnapshot}</p>
                ))}
              </div>
              <span>{formatPrice(item.unitPriceSnapshot * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-3 pt-3 border-t">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3 print:hidden">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>Print receipt</Button>
        </div>

        {order.status === 'completed' && (
          <ReviewForm orderId={order.id} />
        )}
      </div>
    </div>
  );
}

function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  if (done) return <p className="mt-6 text-center text-sm text-green-700">Thanks for the review.</p>;

  return (
    <div className="mt-6 rounded-xl border bg-white p-4 print:hidden">
      <h2 className="font-semibold mb-3">Rate this order</h2>
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className={n <= rating ? 'text-primary-500' : 'text-gray-300'}>
            ★
          </button>
        ))}
      </div>
      <textarea className="w-full rounded-lg border p-2 text-sm mb-3" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was it?" />
      <Button
        className="w-full"
        onClick={async () => {
          const { customerApi } = await import('@/lib/api');
          await customerApi.createReview({ orderId, rating, comment });
          setDone(true);
        }}
      >
        Submit review
      </Button>
    </div>
  );
}
