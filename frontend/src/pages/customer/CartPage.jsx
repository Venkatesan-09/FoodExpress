import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { VegDot, Price, QuantityStepper, EmptyState } from '../../components/ui'
import { TagIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const { items, restaurantName, updateQuantity, removeItem, clearCart, coupon, setCoupon, getSubtotal, getDeliveryFee, getTax, getDiscount, getTotal } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your Cart is Empty"
        description="Looks like you haven't added anything to your cart yet."
        action={<Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>}
      />
    )
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    const code = couponInput.trim().toUpperCase()
    if (code === 'WELCOME50') {
      setCoupon({ code, discountType: 'flat', value: 50, minOrderValue: 200 })
    } else if (code === 'FEAST20') {
      setCoupon({ code, discountType: 'percentage', value: 20, minOrderValue: 300 })
    } else {
      setCouponError('Invalid coupon code. Try WELCOME50 or FEAST20')
    }
  }

  return (
    <div className="container-page py-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">Ordering from <span className="font-bold text-primary">{restaurantName || 'Restaurant'}</span></p>
        </div>
        <button onClick={clearCart} className="btn-ghost btn-sm text-red-500 hover:text-red-700 flex items-center gap-1">
          <TrashIcon className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cart Items List ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item.menuItem} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <VegDot isVeg={item.isVeg} />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-stone-500">₹{item.price} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.menuItem, item.quantity + 1)}
                    onDecrement={() => updateQuantity(item.menuItem, item.quantity - 1)}
                  />
                  <Price amount={item.price * item.quantity} size="sm" className="w-16 text-right" />
                  <button onClick={() => removeItem(item.menuItem)} className="text-stone-400 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="card p-4">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <TagIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Coupon Code (e.g. WELCOME50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="input pl-9"
                />
              </div>
              <button type="submit" className="btn-secondary btn-sm">Apply</button>
            </form>
            {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
            {coupon && (
              <div className="mt-2 p-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold flex justify-between items-center">
                <span>Coupon {coupon.code} applied!</span>
                <button onClick={() => setCoupon(null)} className="text-red-500 hover:underline">Remove</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Bill Summary ── */}
        <div className="card p-6 h-fit space-y-4">
          <h3 className="font-bold font-display text-lg border-b border-stone-100 pb-3">Bill Details</h3>
          
          <div className="space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span>₹{getSubtotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{getDeliveryFee()}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Charges (5%)</span>
              <span>₹{getTax()}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount ({coupon.code})</span>
                <span>-₹{getDiscount()}</span>
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-lg text-stone-900">
            <span>Total Payable</span>
            <span className="text-primary">₹{getTotal()}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
          >
            Proceed to Checkout <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
