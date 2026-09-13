'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import type { MenuCategoryDto, MenuItemDto } from '@tablebite/types';

export default function MenuPage() {
  const params = useParams();
  const branchSlug = params.branchSlug as string;
  const { itemCount, addItem, setContext } = useCart();
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [search, setSearch] = useState('');
  const [dietary, setDietary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getMenu(branchSlug)
      .then((data: { categories: MenuCategoryDto[]; restaurant: { name: string }; branch: { id: string } }) => {
        setCategories(data.categories);
        setRestaurantName(data.restaurant.name);
        setBranchId(data.branch.id);
        setContext(data.branch.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [branchSlug, setContext]);

  function handleQuickAdd(item: MenuItemDto) {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.basePrice,
      quantity: 1,
    });
  }

  const filtered = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesDiet = !dietary || item.dietaryTags.includes(dietary);
      return matchesSearch && matchesDiet;
    }),
  })).filter((cat) => cat.items.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header restaurantName={restaurantName} cartCount={itemCount} />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {['', 'vegetarian', 'vegan', 'gluten-free'].map((tag) => (
            <button
              key={tag || 'all'}
              type="button"
              onClick={() => setDietary(tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${dietary === tag ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600'}`}
            >
              {tag || 'All'}
            </button>
          ))}
        </div>

        {filtered.map((category) => (
          <section key={category.id} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{category.name}</h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl border bg-white p-4 shadow-sm">
                  {item.images[0] && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/menu/${branchSlug}/item/${item.id}`}>
                      <h3 className="font-semibold hover:text-primary-500">{item.name}</h3>
                    </Link>
                    {item.description && <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-primary-600">{formatPrice(item.basePrice)}</span>
                      {item.dietaryTags.map((tag) => (
                        <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleQuickAdd(item)} className="self-center flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
