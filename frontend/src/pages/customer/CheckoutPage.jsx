import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import api from '../../lib/api'
import { Spinner } from '../../components/ui'
import { MapPinIcon, CreditCardIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function CheckoutPage() {
  const { items, restaurantId, restaurantName, getSubtotal, getDeliveryFee, getTax, getDiscount, getTotal, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [address, setAddress] = useState({
    line1: '123 Tech Park Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    lat: 12.9716,
    lng: 77.5946,
  })
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else if (items.length === 0) {
      navigate('/cart')
    }
  }, [isAuthenticated, items.length, navigate])

  if (!isAuthenticated || items.length === 0) {
    return null
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    setError('')
    try {
      // 1. Create order
      const orderPayload = {
        restaurantId,
        items: items.map(i => ({
          menuItemId: i.menuItem,
          menuItem: i.menuItem,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          restaurantId: i.restaurantId || restaurantId,
        })),
        deliveryAddress: address,
        paymentMethod,
        billBreakdown: {
          subtotal: getSubtotal(),
          deliveryFee: getDeliveryFee(),
          tax: getTax(),
          discount: getDiscount(),
          total: getTotal(),
        },
      }

      const res = await api.post('/orders', orderPayload)
      const newOrder = res.data.data

      // 2. If card or upi, simulate payment charge
      if (paymentMethod !== 'cod') {
        await api.post('/payments/mock-charge', {
          orderId: newOrder._id,
          method: paymentMethod,
        })
      }

      clearCart()
      navigate(`/orders/${newOrder._id}/track`)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-page py-6 max-w-3xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your order from {restaurantName || 'Restaurant'}</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>}

      {/* ── Address Section ── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-lg font-display flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-primary" /> Delivery Address
        </h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <label className="label">Address Line</label>
            <input
              type="text"
              className="input"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">City</label>
              <input type="text" className="input" value={address.city} readOnly />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" className="input" value={address.state} readOnly />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input type="text" className="input" value={address.pincode} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Method Section ── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-lg font-display flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-primary" /> Payment Method
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all ${
              paymentMethod === 'card' ? 'border-primary bg-orange-50 text-primary' : 'border-stone-200 text-stone-700'
            }`}
          >
            <CreditCardIcon className="w-6 h-6" /> Credit/Debit Card
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all ${
              paymentMethod === 'upi' ? 'border-primary bg-orange-50 text-primary' : 'border-stone-200 text-stone-700'
            }`}
          >
            <span className="text-xl font-bold">⚡</span> UPI / GPay
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('cod')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all ${
              paymentMethod === 'cod' ? 'border-primary bg-orange-50 text-primary' : 'border-stone-200 text-stone-700'
            }`}
          >
            <BanknotesIcon className="w-6 h-6" /> Cash on Delivery
          </button>
        </div>
      </div>

      {/* ── Order Summary ── */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-lg font-display">Order Total</h3>
        <div className="flex justify-between items-center text-xl font-extrabold text-stone-900 border-t border-stone-100 pt-3">
          <span>Amount to Pay</span>
          <span className="text-primary">₹{getTotal()}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          {placing ? <Spinner size="sm" /> : <CheckCircleIcon className="w-5 h-5" />}
          {placing ? 'Processing Order...' : 'Pay & Place Order'}
        </button>
      </div>
    </div>
  )
}
