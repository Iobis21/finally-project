import { MapPin } from 'lucide-react'
import type { Item } from '../../types'
import StatusBadge from '../StatusBadge/StatusBadge'
import './ProductCard.css'

interface ProductCardProps {
  item: Item
}

function ProductCard({ item }: ProductCardProps) {
  return (
    <article className="product-card lift" tabIndex={0}>
      <div className="product-card__top">
        <span className="product-card__sku">{item.sku}</span>
        <StatusBadge item={item} />
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
