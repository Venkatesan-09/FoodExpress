import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TruckIcon, CurrencyRupeeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function PartnerDashboardPage() {
  const [isOnline, setIsOnline] = useState(true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Delivery Partner Dashboard</h1>
          <p className="page-subtitle">Welcome back, Partner!</p>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
            isOnline ? 'bg-green-600 text-white' : 'bg-stone-200 text-stone-700'
          }`}
        >
          {isOnline ? '🟢 ONLINE' : '⚪ OFFLINE'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <TruckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Deliveries Today</p>
            <p className="text-2xl font-extrabold text-stone-900">8</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <CurrencyRupeeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Today's Earnings</p>
            <p className="text-2xl font-extrabold text-stone-900">₹640</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Rating</p>
            <p className="text-2xl font-extrabold text-stone-900">4.9 ★</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/partner/orders/available" className="btn-primary flex-1 py-3 text-center">
          View Available Pickups
        </Link>
        <Link to="/partner/earnings" className="btn-secondary flex-1 py-3 text-center">
          View Earnings History
        </Link>
      </div>
    </div>
  )
}
