import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useSocketStore } from '../../stores/socketStore'
import { OrderStatusBadge, PageLoader } from '../../components/ui'
import toast from 'react-hot-toast'

export default function OwnerOrderQueuePage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { socket, joinRestaurantRoom } = useSocketStore()

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 30000) // 30 sec background poll
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('order:new', (newOrder) => {
        toast('🔔 New order received!', { icon: '🍔' })
        fetchOrders(true)
      })
      socket.on('order:status_changed', ({ orderId, status }) => {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o))
      })
    }
    return () => {
      if (socket) {
        socket.off('order:new')
        socket.off('order:status_changed')
      }
    }
  }, [socket])

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/orders/owner/queue')
      const fetched = res.data?.data || []
      setOrders(fetched)
      if (fetched.length > 0 && fetched[0].restaurant) {
        joinRestaurantRoom(fetched[0].restaurant)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      toast.success(`Order status updated to ${status.replace(/_/g, ' ')}`)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o))
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status.')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Live Order Queue</h1>
          <p className="page-subtitle">Real-time customer orders for your restaurant</p>
        </div>
        <button onClick={() => fetchOrders()} className="btn-secondary text-xs flex items-center gap-1">
          🔄 Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-stone-500 space-y-2">
          <div className="text-4xl">📥</div>
          <h3 className="font-bold text-stone-800 text-lg">No Orders in Queue</h3>
          <p className="text-xs text-stone-500">When customers place orders, they will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-bold text-stone-900">Order #{order.orderNumber || order._id.slice(-6)}</h3>
                  <p className="text-xs text-stone-500">
                    Customer: <span className="font-semibold text-stone-700">{order.customer?.name || order.deliveryAddress?.fullName || 'Customer'}</span>
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

              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="font-bold text-sm text-stone-900">
                  Total Rate: <span className="text-primary text-base">₹{order.billBreakdown?.total || 0}</span>
                </span>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order._id, 'confirmed')} className="btn-primary btn-sm">
                      Accept & Confirm
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateStatus(order._id, 'preparing')} className="btn-primary btn-sm">
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateStatus(order._id, 'ready_for_pickup')} className="btn-primary btn-sm">
                      Ready for Pickup
                    </button>
                  )}
                  {order.status === 'ready_for_pickup' && (
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-lg">
                      Awaiting Delivery Partner
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
