import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/restaurants')
      setRestaurants(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approve = async (id) => {
    try {
      await api.patch(`/admin/restaurants/${id}/approve`)
      fetchRestaurants()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Manage Restaurants</h1>
        <p className="page-subtitle">Approve, reject, or view restaurant accounts on FoodExpress</p>
      </div>

      <div className="card divide-y divide-stone-100">
        {restaurants.map(rest => (
          <div key={rest._id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900">{rest.name}</h3>
              <p className="text-xs text-stone-500">Owner: {rest.owner?.name} ({rest.owner?.email})</p>
              <span className="badge-neutral text-[10px] mt-1 capitalize">{rest.status}</span>
            </div>
            {rest.status === 'pending_approval' && (
              <button onClick={() => approve(rest._id)} className="btn-primary btn-sm">
                Approve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
