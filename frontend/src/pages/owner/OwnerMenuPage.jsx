import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { PageLoader, Price, VegDot } from '../../components/ui'
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'

export default function OwnerMenuPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasRestaurant, setHasRestaurant] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    price: 180,
    discountedPrice: 160,
    isVeg: true,
    description: '',
    image: '',
  })
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append('image', file)

    try {
      const res = await api.post('/uploads/image', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (res.data?.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.data.url }))
      }
    } catch (err) {
      console.error('Failed to upload image:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const myRest = await api.get('/restaurants/my-restaurant')
      const r = myRest.data?.data
      if (!r) {
        setHasRestaurant(false)
        return
      }
      setHasRestaurant(true)
      const res = await api.get(`/menu-items/restaurant/${r._id}`)
      setItems(res.data.data || [])
    } catch (err) {
      console.error(err)
      setHasRestaurant(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const myRest = await api.get('/restaurants/my-restaurant')
      if (!myRest.data?.data) return
      await api.post('/menu-items', {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        restaurant: myRest.data.data._id,
      })
      setShowModal(false)
      setFormData({
        name: '',
        category: 'Main Course',
        price: 180,
        discountedPrice: 160,
        isVeg: true,
        description: '',
        image: '',
      })
      fetchMenu()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStock = async (id) => {
    try {
      await api.patch(`/menu-items/${id}/toggle-stock`)
      fetchMenu()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await api.delete(`/menu-items/${id}`)
      fetchMenu()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <PageLoader />

  if (!hasRestaurant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5 p-8">
        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center">
          <BuildingStorefrontIcon className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-extrabold font-display text-stone-900">No Restaurant Profile Found</h2>
        <p className="text-stone-500 max-w-sm text-sm">Please register your restaurant before managing your menu.</p>
        <Link to="/owner/profile" className="btn-primary px-8 py-3">
          Register Restaurant First →
        </Link>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category || 'General')))]

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((i) => i.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Manage dishes, pricing, availability, and categories</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5">
          <PlusIcon className="w-5 h-5" /> Add New Dish
        </button>
      </div>

      {/* ── Category Filters ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Menu List ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item._id} className="card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="relative h-36 rounded-xl overflow-hidden bg-stone-100 mb-2">
                <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 badge-neutral text-[10px] bg-white/90 backdrop-blur-sm shadow-sm">{item.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <VegDot isVeg={item.isVeg} />
                <span className={`text-xs font-semibold ${item.inStock !== false ? 'text-green-600' : 'text-red-500'}`}>
                  {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <h3 className="font-bold text-stone-900">{item.name}</h3>
              <Price amount={item.discountedPrice || item.price} originalAmount={item.discountedPrice ? item.price : null} size="sm" />
              <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <button
                onClick={() => handleToggleStock(item._id)}
                className={`text-xs font-semibold flex items-center gap-1 ${
                  item.inStock !== false ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'
                }`}
              >
                {item.inStock !== false ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                {item.inStock !== false ? 'Mark Unavailable' : 'Mark Available'}
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Dish"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Dish Modal ── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box p-6 space-y-4 max-w-md">
            <h3 className="font-bold text-lg font-display">Add New Dish</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Category</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Main Course"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Price (₹)</label>
                  <input
                    type="number"
                    className="input"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">Dish Image</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                      {uploading ? 'Uploading...' : 'Choose File'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                    <span className="text-xs text-stone-500">or enter URL below</span>
                  </div>
                  <input
                    type="url"
                    className="input"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    disabled={uploading}
                  />
                  {formData.image && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 mt-1">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[60px]"
                  placeholder="Short description of ingredients or taste"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  />
                  Vegetarian Dish
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
