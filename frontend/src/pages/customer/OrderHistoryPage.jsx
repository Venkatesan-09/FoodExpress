import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { OrderStatusBadge, Spinner, EmptyState, Price } from '../../components/ui'
import { StarIcon } from '@heroicons/react/24/outline'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/my-orders')
      setOrders(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No Orders Yet"
        description="You haven't placed any food orders yet."
        action={<Link to="/restaurants" className="btn-primary">Order Now</Link>}
      />
    )
  }

  return (
    <div className="container-page py-6 max-w-4xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">View and track all your recent orders</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-stone-900">{order.restaurant?.name || 'Restaurant'}</h3>
                <p className="text-xs text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="space-y-1.5 text-xs text-stone-600">
              {order.items?.map((item, idx) => {
                const itemPrice = item.effectivePrice || item.price || item.basePrice || 0
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-semibold text-stone-900">₹{itemPrice * item.quantity}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-sm">
              <span className="font-bold text-stone-900">Total Rate: <span className="text-primary text-base">₹{order.billBreakdown?.total || 0}</span></span>
              <div className="flex gap-2">
                <Link to={`/orders/${order._id}/track`} className="btn-secondary btn-sm">
                  Track Order
                </Link>
                {order.status === 'delivered' && !order.isRated && (
                  <Link to={`/orders/${order._id}/review`} className="btn-primary btn-sm flex items-center gap-1">
                    <StarIcon className="w-4 h-4" /> Rate & Review
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
