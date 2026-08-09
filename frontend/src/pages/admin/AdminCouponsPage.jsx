import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await api.get('/coupons')
      setCoupons(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Coupon Management</h1>
          <p className="page-subtitle">Manage promotional discounts and offer codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map(cp => (
          <div key={cp._id} className="card p-5 space-y-2 border-l-4 border-l-primary">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-lg text-primary tracking-wider">{cp.code}</span>
              <span className="badge-success text-[10px]">{cp.discountType === 'flat' ? `₹${cp.value} OFF` : `${cp.value}% OFF`}</span>
            </div>
            <p className="text-xs text-stone-600">{cp.description}</p>
            <p className="text-[10px] text-stone-400">Min Order: ₹{cp.minOrderValue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
