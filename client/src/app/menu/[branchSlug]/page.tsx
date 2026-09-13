'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Plus, Sparkles, MapPin, Clock, Utensils, Star, Flame } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getMenu(branchSlug)
      .then((data: { categories: MenuCategoryDto[]; restaurant: { name: string }; branch: { id: string } }) => {
        setCategories(data.categories || []);
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
      const matchesCategory = activeCategory === 'all' || cat.id === activeCategory;
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesDiet = !dietary || item.dietaryTags.includes(dietary);
      return matchesCategory && matchesSearch && matchesDiet;
    }),
  })).filter((cat) => cat.items.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          <p className="text-sm font-medium text-stone-500">Preparing fresh menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 pb-24">
      <Header restaurantName={restaurantName} cartCount={itemCount} />

      {/* Restaurant Hero Banner */}
      <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white px-4 py-12 md:py-16 shadow-inner">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md mb-4 border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5" /> Michelin Standard Digital Dining
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{restaurantName || 'Gourmet Bistro'}</h1>
          <p className="mt-2 text-stone-300 max-w-2xl text-sm md:text-base leading-relaxed">
            Experience culinary excellence curated by world-class chefs. Browse our artisan menu, tailor ingredients, and order effortlessly.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs md:text-sm text-stone-300">
            <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-amber-400" /> Main Dining Room & Patio</div>
            <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-400" /> Open Today: 09:00 AM – 11:00 PM</div>
            <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 4.9 (500+ Guest Reviews)</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Search & Dietary Bar */}
        <div className="sticky top-14 z-40 bg-stone-50/95 backdrop-blur-md py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <Input
              placeholder="Search dishes, pasta, steaks, desserts, cocktails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-white border-stone-200 shadow-sm text-base focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === 'all'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === c.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Dietary Filters */}
          <div className="flex flex-wrap gap-2 pt-1">
            {['', 'vegetarian', 'vegan', 'gluten-free'].map((tag) => (
              <button
                key={tag || 'all'}
                type="button"
                onClick={() => setDietary(tag)}
                className={`rounded-xl px-3 py-1 text-xs font-medium border transition-colors ${
                  dietary === tag
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white/80 text-stone-600 border-stone-200 hover:bg-white'
                }`}
              >
                {tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : 'All Dietary'}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Listings */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 mt-6">
            <Utensils className="h-10 w-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No dishes match your filter</h3>
            <p className="text-sm text-stone-500 mt-1">Try clearing your search query or dietary selection.</p>
            <Button
              onClick={() => { setSearch(''); setDietary(''); setActiveCategory('all'); }}
              variant="outline"
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filtered.map((category) => (
            <section key={category.id} className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black tracking-tight text-stone-900">{category.name}</h2>
                <div className="h-px flex-1 bg-stone-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      {item.images[0] && (
                        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
                          <Image
                            src={item.images[0].url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {item.isFeatured && (
                            <div className="absolute top-2 left-2 rounded-md bg-amber-500/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                              <Flame className="h-3 w-3" /> Popular
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link href={`/menu/${branchSlug}/item/${item.id}`} className="block">
                          <h3 className="font-bold text-stone-900 text-lg group-hover:text-amber-600 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        {item.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {item.dietaryTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-4">
                      <div>
                        <span className="text-xs font-semibold text-stone-400 block">Price</span>
                        <span className="text-xl font-black text-stone-900">
                          {formatPrice(item.basePrice)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/menu/${branchSlug}/item/${item.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl border-stone-200 hover:bg-stone-50 text-xs font-bold">
                            Customize
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleQuickAdd(item)}
                          className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
