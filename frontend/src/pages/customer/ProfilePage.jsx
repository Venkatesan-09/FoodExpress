import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/auth/me', { name, phone })
      updateUser(res.data.data)
      toast.success('Profile updated successfully! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-page py-6 max-w-2xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account details and preferences</p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary flex items-center justify-center font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-bold text-lg text-stone-900">{user?.name}</h2>
            <p className="text-xs text-stone-500 capitalize">{user?.role?.replace('_', ' ')} Account</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input bg-stone-50" value={user?.email || ''} disabled />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
