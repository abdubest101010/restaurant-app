'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { restaurantApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterRestaurantPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await restaurantApi.create(form);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Register your restaurant</h1>
        <p className="text-sm text-gray-500 mb-6">Submitted restaurants stay pending until a platform admin approves them.</p>
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-4">{error}</div>}
        <form onSubmit={submit} className="rounded-xl border bg-white p-4 space-y-3">
          <Input placeholder="Restaurant name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} />
          <Input placeholder="URL slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Submitting...' : 'Submit for approval'}</Button>
        </form>
      </div>
    </div>
  );
}
