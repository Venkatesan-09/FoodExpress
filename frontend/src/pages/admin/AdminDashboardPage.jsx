import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'
import { UsersIcon, BuildingStorefrontIcon, CurrencyRupeeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  const overview = stats?.overview || {}

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and system metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Total Users</p>
            <p className="text-2xl font-extrabold text-stone-900">{overview.totalUsers || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
            <BuildingStorefrontIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Restaurants</p>
            <p className="text-2xl font-extrabold text-stone-900">{overview.totalRestaurants || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ClipboardDocumentListIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Total Orders</p>
            <p className="text-2xl font-extrabold text-stone-900">{overview.totalOrders || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <CurrencyRupeeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Total Revenue</p>
            <p className="text-2xl font-extrabold text-stone-900">₹{overview.totalRevenue || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
