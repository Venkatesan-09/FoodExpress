import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui'

export default function FavoritesPage() {
  return (
    <div className="container-page py-6 max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">Favorites</h1>
        <p className="page-subtitle">Saved restaurants and dishes</p>
      </div>

      <EmptyState
        icon="❤️"
        title="No Saved Favorites"
        description="Explore restaurants and tap the heart icon to save them for later."
        action={<Link to="/restaurants" className="btn-primary">Explore Restaurants</Link>}
      />
    </div>
  )
}
