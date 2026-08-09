import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'
import { CurrencyRupeeIcon, TruckIcon, BanknotesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function PartnerEarningsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/partner/earnings')
      setData(res.data?.data || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  const totalEarnings = data?.totalEarnings || 0
  const deliveryPay = data?.totalDeliveryPay || 0
  const tips = data?.totalTips || 0
  const completedCount = data?.completedDeliveriesCount || 0
  const history = data?.history || []

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Earnings Breakdown</h1>
          <p className="page-subtitle">Track your actual delivery payouts and completed orders</p>
        </div>
        <button onClick={fetchEarnings} className="btn-secondary text-xs">
          🔄 Refresh
        </button>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4 bg-orange-50 border-orange-100">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold">
            <CurrencyRupeeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Total Payout</p>
            <p className="text-2xl font-extrabold text-stone-900">₹{totalEarnings}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TruckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Deliveries Done</p>
            <p className="text-2xl font-extrabold text-stone-900">{completedCount}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BanknotesIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase">Customer Tips</p>
            <p className="text-2xl font-extrabold text-stone-900">₹{tips}</p>
          </div>
        </div>
      </div>

      {/* ── Breakdown Details ── */}
      <div className="card p-6 space-y-3 text-sm">
        <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-2 font-display">Payout Details</h3>
        <div className="flex justify-between text-stone-600 text-xs">
          <span>Base Delivery Pay ({completedCount} orders)</span>
          <span className="font-semibold text-stone-900">₹{deliveryPay}</span>
        </div>
        <div className="flex justify-between text-stone-600 text-xs">
          <span>Customer Tips</span>
          <span className="font-semibold text-stone-900">₹{tips}</span>
        </div>
        <div className="flex justify-between text-stone-900 font-bold border-t border-stone-100 pt-2 text-sm">
          <span>Total Net Earnings</span>
          <span className="text-primary text-base">₹{totalEarnings}</span>
        </div>
      </div>

      {/* ── Real Delivery Log ── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-stone-900 font-display">Delivery Payout History</h3>
        {history.length === 0 ? (
          <div className="text-center py-8 space-y-3 text-stone-500">
            <div className="text-4xl">🛵</div>
            <p className="text-xs">No completed deliveries yet. Accept orders to earn!</p>
            <Link to="/partner/available" className="btn-primary inline-flex items-center gap-1 text-xs">
              View Available Orders <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {history.map((item) => (
              <div key={item._id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-stone-900">{item.restaurantName} ({item.orderNumber})</p>
                  <p className="text-stone-400">
                    {new Date(item.deliveredAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 text-sm block">+₹{item.totalEarned}</span>
                  {item.tip > 0 && <span className="text-[10px] text-stone-400">(Includes ₹{item.tip} tip)</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
