import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'
import { CurrencyRupeeIcon, ClipboardDocumentListIcon, StarIcon, BuildingStorefrontIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState(null)
  const [restaurant, setRestaurant] = useState(undefined) // undefined = loading, null = no restaurant
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchStats(true), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await api.get('/restaurants/my-restaurant')
      const r = res.data?.data || null
      setRestaurant(r)
      if (r) await fetchStats(false)
    } catch (err) {
      setRestaurant(null)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (silent = false) => {
    try {
      const res = await api.get('/orders/owner/queue')
      const orders = res.data?.data || []
      const totalRev = orders.reduce((acc, o) => acc + (o.billBreakdown?.total || 0), 0)
      setStats({
        totalOrders: orders.length,
        totalRevenue: totalRev,
        avgRating: 4.8,
        recentOrders: orders.slice(0, 5),
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <PageLoader />

  // New owner — no restaurant registered yet
  if (!restaurant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 p-8">
        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center">
          <BuildingStorefrontIcon className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold font-display text-stone-900">Welcome, Partner! 👋</h1>
          <p className="text-stone-500 max-w-sm text-sm">
            You haven't set up your restaurant yet. Create your restaurant profile to start receiving orders from customers!
          </p>
        </div>
        <Link
          to="/owner/profile"
          className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
        >
          Register Your Restaurant <ArrowRightIcon className="w-5 h-5" />
        </Link>
        <p className="text-xs text-stone-400">Takes about 2 minutes • Live immediately</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Restaurant Dashboard</h1>
        <p className="page-subtitle">Overview of your live orders, sales performance, and rating</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
            <ClipboardDocumentListIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Total Orders</p>
            <p className="text-2xl font-extrabold text-stone-900">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <CurrencyRupeeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Total Revenue</p>
            <p className="text-2xl font-extrabold text-stone-900">₹{stats?.totalRevenue || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <StarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Average Rating</p>
            <p className="text-2xl font-extrabold text-stone-900">{stats?.avgRating || 4.8} / 5</p>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold font-display text-lg">Recent Incoming Customer Orders</h3>
        {!stats?.recentOrders?.length ? (
          <p className="text-xs text-stone-500">No orders received yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {stats?.recentOrders?.map((order) => (
              <div key={order._id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-stone-900">Order #{order.orderNumber || order._id?.slice(-6)}</p>
                  <p className="text-xs text-stone-500">{order.items?.length} items • Customer: {order.customer?.name || order.deliveryAddress?.fullName || 'Customer'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-900">₹{order.billBreakdown?.total}</span>
                  <span className="badge-warning capitalize">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
