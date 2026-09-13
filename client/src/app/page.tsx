import Link from 'next/link';
import Image from 'next/image';
import { QrCode, Clock, CreditCard, BarChart3, Utensils, Sparkles, ChefHat, ShieldCheck, Smartphone, Zap, ArrowRight, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 p-2 text-white shadow-md shadow-orange-500/20">
              <Utensils className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-stone-900">TableBite</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-5">
            <Link href="/menu/main" className="hidden sm:inline-block text-sm font-bold text-stone-600 hover:text-amber-600 transition-colors">
              Explore Menu
            </Link>
            <Link href="/login" className="text-sm font-bold text-stone-700 hover:text-stone-950 transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white py-20 lg:py-28 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Fine Dining & Digital Ordering
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-tight">
            Elevate Every Table with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              QR-Powered Dining
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Guests scan, browse exquisite dishes, customize ingredients, and order effortlessly. Staff receive live kitchen display tickets, while owners maximize margins.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/menu/main" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-8 h-14 shadow-lg shadow-amber-500/25 text-base flex items-center justify-center gap-2">
                Explore Demo Menu <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-stone-700 bg-stone-800/80 hover:bg-stone-800 text-stone-200 font-bold px-8 h-14 text-base backdrop-blur-md">
                Staff & Admin Portal
              </Button>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-stone-400 font-semibold border-t border-stone-800/80 pt-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 4.9/5 Guest Satisfaction</div>
            <div className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Instant Realtime KDS Updates</div>
            <div className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-amber-400" /> Stripe & Cash Settlement</div>
            <div className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-amber-400" /> 100% App-Free PWA</div>
          </div>
        </div>
      </section>

      {/* Modern Features Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">Modern Restaurant Features</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Built to Compete with the World’s Leading Dining Chains</h3>
          <p className="mt-4 text-stone-600 leading-relaxed">
            Everything your restaurant needs to modernize operations, delight guests, and accelerate turnaround times.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: QrCode,
              title: 'Cryptographic Table QR Codes',
              desc: 'Unique tamper-proof tokens mapped to each table or booth. Guests scan and start ordering in under 3 seconds without downloading an app.',
              badge: 'Instant Access',
            },
            {
              icon: ChefHat,
              title: 'Live Kitchen Display System (KDS)',
              desc: 'Kitchen staff see orders live with modifier breakdowns (cooking temperature, dietary restrictions, notes) with automated audio alerts.',
              badge: 'Real-Time Sync',
            },
            {
              icon: Utensils,
              title: 'Artisan Menu & Modifier Engine',
              desc: 'Manage rich imagery, prices, category hierarchies, dietary tags (vegan, gluten-free), and customize option groups effortlessly.',
              badge: 'Full Control',
            },
            {
              icon: CreditCard,
              title: 'Flexible Dual Payments',
              desc: 'Stripe integrated for Apple Pay, Google Pay & credit cards, with seamless pay-at-counter cash fallback for traditional guests.',
              badge: 'Stripe Verified',
            },
            {
              icon: BarChart3,
              title: 'Comprehensive Operations Analytics',
              desc: 'Track sales velocity, top performing dishes, average order fulfillment time, and super-admin payouts in real time.',
              badge: 'Deep Insights',
            },
            {
              icon: ShieldCheck,
              title: 'Enterprise Role-Based Access Control',
              desc: 'Separate, secure portals for Platform Super-Admins, Restaurant Owners, Kitchen Chefs, Floor Waiters, and Customers.',
              badge: 'RBAC Security',
            },
          ].map(({ icon: Icon, title, desc, badge }) => (
            <div key={title} className="group rounded-3xl border border-stone-200/90 bg-white p-8 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
                    {badge}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-stone-900 mb-3">{title}</h4>
                <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured CTA Banner */}
      <section className="bg-stone-900 text-white py-20 px-4">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Ready to Upgrade Your Dining Experience?
            </h2>
            <p className="mt-4 text-amber-100 max-w-2xl mx-auto text-base sm:text-lg">
              Check out the live interactive menu or sign into the owner dashboard to manage categories, products, and tables.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/menu/main">
                <Button size="lg" className="rounded-full bg-white text-stone-950 hover:bg-stone-100 font-extrabold px-8 h-12 shadow-lg">
                  View Live Menu
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10 font-bold px-8 h-12">
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 px-4 text-center text-sm text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-600" />
            <span className="font-extrabold text-stone-900">TableBite Platform</span>
          </div>
          <p>© 2026 TableBite Inc. Next.js 15, NestJS, Prisma ORM, PostgreSQL & Stripe.</p>
          <div className="flex gap-4 font-semibold text-stone-600">
            <Link href="/menu/main" className="hover:text-stone-950">Menu</Link>
            <Link href="/dashboard" className="hover:text-stone-950">Dashboard</Link>
            <Link href="/admin" className="hover:text-stone-950">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
