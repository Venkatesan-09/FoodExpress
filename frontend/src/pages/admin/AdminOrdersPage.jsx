import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader, OrderStatusBadge } from '../../components/ui'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/orders')
      setOrders(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Platform Orders</h1>
        <p className="page-subtitle">View all platform transactions and orders</p>
      </div>

      <div className="card divide-y divide-stone-100">
        {orders.map(order => (
          <div key={order._id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900">Order #{order._id.slice(-8)}</h3>
              <p className="text-xs text-stone-500">
                Customer: {order.customer?.name} • Restaurant: {order.restaurant?.name}
              </p>
              <p className="text-xs font-semibold text-primary mt-1">Total: ₹{order.billBreakdown?.total}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
