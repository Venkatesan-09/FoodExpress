import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  HomeIcon, BuildingStorefrontIcon, TruckIcon, UsersIcon,
  ClipboardDocumentListIcon, TagIcon, ShieldCheckIcon,
  ArrowRightOnRectangleIcon, Bars3Icon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const NAV = [
  { to: '/admin/dashboard',    label: 'Dashboard',    Icon: HomeIcon },
  { to: '/admin/restaurants',  label: 'Restaurants',  Icon: BuildingStorefrontIcon },
  { to: '/admin/partners',     label: 'Partners',     Icon: TruckIcon },
  { to: '/admin/users',        label: 'Users',        Icon: UsersIcon },
  { to: '/admin/orders',       label: 'Orders',       Icon: ClipboardDocumentListIcon },
  { to: '/admin/coupons',      label: 'Coupons',      Icon: TagIcon },
]

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try { const api = (await import('../lib/api')).default; await api.post('/auth/logout') } finally {
      clearAuth(); navigate('/login')
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-stone-100">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-display font-bold text-xl">
          <ShieldCheckIcon className="w-7 h-7 text-primary" />
          <div>
            <div className="gradient-brand">FoodExpress</div>
            <div className="text-xs text-text-tertiary font-sans font-normal">Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV.map(({ to, label, Icon }) => (
          <Link key={to} to={to}
            className={location.pathname === to ? 'nav-item-active' : 'nav-item'}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />{label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-stone-100">
        <div className="px-2 mb-3">
          <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
          <p className="text-xs text-text-tertiary">Administrator</p>
        </div>
        <button onClick={handleLogout} className="nav-item text-red-500 hover:bg-red-50 hover:text-red-700 w-full">
          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex bg-stone-50">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-100 fixed inset-y-0 z-sticky">
        <SidebarContent />
      </aside>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-overlay">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="lg:hidden sticky top-0 z-sticky glass border-b border-stone-100 flex items-center gap-3 px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="btn-icon btn-ghost">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <span className="font-display font-bold gradient-brand">Admin Panel</span>
        </header>
        <main className="flex-1 p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
