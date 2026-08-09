import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'
import { useSocketStore } from './stores/socketStore'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import CustomerLayout from './layouts/CustomerLayout'
import OwnerLayout from './layouts/OwnerLayout'
import PartnerLayout from './layouts/PartnerLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import NotFoundPage from './pages/NotFoundPage'

// Customer Pages
import HomePage from './pages/customer/HomePage'
import RestaurantListPage from './pages/customer/RestaurantListPage'
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderTrackingPage from './pages/customer/OrderTrackingPage'
import OrderHistoryPage from './pages/customer/OrderHistoryPage'
import ReviewPage from './pages/customer/ReviewPage'
import ProfilePage from './pages/customer/ProfilePage'
import FavoritesPage from './pages/customer/FavoritesPage'

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'
import OwnerOrderQueuePage from './pages/owner/OwnerOrderQueuePage'
import OwnerMenuPage from './pages/owner/OwnerMenuPage'
import OwnerProfilePage from './pages/owner/OwnerProfilePage'
import OwnerReviewsPage from './pages/owner/OwnerReviewsPage'

// Partner Pages
import PartnerDashboardPage from './pages/partner/PartnerDashboardPage'
import PartnerAvailableOrdersPage from './pages/partner/PartnerAvailableOrdersPage'
import PartnerActiveDeliveryPage from './pages/partner/PartnerActiveDeliveryPage'
import PartnerEarningsPage from './pages/partner/PartnerEarningsPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage'
import AdminPartnersPage from './pages/admin/AdminPartnersPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminCouponsPage from './pages/admin/AdminCouponsPage'

export default function App() {
  const { isAuthenticated, accessToken } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  // Connect / disconnect socket based on auth state
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect(accessToken)
    } else {
      disconnect()
    }
  }, [isAuthenticated, accessToken])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* ── Public ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Customer ── */}
        <Route element={<ProtectedRoute roles={['customer']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/restaurants" element={<RestaurantListPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
            <Route path="/orders/:id/review" element={<ReviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Route>
        </Route>

        {/* ── Restaurant Owner ── */}
        <Route element={<ProtectedRoute roles={['restaurant_owner']} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/orders" element={<OwnerOrderQueuePage />} />
            <Route path="/owner/menu" element={<OwnerMenuPage />} />
            <Route path="/owner/profile" element={<OwnerProfilePage />} />
            <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
          </Route>
        </Route>

        {/* ── Delivery Partner ── */}
        <Route element={<ProtectedRoute roles={['delivery_partner']} />}>
          <Route element={<PartnerLayout />}>
            <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
            <Route path="/partner/available" element={<PartnerAvailableOrdersPage />} />
            <Route path="/partner/orders/available" element={<PartnerAvailableOrdersPage />} />
            <Route path="/partner/orders/active" element={<PartnerActiveDeliveryPage />} />
            <Route path="/partner/earnings" element={<PartnerEarningsPage />} />
          </Route>
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
            <Route path="/admin/partners" element={<AdminPartnersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          </Route>
        </Route>

        {/* ── Role-based redirect from / ── */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  const redirectMap = {
    customer: '/home',
    restaurant_owner: '/owner/dashboard',
    delivery_partner: '/partner/dashboard',
    admin: '/admin/dashboard',
  }
  return <Navigate to={redirectMap[user.role] || '/home'} replace />
}
