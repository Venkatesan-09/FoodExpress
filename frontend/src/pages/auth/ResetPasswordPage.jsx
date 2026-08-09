import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
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
                <input id="new-password" type="password" className={errors.password ? 'input-error' : 'input'}
                  placeholder="Minimum 8 characters" {...register('password')} />
                {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="confirm-password" className="label">Confirm Password</label>
                <input id="confirm-password" type="password" className={errors.confirmPassword ? 'input-error' : 'input'}
                  placeholder="Re-enter password" {...register('confirmPassword')} />
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
