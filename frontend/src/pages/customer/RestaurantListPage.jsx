import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { RatingBadge, Spinner, EmptyState } from '../../components/ui'
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)

  useEffect(() => {
    fetchRestaurants()
  }, [vegOnly, minRating])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const params = {}
      if (vegOnly) params.isVegOnly = true
      if (minRating > 0) params.minRating = minRating
      const res = await api.get('/restaurants', { params })
      setRestaurants(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container-page py-6">
      <div className="page-header">
        <h1 className="page-title">Restaurants</h1>
        <p className="page-subtitle">Browse all restaurants near you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Filters Sidebar ── */}
        <div className="bg-white p-5 rounded-2xl border border-stone-100 h-fit space-y-6">
          <div className="flex items-center gap-2 font-bold text-stone-900 border-b border-stone-100 pb-3">
            <FunnelIcon className="w-5 h-5 text-primary" /> Filters
          </div>

          <div>
            <label className="label">Search</label>
            <div className="relative">
              <input
                type="text"
                className="input pl-9"
                placeholder="Name or cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              Pure Veg Only
            </label>
          </div>

          <div>
            <label className="label">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="input"
            >
              <option value={0}>All Ratings</option>
              <option value={3.5}>3.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* ── Restaurant Grid ── */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No Restaurants Match" description="Try adjusting your filters or search." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(restaurant => (
                <Link
                  key={restaurant._id}
                  to={`/restaurants/${restaurant._id}`}
                  className="card-hover group flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img
                      src={restaurant.images?.[0] || 'https://picsum.photos/seed/restaurant/800/450'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <RatingBadge rating={restaurant.rating?.avg} count={restaurant.rating?.count} />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-stone-500 mb-3">{restaurant.cuisine?.join(', ')}</p>
                    <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 font-medium">
                      <span>⏱ {restaurant.deliveryTime} mins</span>
                      <span>₹{restaurant.deliveryFee} fee</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
