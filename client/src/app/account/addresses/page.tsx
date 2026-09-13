'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerApi } from '@/lib/api';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Array<Record<string, string>>>([]);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', zip: '' });

  const load = () => customerApi.addresses().then(setAddresses);
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await customerApi.createAddress({ ...form, isDefault: addresses.length === 0 });
    setForm({ label: 'Home', street: '', city: '', state: '', zip: '' });
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Saved addresses</h1>
        <form onSubmit={save} className="rounded-xl border bg-white p-4 mb-6 grid gap-3">
          <Input placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <Input placeholder="Street" required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <Input placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </div>
          <Button type="submit">Save address</Button>
        </form>
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
              <div>
                <p className="font-semibold">{a.label || 'Address'}</p>
                <p className="text-sm text-gray-500">{a.street}, {a.city} {a.state} {a.zip}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => customerApi.deleteAddress(a.id).then(load)}>Delete</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
