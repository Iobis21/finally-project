import { MapPin } from 'lucide-react'
import type { Item } from '../../types'
import { getStockStatus, statusBadges, statusLabels } from '../../utils/stock'
import './ProductCard.css'

interface ProductCardProps {
  item: Item
}

function ProductCard({ item }: ProductCardProps) {
  const status = getStockStatus(item)

  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className="product-card__sku">{item.sku}</span>
        <span className={statusBadges[status]}>{statusLabels[status]}</span>
      </div>
      <h3 className="product-card__name">{item.name}</h3>
      <p className="product-card__category">{item.category}</p>
      <div className="product-card__bottom">
        <span className="product-card__qty">
          <strong>{item.quantity}</strong> ცალი
        </span>
        <span className="product-card__location">
          <MapPin size={14} aria-hidden="true" />
          {item.location}
        </span>
      </div>
    </article>
  )
}

export default ProductCard
