import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import api from '../../lib/api'
import { Spinner } from '../../components/ui'
import { MapPinIcon, CreditCardIcon, BanknotesIcon, CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

const EMPTY_ADDRESS = {
  line1: '',
  city: '',
  state: '',
  pincode: '',
  lat: null,
  lng: null,
}

export default function CheckoutPage() {
  const { items, restaurantId, restaurantName, getSubtotal, getDeliveryFee, getTax, getDiscount, getTotal, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [addressErrors, setAddressErrors] = useState({})

  // Pre-fill address from user profile if available
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    if (items.length === 0) {
      navigate('/cart')
      return
    }
    if (user?.address) {
      setAddress({
        line1: user.address.line1 || user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || user.address.zip || '',
        lat: user.address.lat || null,
        lng: user.address.lng || null,
      })
    }
  }, [isAuthenticated, items.length, navigate, user])

  if (!isAuthenticated || items.length === 0) return null

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }))
    // Clear field error on change
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateAddress = () => {
    const errors = {}
    if (!address.line1.trim()) errors.line1 = 'Address is required'
    if (!address.city.trim()) errors.city = 'City is required'
    if (!address.state.trim()) errors.state = 'State is required'
    if (!address.pincode.trim()) errors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(address.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode'
    return errors
  }

  const handlePlaceOrder = async () => {
    setError('')

    const errors = validateAddress()
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors)
      return
    }

    setPlacing(true)
    try {
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
        deliveryAddress: {
          line1: address.line1.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
          ...(address.lat && address.lng ? { lat: address.lat, lng: address.lng } : {}),
        },
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
          <MapPinIcon className="w-5 h-5 text-primary" />
          Delivery Address
          <span className="ml-auto flex items-center gap-1 text-xs font-normal text-primary">
            <PencilSquareIcon className="w-4 h-4" /> Editable
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-3 text-sm">
          {/* Address Line */}
          <div>
            <label className="label">
              Address Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input ${addressErrors.line1 ? 'border-red-400 focus:ring-red-300' : ''}`}
              placeholder="e.g. 42, Gandhi Nagar, MG Road"
              value={address.line1}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
            />
            {addressErrors.line1 && <p className="text-red-500 text-xs mt-1">{addressErrors.line1}</p>}
          </div>

          {/* City / State / Pincode */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${addressErrors.city ? 'border-red-400 focus:ring-red-300' : ''}`}
                placeholder="e.g. Chennai"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
              />
              {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
            </div>
            <div>
              <label className="label">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${addressErrors.state ? 'border-red-400 focus:ring-red-300' : ''}`}
                placeholder="e.g. Tamil Nadu"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
              />
              {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
            </div>
            <div>
              <label className="label">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${addressErrors.pincode ? 'border-red-400 focus:ring-red-300' : ''}`}
                placeholder="6-digit pincode"
                maxLength={6}
                value={address.pincode}
                onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, ''))}
              />
              {addressErrors.pincode && <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>}
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
