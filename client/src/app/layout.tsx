import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'TableBite — QR Restaurant Ordering',
  description: 'Scan, order, pay, and track your meal in real time. No app required.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ServiceWorkerRegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
