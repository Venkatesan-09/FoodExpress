import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { RatingBadge, Spinner, EmptyState } from '../../components/ui'
import { MagnifyingGlassIcon, MapPinIcon, FireIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'

const CUISINES = ['All', 'South Indian', 'North Indian', 'Biryani', 'Burgers', 'Fast Food', 'Vegetarian']

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')

  useEffect(() => {
    fetchRestaurants()
  }, [selectedCuisine])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine
      const res = await api.get('/restaurants', { params })
      setRestaurants(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container-page py-6 space-y-8">
      {/* ── Banner & Location Bar ── */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
            <MapPinIcon className="w-4 h-4" /> Delivering to Bengaluru, KA
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Hungry? Discover the best food & drinks near you.
          </h1>
          
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-stone-900 bg-white text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
      </div>

      {/* ── Cuisines Chips ── */}
      <div>
        <h2 className="text-xl font-bold mb-4 font-display flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-orange-600" /> Explore Cuisines
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CUISINES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCuisine === c
                  ? 'bg-primary text-white shadow-brand'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Restaurants Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <HandThumbUpIcon className="w-5 h-5 text-orange-600" /> Featured Restaurants
          </h2>
          <Link to="/restaurants" className="text-sm font-bold text-primary hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState title="No Restaurants Found" description="Try clearing your search or filters." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
              <Link
                key={restaurant._id}
                to={`/restaurants/${restaurant._id}`}
                className="card-hover group flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={restaurant.images?.[0] || 'https://picsum.photos/seed/restaurant/800/450'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <RatingBadge rating={restaurant.rating?.avg} count={restaurant.rating?.count} />
                  </div>
                  {restaurant.isVegOnly && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold shadow">
                      PURE VEG
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-primary transition-colors line-clamp-1">
                      {restaurant.name}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mb-3 line-clamp-1">
                    {restaurant.cuisine?.join(', ')}
                  </p>
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 font-medium">
                    <span>⏱ {restaurant.deliveryTime} mins</span>
                    <span>₹{restaurant.deliveryFee} Delivery</span>
                    <span>Min ₹{restaurant.minOrderValue}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
