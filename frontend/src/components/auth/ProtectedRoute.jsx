import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect to their correct dashboard
    const roleHome = {
      customer: '/home',
      restaurant_owner: '/owner/dashboard',
      delivery_partner: '/partner/dashboard',
      admin: '/admin/dashboard',
    }
    return <Navigate to={roleHome[user?.role] || '/'} replace />
  }

  return <Outlet />
}
