import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function NotFoundPage() {
  const { user } = useAuthStore()

  let homePath = '/home'
  if (user?.role === 'delivery_partner') homePath = '/partner/dashboard'
  else if (user?.role === 'restaurant_owner') homePath = '/owner/dashboard'
  else if (user?.role === 'admin') homePath = '/admin/dashboard'

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-4 text-center">
      <div className="text-8xl mb-4">🍕 404</div>
      <h1 className="text-3xl font-bold font-display text-stone-900 mb-2">Page Not Found</h1>
      <p className="text-stone-600 max-w-md mb-6">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to={homePath} className="btn-primary px-6 py-2.5">
        Back to Dashboard
      </Link>
    </div>
  )
}
