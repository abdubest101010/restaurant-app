'use client';

import { useEffect, useState } from 'react';
import { menuAdminApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';

export default function MenuManagementPage() {
  const { branchId, restaurantId } = useDashboardContext();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; items: Array<{ id: string; name: string; basePrice: number; isAvailable: boolean }> }>>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const load = () => {
    if (!branchId) return;
    menuAdminApi.getMenu(branchId).then((data: { categories: typeof categories }) => {
      setCategories(data.categories);
      if (data.categories[0]) setSelectedCategory((prev) => prev || data.categories[0].id);
    });
  };

  useEffect(() => { load(); }, [branchId]);

  async function handleAddItem() {
    if (!selectedCategory || !newItemName || !newItemPrice) return;
    await menuAdminApi.createItem({
      categoryId: selectedCategory,
      name: newItemName,
      basePrice: parseFloat(newItemPrice),
    });
    setNewItemName('');
    setNewItemPrice('');
    load();
  }

  async function handleAddCategory() {
    if (!newCategory) return;
    await menuAdminApi.createCategory({ name: newCategory, branchId, restaurantId });
    setNewCategory('');
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>

      <div className="rounded-xl border bg-white p-4 mb-4 flex gap-3">
        <Input placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <Button onClick={handleAddCategory}>Add category</Button>
      </div>

      <div className="rounded-xl border bg-white p-4 mb-6">
        <h2 className="font-semibold mb-3">Add New Item</h2>
        <div className="flex gap-3">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Input placeholder="Item name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
          <Input placeholder="Price" type="number" step="0.01" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="w-28" />
          <Button onClick={handleAddItem}>Add</Button>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{cat.name}</h2>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-3 text-sm text-gray-500">{formatPrice(item.basePrice)}</span>
                </div>
                <Button
                  variant={item.isAvailable ? 'outline' : 'destructive'}
                  size="sm"
                  onClick={() => menuAdminApi.toggleAvailability(item.id).then(load)}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
