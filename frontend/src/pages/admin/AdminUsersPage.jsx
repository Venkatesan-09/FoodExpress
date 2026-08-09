import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader } from '../../components/ui'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, NoSymbolIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline'

const ROLE_COLORS = {
  customer: 'bg-blue-50 text-blue-700',
  restaurant_owner: 'bg-orange-50 text-orange-700',
  delivery_partner: 'bg-purple-50 text-purple-700',
  admin: 'bg-stone-100 text-stone-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionId, setActionId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter) params.set('role', roleFilter)
      const res = await api.get(`/admin/users?${params.toString()}`)
      setUsers(res.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id, currentState) => {
    setActionId(id)
    try {
      await api.patch(`/admin/users/${id}/toggle-active`)
      toast.success(currentState ? 'User account suspended.' : 'User account reactivated.')
      fetchUsers()
    } catch (err) {
      toast.error('Action failed.')
    } finally {
      setActionId(null)
    }
  }

  const cancelUser = async (id, name) => {
    if (!window.confirm(`Cancel account & revoke access for "${name}"? This action cannot be undone.`)) return
    setActionId(id)
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success(`Account for "${name}" has been cancelled and removed.`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel account.')
    } finally {
      setActionId(null)
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage registered users, roles, and account access</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input text-sm py-1.5 w-48"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="restaurant_owner">Restaurant Owner</option>
            <option value="delivery_partner">Delivery Partner</option>
            <option value="admin">Admin</option>
          </select>
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search name or email…"
              className="input pl-9 text-sm py-1.5 w-56"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card divide-y divide-stone-100">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-stone-500 text-sm">No users found.</div>
        )}
        {filtered.map(u => (
          <div key={u._id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                {u.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{u.name}</h3>
                <p className="text-xs text-stone-500">{u.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md capitalize ${ROLE_COLORS[u.role] || 'bg-stone-100 text-stone-600'}`}>
                    {u.role?.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-semibold ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                    {u.isActive ? '● Active' : '● Suspended'}
                  </span>
                </div>
              </div>
            </div>

            {u.role !== 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(u._id, u.isActive)}
                  disabled={actionId === u._id}
                  className={`btn-sm flex items-center gap-1 ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                >
                  {u.isActive
                    ? <><NoSymbolIcon className="w-3.5 h-3.5" /> Suspend</>
                    : <><CheckCircleIcon className="w-3.5 h-3.5" /> Activate</>
                  }
                </button>
                <button
                  onClick={() => cancelUser(u._id, u.name)}
                  disabled={actionId === u._id}
                  className="btn-sm btn-danger flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white border-0"
                  title="Cancel account & revoke email access"
                >
                  <TrashIcon className="w-3.5 h-3.5" /> Cancel Account
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-400 text-right">{filtered.length} user(s) shown</p>
    </div>
  )
}
