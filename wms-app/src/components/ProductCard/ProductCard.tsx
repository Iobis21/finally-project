import { MapPin } from 'lucide-react'
import type { Item } from '../../types'
import './ProductCard.css'

interface ProductCardProps {
  item: Item
}

function getStatus(item: Item) {
  if (item.quantity === 0) return { label: 'ამოწურულია', className: 'badge-danger' }
  if (item.quantity < item.minQuantity) return { label: 'კრიტიკული', className: 'badge-warning' }
  return { label: 'მარაგშია', className: 'badge-success' }
}

function ProductCard({ item }: ProductCardProps) {
  const status = getStatus(item)

  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className="product-card__sku">{item.sku}</span>
        <span className={status.className}>{status.label}</span>
      </div>
      <h3 className="product-card__name">{item.name}</h3>
      <p className="product-card__category">{item.category}</p>
      <div className="product-card__bottom">
        <span className="product-card__qty">
          <strong>{item.quantity}</strong> ცალი
        </span>
        <span className="product-card__location">
          <MapPin size={14} />
          {item.location}
        </span>
      </div>
    </article>
  )
}

export default ProductCard
