import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { PageLoader, OrderStatusBadge } from '../../components/ui'
import toast from 'react-hot-toast'
import { MapPinIcon, PhoneIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function PartnerActiveDeliveryPage() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchActive()
  }, [])

  const fetchActive = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders/active-partner-order')
      setOrder(res.data?.data || null)
    } catch (err) {
      console.error(err)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    if (!order?._id) return
    setUpdating(true)
    try {
      await api.patch(`/orders/${order._id}/status`, { status })
      toast.success(`Order updated to ${status.replace(/_/g, ' ')}`)
      if (status === 'delivered') {
        setOrder(null)
      } else {
        setOrder(prev => prev ? { ...prev, status } : prev)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <PageLoader />

  if (!order || !order._id) {
    return (
      <div className="card p-12 text-center text-stone-500 space-y-4 max-w-xl mx-auto">
        <div className="text-5xl">🛵</div>
        <h3 className="font-bold text-stone-800 text-xl font-display">No Active Delivery</h3>
        <p className="text-xs text-stone-500">You currently have no active orders in progress.</p>
        <Link to="/partner/available" className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-2.5">
          Find Available Orders <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const orderNum = order.orderNumber || (order._id ? `#${order._id.slice(-6)}` : '#ACTIVE')

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Active Delivery</h1>
        <p className="page-subtitle">Order {orderNum}</p>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-bold text-lg text-stone-900">{order.restaurant?.name || 'Restaurant'}</h3>
            <p className="text-xs text-stone-500">{order.items?.length || 0} Items • Total Rate: ₹{order.billBreakdown?.total || 0}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* ── Locations & Customer ── */}
        <div className="space-y-3 text-sm text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-100">
          <div className="flex items-start gap-2.5">
            <MapPinIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block text-xs uppercase text-stone-400">Pickup Location</span>
              <span>{order.restaurant?.address?.line1 || 'Restaurant location'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 border-t border-stone-200/60 pt-3">
            <MapPinIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block text-xs uppercase text-stone-400">Delivery Address</span>
              <span>
                {order.deliveryAddress?.line1}, {order.deliveryAddress?.city} ({order.deliveryAddress?.pincode})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200/60 pt-3 text-xs">
            <div>
              <span className="font-bold text-stone-900">Customer:</span> {order.customer?.name || order.deliveryAddress?.fullName || 'Customer'}
            </div>
            <a href={`tel:${order.customer?.phone || '9999999999'}`} className="btn-secondary btn-sm flex items-center gap-1 text-xs">
              <PhoneIcon className="w-3.5 h-3.5" /> Call Customer
            </a>
          </div>
        </div>

        {/* ── Item Summary ── */}
        <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
          <p className="font-semibold text-stone-800 mb-1">Items to Deliver:</p>
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-semibold text-stone-900">₹{(item.effectivePrice || item.price || 100) * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* ── Action Buttons ── */}
        <div className="border-t border-stone-100 pt-4">
          {order.status === 'ready_for_pickup' && (
            <button
              onClick={() => updateStatus('out_for_delivery')}
              disabled={updating}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {updating ? 'Updating...' : 'Pick Up & Start Delivery'}
            </button>
          )}

          {order.status === 'out_for_delivery' && (
            <button
              onClick={() => updateStatus('delivered')}
              disabled={updating}
              className="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-base flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {updating ? 'Updating...' : 'Confirm Delivery Completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
