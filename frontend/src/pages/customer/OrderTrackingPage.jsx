import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import { useSocketStore } from '../../stores/socketStore'
import { OrderStatusBadge, PageLoader, Price } from '../../components/ui'
import { CheckCircleIcon, ClockIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline'

const STAGES = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered']

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(null)

  const { socket, joinOrderRoom, leaveOrderRoom } = useSocketStore()

  useEffect(() => {
    fetchOrder()
  }, [id])

  useEffect(() => {
    if (!id) return
    joinOrderRoom(id)

    if (socket) {
      socket.on('order:status_changed', ({ orderId, status }) => {
        if (orderId === id) {
          setOrder(prev => prev ? { ...prev, status } : prev)
        }
      })

      socket.on('order:location_update', ({ orderId, lat, lng, eta }) => {
        if (orderId === id) {
          setLocation({ lat, lng, eta })
        }
      })
    }

    return () => {
      leaveOrderRoom(id)
      if (socket) {
        socket.off('order:status_changed')
        socket.off('order:location_update')
      }
    }
  }, [id, socket])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!order) return <div className="p-8 text-center">Order not found</div>

  const currentStageIndex = STAGES.indexOf(order.status)

  return (
    <div className="container-page py-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Order Tracking</h1>
          <p className="page-subtitle">Order #{order.orderNumber || order._id.slice(-8)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ── Status Timeline ── */}
      <div className="card p-6 space-y-6">
        <h3 className="font-bold text-lg font-display">Live Order Status</h3>

        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          {STAGES.map((stg, idx) => {
            const isCompleted = currentStageIndex >= idx
            const isCurrent = currentStageIndex === idx
            return (
              <div key={stg} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isCurrent
                    ? 'bg-primary text-white ring-4 ring-orange-100 animate-pulse'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-stone-100 text-stone-400'
                }`}>
                  {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`capitalize ${isCurrent ? 'font-bold text-primary' : 'text-stone-500'}`}>
                  {stg.replace(/_/g, ' ')}
                </span>
              </div>
            )
          })}
        </div>

        {/* ── ETA & Location info ── */}
        {order.status === 'out_for_delivery' && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between text-orange-900">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-6 h-6 text-primary animate-spin" />
              <div>
                <p className="font-bold">Out for Delivery!</p>
                <p className="text-xs text-orange-700">Delivery partner is on the way to your address.</p>
              </div>
            </div>
            {location?.eta && <span className="text-lg font-extrabold text-primary">{location.eta} min ETA</span>}
          </div>
        )}
      </div>

      {/* ── Order Items Details ── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold font-display text-lg">Order Items & Bill Details</h3>
        <div className="divide-y divide-stone-100">
          {order.items?.map((item, idx) => {
            const itemPrice = item.effectivePrice || item.price || item.basePrice || 0
            return (
              <div key={idx} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-500">Qty: {item.quantity} × ₹{itemPrice}</p>
                </div>
                <Price amount={itemPrice * item.quantity} size="sm" />
              </div>
            )
          })}
        </div>

        <div className="border-t border-stone-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Item Subtotal</span>
            <span>₹{order.billBreakdown?.subtotal || 0}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Delivery Fee</span>
            <span>₹{order.billBreakdown?.deliveryFee || 0}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Taxes & Charges</span>
            <span>₹{order.billBreakdown?.taxes || 0}</span>
          </div>
          {order.billBreakdown?.discount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Coupon Discount</span>
              <span>-₹{order.billBreakdown.discount}</span>
            </div>
          )}
          <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-lg text-stone-900">
            <span>Total Paid</span>
            <span className="text-primary">₹{order.billBreakdown?.total || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
