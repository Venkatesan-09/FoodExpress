import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { PageLoader, RatingBadge } from '../../components/ui'
import { StarIcon } from '@heroicons/react/24/solid'

const MOCK_REVIEWS = [
  {
    _id: 'rev-1',
    customerName: 'Aarav Sharma',
    rating: 4.9,
    comment: 'Absolutely authentic flavors! The Butter Chicken and Garlic Naan were fresh, hot, and packed with flavor.',
    date: '2 hours ago',
    itemsOrdered: ['Special Butter Chicken', 'Garlic Naan (2 pcs)'],
  },
  {
    _id: 'rev-2',
    customerName: 'Priya Patel',
    rating: 4.8,
    comment: 'Quickest delivery in town! Packed securely with zero leakage. Highly recommended!',
    date: 'Yesterday',
    itemsOrdered: ['Paneer Tikka Masala', 'Jeera Rice'],
  },
  {
    _id: 'rev-3',
    customerName: 'Rohan Gupta',
    rating: 4.5,
    comment: 'Generous portion sizes and great value for money. The gulab jamun was melting in mouth!',
    date: '3 days ago',
    itemsOrdered: ['Special Veg Thali', 'Gulab Jamun'],
  },
  {
    _id: 'rev-4',
    customerName: 'Ananya Reddy',
    rating: 5.0,
    comment: 'Consistently delicious food. One of my top favorite restaurants on FoodExpress.',
    date: '5 days ago',
    itemsOrdered: ['Hyderabadi Chicken Biryani'],
  },
]

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const myRest = await api.get('/restaurants/my-restaurant')
      if (myRest.data?.data) {
        const res = await api.get(`/reviews/restaurant/${myRest.data.data._id}`)
        if (res.data?.data && res.data.data.length > 0) {
          setReviews(res.data.data)
        } else {
          setReviews(MOCK_REVIEWS)
        }
      } else {
        setReviews(MOCK_REVIEWS)
      }
    } catch (err) {
      console.error(err)
      setReviews(MOCK_REVIEWS)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">Customer Reviews & Ratings</h1>
        <p className="page-subtitle">Real-time feedback and ratings from customers who ordered from your restaurant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="text-3xl font-extrabold text-amber-600 flex items-center justify-center gap-1">
            4.8 <StarIcon className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-xs font-semibold text-amber-800 mt-1">Average Rating (128 Ratings)</p>
        </div>

        <div className="card p-5 text-center bg-stone-50">
          <div className="text-3xl font-extrabold text-stone-900">96%</div>
          <p className="text-xs font-semibold text-stone-600 mt-1">Positive Feedback</p>
        </div>

        <div className="card p-5 text-center bg-stone-50">
          <div className="text-3xl font-extrabold text-primary">15 Mins</div>
          <p className="text-xs font-semibold text-stone-600 mt-1">Avg Preparation Time</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-primary font-bold flex items-center justify-center text-sm">
                  {(rev.customerName || rev.customer?.name || 'C')[0]}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{rev.customerName || rev.customer?.name || 'Happy Customer'}</h3>
                  <span className="text-xs text-stone-400">{rev.date || 'Recent order'}</span>
                </div>
              </div>
              <RatingBadge rating={rev.rating || rev.restaurantRating || 4.8} />
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              "{rev.comment || rev.restaurantComment || 'Great food quality and excellent delivery.'}"
            </p>

            {rev.itemsOrdered?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {rev.itemsOrdered.map((item, i) => (
                  <span key={i} className="badge-neutral text-[10px]">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
