import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'

export default function ReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [restaurantRating, setRestaurantRating] = useState(5)
  const [restaurantComment, setRestaurantComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/reviews', {
        orderId: id,
        restaurantRating,
        restaurantComment,
      })
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-6 max-w-xl">
      <div className="card p-6 space-y-6">
        <h1 className="page-title">Rate & Review Order</h1>
        {error && <p className="text-xs text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Restaurant Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRestaurantRating(star)}
                  className="p-1 text-amber-400 focus:outline-none"
                >
                  {star <= restaurantRating ? (
                    <StarIcon className="w-8 h-8" />
                  ) : (
                    <StarOutline className="w-8 h-8 text-stone-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Comments / Feedback</label>
            <textarea
              rows={4}
              className="input"
              placeholder="Tell us about the food quality, taste, and packaging..."
              value={restaurantComment}
              onChange={(e) => setRestaurantComment(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
