import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'
import toast from 'react-hot-toast'
import { BuildingStorefrontIcon, CheckCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

export default function OwnerProfilePage() {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    deliveryFee: 40,
    deliveryTime: 30,
    minOrderValue: 150,
    isVegOnly: false,
    phone: '',
    address: {
      line1: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
    },
  })

  useEffect(() => {
    fetchRestaurant()
  }, [])

  const fetchRestaurant = async () => {
    setLoading(true)
    try {
      const res = await api.get('/restaurants/my-restaurant')
      const r = res.data?.data
      if (r) {
        setRestaurant(r)
        setFormData({
          name: r.name || '',
          description: r.description || '',
          cuisine: Array.isArray(r.cuisine) ? r.cuisine.join(', ') : (r.cuisine || ''),
          deliveryFee: r.deliveryFee || 40,
          deliveryTime: r.deliveryTime || 30,
          minOrderValue: r.minOrderValue || 150,
          isVegOnly: !!r.isVegOnly,
          phone: r.phone || '',
          address: {
            line1: r.address?.line1 || '',
            city: r.address?.city || 'Bengaluru',
            state: r.address?.state || 'Karnataka',
            pincode: r.address?.pincode || '',
          },
        })
      } else {
        setRestaurant(null)
      }
    } catch (err) {
      console.error(err)
      setRestaurant(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        cuisine: formData.cuisine.split(',').map(c => c.trim()).filter(Boolean),
        address: {
          line1: formData.address.line1 || 'Main Food Street',
          city: formData.address.city || 'Bengaluru',
          state: formData.address.state || 'Karnataka',
          pincode: formData.address.pincode || '560001',
        },
      }

      let res;
      if (restaurant?._id) {
        res = await api.put('/restaurants/my-restaurant', payload)
        toast.success('Restaurant profile updated successfully!')
      } else {
        res = await api.post('/restaurants', payload)
        toast.success('Restaurant registered & launched successfully!')
      }
      setRestaurant(res.data.data)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save restaurant details.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">{restaurant ? 'Restaurant Profile' : 'Register Your Restaurant'}</h1>
        <p className="page-subtitle">
          {restaurant
            ? 'Manage your restaurant details, cuisine tags, and delivery settings'
            : 'Fill in your restaurant details to launch on FoodExpress from scratch'}
        </p>
      </div>

      {!restaurant && (
        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl flex items-center gap-3">
          <PlusCircleIcon className="w-8 h-8 text-primary shrink-0" />
          <div>
            <h3 className="font-bold text-sm">Welcome Partner!</h3>
            <p className="text-xs text-orange-700">Register your brand-new restaurant profile below to start receiving customer orders.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <BuildingStorefrontIcon className="w-8 h-8 text-primary" />
          <div>
            <h2 className="font-bold text-lg text-stone-900">{restaurant?.name || (formData.name || 'New Restaurant Registration')}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${restaurant ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
              {restaurant ? 'Active Partner' : 'New Setup'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Restaurant Name</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Suriya's Royal Kitchen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Cuisines Offered (comma separated)</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Biryani, South Indian, Chettinad, Chinese"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Restaurant Description</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Tell customers about your special dishes, fresh ingredients, or family recipes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Delivery Fee (₹)</label>
            <input
              type="number"
              className="input"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="label">Est. Delivery Time (Mins)</label>
            <input
              type="number"
              className="input"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({ ...formData, deliveryTime: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="label">Min Order Value (₹)</label>
            <input
              type="number"
              className="input"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="label">Contact Phone Number</label>
            <input
              type="text"
              className="input"
              required
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-3 gap-2">
            <div>
              <label className="label">Street Address</label>
              <input
                type="text"
                className="input"
                required
                placeholder="123 Commercial Street"
                value={formData.address.line1}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })}
              />
            </div>
            <div>
              <label className="label">City</label>
              <input
                type="text"
                className="input"
                required
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input
                type="text"
                className="input"
                required
                placeholder="560001"
                value={formData.address.pincode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={formData.isVegOnly}
                onChange={(e) => setFormData({ ...formData, isVegOnly: e.target.checked })}
              />
              Pure Veg Restaurant
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-100">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-6">
            <CheckCircleIcon className="w-5 h-5" />
            {saving ? 'Saving...' : restaurant ? 'Save Profile Changes' : 'Register & Launch Restaurant'}
          </button>
        </div>
      </form>
    </div>
  )
}
