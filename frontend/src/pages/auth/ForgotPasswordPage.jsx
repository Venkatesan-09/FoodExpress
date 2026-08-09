import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data) => api.post('/auth/forgot-password', data),
    onSuccess: () => toast.success('Reset link sent! Check your inbox.'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reset link'),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-raised p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🔐</span>
          <h1 className="font-display font-bold text-3xl mt-3 mb-1">Forgot Password</h1>
          <p className="text-text-secondary">Enter your email and we'll send you a reset link</p>
        </div>
        <div className="card p-8">
          {isSuccess ? (
            <div className="text-center py-4 animate-fade-in">
              <span className="text-5xl">📧</span>
              <h3 className="font-bold text-lg mt-3 mb-2">Reset link sent!</h3>
              <p className="text-text-secondary text-sm mb-6">
                If an account with that email exists, we've sent a password reset link.
                Check the Admin panel → Mock Inbox to find the link.
              </p>
              <Link to="/login" className="btn-primary btn-sm">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(mutate)} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="label">Email address</label>
                <input id="fp-email" type="email" className="input" placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isPending} className="btn-primary w-full btn-lg">
                {isPending ? 'Sending…' : 'Send Reset Link'}
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
