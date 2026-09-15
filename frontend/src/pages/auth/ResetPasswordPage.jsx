import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data) => api.post(`/auth/reset-password/${token}`, { password: data.password }),
    onSuccess: () => {
      toast.success('Password reset! Please log in.')
      setTimeout(() => navigate('/login'), 2000)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid or expired reset link'),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-raised p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="font-display font-bold text-3xl mt-3 mb-1">Reset Password</h1>
          <p className="text-text-secondary">Enter your new password below</p>
        </div>
        <div className="card p-8">
          {isSuccess ? (
            <div className="text-center py-4">
              <span className="text-5xl">✅</span>
              <h3 className="font-bold text-lg mt-3 mb-2">Password changed!</h3>
              <p className="text-text-secondary text-sm">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(mutate)} noValidate className="space-y-4">
              <div>
                <label htmlFor="new-password" className="label">New Password</label>
                <div className="relative">
                  <input
                    id="new-password"
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
                <label htmlFor="confirm-password" className="label">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirm-password"
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
              <button type="submit" disabled={isPending} className="btn-primary w-full btn-lg">
                {isPending ? 'Resetting…' : 'Reset Password'}
              </button>
              <Link to="/login" className="btn-ghost w-full text-center block btn-sm">
                ← Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
