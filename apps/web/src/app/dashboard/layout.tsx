'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ChefHat, UtensilsCrossed, QrCode, BarChart3, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Orders', icon: LayoutDashboard },
  { href: '/dashboard/kitchen', label: 'Kitchen', icon: ChefHat },
  { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/dashboard/tables', label: 'Tables & QR', icon: QrCode },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/staff', label: 'Staff', icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-4 flex flex-col">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-primary-500">TableBite</Link>
          <p className="text-xs text-gray-500 mt-1">Staff Dashboard</p>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
