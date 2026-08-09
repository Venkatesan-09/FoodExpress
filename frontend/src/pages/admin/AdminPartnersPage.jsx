import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'

export default function AdminPartnersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: { role: 'delivery_partner' } })
      setUsers(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approve = async (id) => {
    try {
      await api.patch(`/admin/partners/${id}/approve`)
      fetchPartners()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Delivery Partners</h1>
        <p className="page-subtitle">Verify and manage delivery partner applications</p>
      </div>

      <div className="card divide-y divide-stone-100">
        {users.map(u => (
          <div key={u._id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900">{u.name}</h3>
              <p className="text-xs text-stone-500">{u.email} • {u.phone} • Vehicle: {u.vehicleType || 'Motorcycle'}</p>
              <span className="badge-info text-[10px] capitalize">{u.verificationStatus || 'Pending'}</span>
            </div>
            {u.verificationStatus !== 'approved' && (
              <button onClick={() => approve(u._id)} className="btn-primary btn-sm">
                Approve Partner
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
