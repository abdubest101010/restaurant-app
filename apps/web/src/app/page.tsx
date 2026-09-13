import Link from 'next/link';
import { QrCode, Clock, CreditCard, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-2xl font-bold text-primary-500">TableBite</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link href="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary-50 to-orange-100 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Scan. Order. Enjoy.
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            TableBite is a QR-first restaurant ordering platform. Guests scan a table code,
            browse the menu, customize items, pay securely, and track their order in real time — no app download needed.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/menu/main"><Button size="lg">View Demo Menu</Button></Link>
            <Link href="/signup"><Button size="lg" variant="outline">Register Restaurant</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: QrCode, title: 'Scan QR Code', desc: 'Scan the table QR code to open the digital menu instantly.' },
              { icon: Clock, title: 'Order & Customize', desc: 'Browse items, select variants and add-ons, add to cart.' },
              { icon: CreditCard, title: 'Pay Securely', desc: 'Pay with card via Stripe or choose pay-at-counter.' },
              { icon: BarChart3, title: 'Track Live', desc: 'Watch your order progress from kitchen to table in real time.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">For Restaurant Owners</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Own your customer relationship. No 15-30% commissions. Manage menus, tables, staff, and analytics from one dashboard.
          </p>
          <Link href="/dashboard"><Button size="lg">Go to Dashboard</Button></Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>TableBite &copy; 2026. Built with Next.js, NestJS, PostgreSQL, and Stripe.</p>
      </footer>
    </div>
  );
}
