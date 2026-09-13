'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { redirectAfterLogin } from '@/lib/api';

interface HeaderProps {
  restaurantName?: string;
  cartCount?: number;
  showAuth?: boolean;
}

export function Header({ restaurantName, cartCount = 0, showAuth = true }: HeaderProps) {
  const { user } = useAuth();
  const accountHref = user ? redirectAfterLogin(user.roles) : '/login';

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-500">TableBite</span>
          {restaurantName && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-medium text-gray-600">{restaurantName}</span>
            </>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-gray-100">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {showAuth && (
            <Link href={accountHref} className="rounded-lg p-2 hover:bg-gray-100" title={user?.email || 'Sign in'}>
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
