import { Link } from 'react-router-dom'
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-sticky glass border-b border-stone-100">
        <div className="container-page flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="text-2xl">🍕</span>
            <span className="gradient-brand">FoodExpress</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn-primary btn-sm">Sign up</Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-orange-50/50 to-stone-50">
        <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              <SparklesIcon className="w-4 h-4" /> Fast & Reliable Food Delivery
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-stone-900 leading-tight">
              Craving Something <span className="gradient-brand">Delicious?</span>
            </h1>
            <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
              Get your favorite meals delivered fresh and hot to your doorstep from top local restaurants in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="btn-primary btn-lg flex items-center justify-center gap-2">
                Get Started <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary btn-lg flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
                alt="Delicious Gourmet Food Spread"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-white border-y border-stone-100">
        <div className="container-page grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-primary flex items-center justify-center mb-4">
              <ClockIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Lightning Fast Delivery</h3>
            <p className="text-stone-600 text-sm">Real-time GPS tracking and instant driver dispatch ensures your food arrives hot.</p>
          </div>
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-primary flex items-center justify-center mb-4">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Best Local Restaurants</h3>
            <p className="text-stone-600 text-sm">Curated selection of top-rated cafes, eateries, and fine dining partners.</p>
          </div>
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-primary flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Safe & Seamless Payments</h3>
            <p className="text-stone-600 text-sm">Multiple simulated payment choices including Card, UPI, and Cash on Delivery.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-8">
        <div className="container-page text-center text-sm">
          <p className="font-display font-bold text-white text-lg mb-1">🍕 FoodExpress</p>
          <p>© 2025 FoodExpress. Full-Stack Food Delivery Platform.</p>
        </div>
      </footer>
    </div>
  )
}
