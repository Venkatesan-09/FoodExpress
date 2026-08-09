import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import { useCartStore } from '../../stores/cartStore'
import { RatingBadge, VegDot, Price, QuantityStepper, PageLoader } from '../../components/ui'
import { HeartIcon, ClockIcon, MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  const { items, addItem, updateQuantity, restaurantId: cartRestId } = useCartStore()

  useEffect(() => {
    fetchRestaurantAndMenu()
  }, [id])

  const fetchRestaurantAndMenu = async () => {
    setLoading(true)
    try {
      const [resRest, resMenu] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/menu-items/restaurant/${id}`),
      ])
      setRestaurant(resRest.data.data)
      setMenuItems(resMenu.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />
  if (!restaurant) return <div className="p-8 text-center text-stone-600">Restaurant not found</div>

  // Group menu by category
  const categories = Array.from(new Set(menuItems.map(i => i.category)))

  const getItemQuantityInCart = (itemId) => {
    if (cartRestId !== restaurant._id) return 0
    const found = items.find(i => i.menuItem === itemId)
    return found ? found.quantity : 0
  }

  const handleAddToCart = (item) => {
    addItem(restaurant, item, 1)
  }

  const cartTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const cartItemCount = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <div className="pb-24">
      {/* ── Restaurant Banner Header ── */}
      <div className="bg-stone-900 text-white py-10 px-4">
        <div className="container-page flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display">{restaurant.name}</h1>
              {restaurant.isVegOnly && (
                <span className="bg-green-600 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  PURE VEG
                </span>
              )}
            </div>
            <p className="text-stone-300 text-sm">{restaurant.cuisine?.join(', ')}</p>
            <p className="text-stone-400 text-xs flex items-center gap-1">
              <MapPinIcon className="w-4 h-4 text-primary" /> {restaurant.address?.line1}, {restaurant.address?.city}
            </p>
            <div className="flex items-center gap-4 text-xs font-medium pt-2 text-stone-300">
              <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4 text-primary" /> {restaurant.deliveryTime} mins</span>
              <span>₹{restaurant.deliveryFee} Delivery</span>
              <span>Min Order ₹{restaurant.minOrderValue}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-stone-800/80 p-4 rounded-2xl border border-stone-700">
            <RatingBadge rating={restaurant.rating?.avg} count={restaurant.rating?.count} />
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-xl bg-stone-700/50 hover:bg-stone-700 text-white transition-colors"
            >
              {isFavorite ? <HeartSolidIcon className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu Categories & Items List ── */}
      <div className="container-page py-8 space-y-10">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-stone-500">No menu items available for this restaurant yet.</div>
        ) : (
          categories.map(category => {
            const categoryItems = menuItems.filter(i => i.category === category)
            return (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-bold font-display border-b border-stone-200 pb-2 text-stone-900">
                  {category} ({categoryItems.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryItems.map(item => {
                    const qty = getItemQuantityInCart(item._id)
                    return (
                      <div key={item._id} className="card p-4 flex justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <VegDot isVeg={item.isVeg} />
                            {item.isBestseller && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">BESTSELLER</span>
                            )}
                          </div>
                          <h3 className="font-bold text-stone-900">{item.name}</h3>
                          <Price amount={item.price} size="sm" />
                          <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                          )}
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="btn-secondary btn-sm text-primary font-bold hover:bg-orange-50"
                            >
                              ADD +
                            </button>
                          ) : (
                            <QuantityStepper
                              quantity={qty}
                              onIncrement={() => addItem(restaurant, item, 1)}
                              onDecrement={() => updateQuantity(item._id, qty - 1)}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Sticky Floating Cart Banner ── */}
      {items.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-sticky w-[90%] max-w-xl">
          <div className="bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <ShoppingBagIcon className="w-6 h-6" />
              <div>
                <p className="text-xs font-medium opacity-90">{cartItemCount} items selected</p>
                <p className="font-bold text-lg">₹{cartTotal}</p>
              </div>
            </div>
            <Link to="/cart" className="btn bg-white text-primary font-bold hover:bg-orange-50 btn-sm">
              View Cart →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
