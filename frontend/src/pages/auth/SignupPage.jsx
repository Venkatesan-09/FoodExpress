import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

const ROLES = [
  { value: 'customer',          label: '🛍 Customer',           desc: 'Order food from restaurants' },
  { value: 'restaurant_owner', label: '🍳 Restaurant Owner',    desc: 'List and manage your restaurant' },
  { value: 'delivery_partner', label: '🛵 Delivery Partner',   desc: 'Deliver orders and earn' },
]

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'restaurant_owner', 'delivery_partner']),
  vehicleType: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [step, setStep] = useState(1) // 1: basic info, 2: role selection
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: { role: 'customer' },
  })

  const selectedRole = watch('role')

  const handleCopyPassword = () => {
    const pwd = watch('password')
    if (!pwd) {
      toast.error('Please enter a password first')
      return
    }
    navigator.clipboard.writeText(pwd).then(() => {
      toast.success('Password copied to clipboard! 📋')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const handlePasteToConfirm = () => {
    const pwd = watch('password')
    if (pwd) {
      setValue('confirmPassword', pwd, { shouldValidate: true })
      toast.success('Password matched in Confirm field! ✓')
    } else {
      navigator.clipboard.readText().then((text) => {
        if (text) {
          setValue('confirmPassword', text, { shouldValidate: true })
          toast.success('Pasted from clipboard! ✓')
        }
      }).catch(() => {
        toast.error('Please type or copy a password first')
      })
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      const { confirmPassword, ...payload } = data
      return api.post('/auth/register', payload)
    },
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      toast.success('Account created! Welcome to FoodExpress 🎉')
      const roleHome = {
        customer: '/home',
        restaurant_owner: '/owner/dashboard',
        delivery_partner: '/partner/dashboard',
        admin: '/admin/dashboard',
      }
      const targetRoute = roleHome[data.data.user.role] || '/home'
      navigate(targetRoute, { replace: true })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  })

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🍕</div>
          <h1 className="font-display text-4xl font-bold mb-4">Join FoodExpress</h1>
          <p className="text-primary-100 text-lg">Order, manage, or deliver — your role, your choice.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <span className="text-5xl">🍕</span>
            <h2 className="font-display font-bold text-2xl gradient-brand mt-2">FoodExpress</h2>
          </div>

          <h2 className="font-display font-bold text-3xl text-text-primary mb-1">Create account</h2>
          <p className="text-text-secondary mb-6">Join thousands of happy customers</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-primary text-white' : 'bg-stone-100 text-text-tertiary'
                }`}>{s}</div>
                {s < 2 && <div className={`h-0.5 w-12 transition-all ${step > s ? 'bg-primary' : 'bg-stone-200'}`} />}
              </div>
            ))}
            <span className="ml-2 text-sm text-text-secondary">{step === 1 ? 'Basic Info' : 'Choose Role'}</span>
          </div>

          <form onSubmit={handleSubmit(mutate)} noValidate>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <input id="name" className={errors.name ? 'input-error' : 'input'}
                    placeholder="Rahul Sharma" {...register('name')} />
                  {errors.name && <p className="field-error">⚠ {errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="sig-email" className="label">Email</label>
                  <input id="sig-email" type="email" className={errors.email ? 'input-error' : 'input'}
                    placeholder="you@example.com" {...register('email')} />
                  {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="label">Phone <span className="text-text-tertiary">(optional)</span></label>
                  <input id="phone" type="tel" className="input" placeholder="9876543210" {...register('phone')} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="sig-password" className="label !mb-0">Password</label>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      title="Copy password to clipboard"
                    >
                      <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="sig-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${errors.password ? 'input-error' : 'input'} pr-11`}
                      placeholder="Minimum 8 characters"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="confirmPassword" className="label !mb-0">Confirm Password</label>
                    <button
                      type="button"
                      onClick={handlePasteToConfirm}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      title="Paste or match password"
                    >
                      <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                      Paste / Match
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`${errors.confirmPassword ? 'input-error' : 'input'} pr-11`}
                      placeholder="Re-enter password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none p-1"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="field-error">⚠ {errors.confirmPassword.message}</p>}
                </div>
                <button type="button" onClick={handleNextStep} className="btn-primary w-full btn-lg mt-2">
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-text-secondary mb-2">Select how you want to use FoodExpress:</p>
                {ROLES.map((role) => (
                  <label key={role.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRole === role.value
                        ? 'border-primary bg-primary-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input type="radio" className="sr-only" value={role.value}
                      {...register('role')} checked={selectedRole === role.value}
                      onChange={() => setValue('role', role.value)} />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{role.label}</p>
                      <p className="text-sm text-text-secondary">{role.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      selectedRole === role.value ? 'border-primary' : 'border-stone-300'
                    }`}>
                      {selectedRole === role.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </label>
                ))}

                {selectedRole === 'delivery_partner' && (
                  <div className="animate-fade-in">
                    <label htmlFor="vehicleType" className="label">Vehicle Type</label>
                    <select id="vehicleType" className="input" {...register('vehicleType')}>
                      <option value="bicycle">🚲 Bicycle</option>
                      <option value="motorcycle">🛵 Motorcycle</option>
                      <option value="car">🚗 Car</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>
                )}

                {selectedRole === 'restaurant_owner' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 animate-fade-in">
                    ⓘ Your restaurant listing will be reviewed by our team before going live (usually within 24h).
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    ← Back
                  </button>
                  <button type="submit" disabled={isPending} className="btn-primary flex-1 btn-lg">
                    {isPending ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
