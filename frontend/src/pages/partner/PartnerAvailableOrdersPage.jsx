import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { PageLoader, OrderStatusBadge } from '../../components/ui'
import toast from 'react-hot-toast'
import { MapPinIcon, CurrencyRupeeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function PartnerAvailableOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAvailable()
  }, [])

  const fetchAvailable = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/available-for-partner')
      setOrders(res.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (orderId) => {
    setAcceptingId(orderId)
    try {
      await api.patch(`/orders/${orderId}/accept-delivery`)
      toast.success('Delivery accepted! Redirecting to active delivery track...')
      navigate('/partner/orders/active')
    } catch (err) {
      console.error(err)
      toast.error('Failed to accept delivery.')
    } finally {
      setAcceptingId(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Available Deliveries</h1>
          <p className="page-subtitle">Accept nearby customer orders ready for pickup and delivery</p>
        </div>
        <button onClick={fetchAvailable} className="btn-secondary text-xs">
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-stone-500 space-y-2">
          <div className="text-4xl">📦</div>
          <h3 className="font-bold text-stone-800 text-lg">No Deliveries Available</h3>
          <p className="text-xs text-stone-500">Currently no unassigned orders. Check back shortly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderNum = order.orderNumber || (order._id ? `#${order._id.slice(-6)}` : '#ORDER')
            const deliveryEarnings = Math.round((order.billBreakdown?.deliveryFee || 40) + 25)
            return (
              <div key={order._id} className="card p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{order.restaurant?.name || 'Restaurant Partner'}</h3>
                    <p className="text-xs text-stone-500">Order {orderNum} • {order.items?.length || 1} Items</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-700 bg-stone-50 p-3.5 rounded-xl">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900 block">Pickup Location</span>
                      <span>{order.restaurant?.address?.line1 || 'Restaurant location'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900 block">Delivery Address</span>
                      <span>{order.deliveryAddress?.line1}, {order.deliveryAddress?.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                    <CurrencyRupeeIcon className="w-5 h-5 text-emerald-600" />
                    <span>Estimated Payout: ₹{deliveryEarnings}</span>
                  </div>

                  <button
                    onClick={() => handleAccept(order._id)}
                    disabled={acceptingId === order._id}
                    className="btn-primary btn-sm flex items-center gap-1.5 px-4"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {acceptingId === order._id ? 'Accepting...' : 'Accept Delivery'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
