import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = location.state?.from?.pathname

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}! 👋`)
      const roleHome = {
        customer: '/home',
        restaurant_owner: '/owner/dashboard',
        delivery_partner: '/partner/dashboard',
        admin: '/admin/dashboard',
      }
      navigate(from || roleHome[data.data.user.role] || '/home', { replace: true })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    },
  })

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white">
        <div className="max-w-md text-center">
          <div className="text-8xl mb-6">🍕</div>
          <h1 className="font-display text-4xl font-bold mb-4">FoodExpress</h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Your favourite restaurants, delivered fast. Hot food, happy you.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[['500+', 'Restaurants'], ['50K+', 'Orders Delivered'], ['4.8★', 'Customer Rating']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-display font-bold">{val}</div>
                <div className="text-primary-200 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🍕</span>
            <h2 className="font-display font-bold text-2xl gradient-brand mt-2">FoodExpress</h2>
          </div>

          <h2 className="font-display font-bold text-3xl text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-secondary mb-8">Sign in to order your favourite food</p>

          <form onSubmit={handleSubmit(mutate)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" type="email" className={errors.email ? 'input-error' : 'input'}
                placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <input id="password" type="password" className={errors.password ? 'input-error' : 'input'}
                placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isPending} className="btn-primary w-full btn-lg mt-2">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            New to FoodExpress?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Create account</Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <p className="font-semibold mb-1">🧪 Demo Credentials</p>
            <p>Customer: <span className="font-mono">rahul@demo.com</span> / Customer@123</p>
            <p>Owner: <span className="font-mono">meera@demo.com</span> / Owner@123456</p>
            <p>Partner: <span className="font-mono">ravi@demo.com</span> / Partner@123</p>
            <p>Admin: <span className="font-mono">admin@foodexpress.demo</span> / Admin@123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
