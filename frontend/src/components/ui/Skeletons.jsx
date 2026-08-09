// Skeleton loading components
export function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-4 rounded-lg ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonMenuItems({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 card items-start">
          <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4 rounded-lg" />
            <div className="skeleton h-4 w-full rounded-lg" />
            <div className="skeleton h-4 w-1/2 rounded-lg" />
            <div className="skeleton h-8 w-24 rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonOrderCard({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex justify-between">
            <div className="skeleton h-5 w-40 rounded-lg" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="skeleton h-4 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-1/3 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-8 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}
