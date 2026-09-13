'use client';

import { useEffect, useState } from 'react';
import { menuAdminApi } from '@/lib/api';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { Plus, Trash2, Tag, Image as ImageIcon, Sparkles, Check, Flame } from 'lucide-react';

export default function MenuManagementPage() {
  const { branchId, restaurantId } = useDashboardContext();
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      basePrice: number;
      isAvailable: boolean;
      isFeatured?: boolean;
      dietaryTags?: string[];
      images?: Array<{ url: string }>;
    }>;
  }>>([]);
  
  // Add item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemDietary, setNewItemDietary] = useState<string[]>([]);
  const [newItemFeatured, setNewItemFeatured] = useState(false);
  
  // Category form state
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'halal', 'organic'];

  const load = () => {
    if (!branchId) return;
    menuAdminApi.getMenu(branchId).then((data: { categories: typeof categories }) => {
      setCategories(data.categories || []);
      if (data.categories?.[0]) setSelectedCategory((prev) => prev || data.categories[0].id);
    });
  };

  useEffect(() => { load(); }, [branchId]);

  function toggleDietary(tag: string) {
    setNewItemDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory || !newItemName || !newItemPrice) return;
    setIsSubmitting(true);
    try {
      await menuAdminApi.createItem({
        categoryId: selectedCategory,
        name: newItemName,
        description: newItemDesc || undefined,
        basePrice: parseFloat(newItemPrice),
        dietaryTags: newItemDietary,
      });
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDesc('');
      setNewItemImage('');
      setNewItemDietary([]);
      setNewItemFeatured(false);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory) return;
    await menuAdminApi.createCategory({ name: newCategory, branchId, restaurantId });
    setNewCategory('');
    load();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Menu & Product Management</h1>
        <p className="text-sm text-gray-500 mt-1">Create categories, dishes, ingredients, pricing, and dietary labels.</p>
      </div>

      {/* Add Category Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary-500" /> Add New Menu Category
        </h2>
        <form onSubmit={handleAddCategory} className="flex gap-3 max-w-lg">
          <Input
            placeholder="e.g. Chef's Tasting, Woodfired Pizzas, Wine"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-primary-600 hover:bg-primary-700">Add Category</Button>
        </form>
      </div>

      {/* Add Product Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary-500" /> Create New Product / Dish
        </h2>
        
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
              <Input
                placeholder="e.g. Prime Dry-Aged Ribeye"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price (USD)</label>
              <Input
                placeholder="24.99"
                type="number"
                step="0.01"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description & Ingredients</label>
            <textarea
              placeholder="Detailed description for guests, tasting notes, allergens..."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((tag) => {
                const active = newItemDietary.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietary(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                      active ? 'bg-primary-500 text-white border-primary-500 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {active && '✓ '}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting || !newItemName || !newItemPrice} className="bg-primary-600 hover:bg-primary-700 px-6">
              {isSubmitting ? 'Creating...' : 'Publish Product to Menu'}
            </Button>
          </div>
        </form>
      </div>

      {/* Product Catalog Display */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                <p className="text-xs text-gray-500">{cat.items.length} items in category</p>
              </div>
            </div>

            {cat.items.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-3">No products in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between rounded-xl border border-gray-200 p-4 hover:border-primary-200 transition-colors bg-gray-50/50">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md text-sm">
                          {formatPrice(item.basePrice)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {item.dietaryTags && item.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.dietaryTags.map((tag) => (
                            <span key={tag} className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200/80 pt-3 mt-4">
                      <Button
                        variant={item.isAvailable ? 'outline' : 'destructive'}
                        size="sm"
                        className="text-xs font-semibold h-8"
                        onClick={() => menuAdminApi.toggleAvailability(item.id).then(load)}
                      >
                        {item.isAvailable ? 'In Stock (Available)' : 'Sold Out (Unavailable)'}
                      </Button>

                      <button
                        onClick={() => menuAdminApi.deleteItem(item.id).then(load)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
