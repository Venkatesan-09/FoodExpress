import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { ShoppingCartIcon, UserCircleIcon, HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/orders', label: 'My Orders' },
]

export default function CustomerLayout() {
  const { user, clearAuth } = useAuthStore()
  const itemCount = useCartStore((s) => s.getItemCount())
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const api = (await import('../lib/api')).default
      await api.post('/auth/logout')
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-surface-raised flex flex-col">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-sticky glass border-b border-stone-100">
        <div className="container-page flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="text-2xl">🍕</span>
            <span className="gradient-brand">FoodExpress</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={location.pathname === link.to ? 'nav-item-active' : 'nav-item'}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/favorites" className="btn-icon btn-ghost relative" aria-label="Favorites">
              <HeartIcon className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="btn-icon btn-ghost relative" aria-label="Cart">
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse-brand">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <div className="relative group">
              <button className="btn-icon btn-ghost flex items-center gap-1.5 pr-2" aria-label="Account">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-7 h-7 text-text-secondary" />
                )}
                <span className="text-sm font-medium text-text-primary hidden lg:block">{user?.name?.split(' ')[0]}</span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-100 py-1
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-dropdown">
                <Link to="/profile" className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-overlay">My Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-overlay">My Orders</Link>
                <div className="divider my-1" />
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="btn-icon btn-ghost relative">
              <ShoppingCartIcon className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button className="btn-icon btn-ghost" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white animate-slide-down">
            <nav className="container-page py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-item"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/profile" className="nav-item" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="nav-item text-red-600 hover:bg-red-50 hover:text-red-700 text-left">
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-8 mt-12">
        <div className="container-page text-center text-sm">
          <p className="font-display font-bold text-white text-lg mb-1">🍕 FoodExpress</p>
          <p>© 2025 FoodExpress. Delivering happiness, one order at a time.</p>
        </div>
      </footer>
    </div>
  )
}
