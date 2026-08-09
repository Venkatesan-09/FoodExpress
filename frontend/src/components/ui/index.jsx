import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'

// Veg / Non-veg indicator dot
export function VegDot({ isVeg }) {
  return isVeg ? (
    <span className="veg-dot" title="Vegetarian" aria-label="Vegetarian" />
  ) : (
    <span className="nonveg-dot" title="Non-vegetarian" aria-label="Non-vegetarian" />
  )
}

// Star rating display
export function StarRating({ rating = 0, max = 5, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        i < Math.floor(rating)
          ? <StarIcon key={i} className={`${sizeClass} text-amber-400`} />
          : <StarOutline key={i} className={`${sizeClass} text-stone-300`} />
      ))}
    </div>
  )
}

// Green rating badge (like Zomato style)
export function RatingBadge({ rating, count }) {
  if (!rating) return null
  return (
    <span className="rating-badge" aria-label={`Rating: ${rating}`}>
      <StarIcon className="w-3 h-3" />
      {rating.toFixed(1)}
      {count && <span className="ml-1 opacity-75 font-normal text-[10px]">({count})</span>}
    </span>
  )
}

// Order status badge
const STATUS_CONFIG = {
  pending:           { label: 'Pending',          cls: 'status-pending' },
  confirmed:         { label: 'Confirmed',         cls: 'status-confirmed' },
  preparing:         { label: 'Preparing',         cls: 'status-preparing' },
  ready_for_pickup:  { label: 'Ready for Pickup',  cls: 'status-ready_for_pickup' },
  out_for_delivery:  { label: 'Out for Delivery',  cls: 'status-out_for_delivery' },
  delivered:         { label: 'Delivered',         cls: 'status-delivered' },
  cancelled:         { label: 'Cancelled',         cls: 'status-cancelled' },
  failed:            { label: 'Failed',            cls: 'status-failed' },
}
export function OrderStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-neutral' }
  return <span className={cfg.cls}>{cfg.label}</span>
}

// Price display
export function Price({ amount, className = '', size = 'base' }) {
  const sizeMap = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl' }
  return (
    <span className={`font-bold ${sizeMap[size]} ${className}`}>
      ₹{amount?.toLocaleString('en-IN') ?? '0'}
    </span>
  )
}

// Empty state
export function EmptyState({ icon = '🍽️', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="font-display font-bold text-xl text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}

// Error state
export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">😕</span>
      <p className="text-text-secondary mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary btn-sm">Try Again</button>
      )}
    </div>
  )
}

// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizeMap[size]} border-3 border-primary-200 border-t-primary rounded-full animate-spin ${className}`}
         style={{ borderWidth: '3px' }} role="status" aria-label="Loading" />
  )
}

// Page loading overlay
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-text-tertiary text-sm">Loading…</p>
      </div>
    </div>
  )
}

// Quantity stepper
export function QuantityStepper({ quantity, onDecrement, onIncrement, min = 0 }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        disabled={quantity <= min}
        className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 font-bold text-lg
                   hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed
                   flex items-center justify-center transition-all active:scale-90"
        aria-label="Decrease"
      >−</button>
      <span className="w-6 text-center font-bold text-text-primary">{quantity}</span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-lg
                   hover:bg-primary-700 flex items-center justify-center
                   transition-all active:scale-90 shadow-sm"
        aria-label="Increase"
      >+</button>
    </div>
  )
}

// Confirmation modal
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box max-w-sm p-6">
        <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
