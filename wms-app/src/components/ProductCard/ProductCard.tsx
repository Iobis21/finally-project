import { memo } from 'react'
import { MapPin } from 'lucide-react'
import type { Item } from '../../types'
import { getCategoryImage } from '../../utils/stock'
import StatusBadge from '../StatusBadge/StatusBadge'
import './ProductCard.css'

interface ProductCardProps {
  item: Item
}

function ProductCard({ item }: ProductCardProps) {
  return (
    <article className="product-card lift" tabIndex={0}>
      {/* loading="lazy" — სურათი იტვირთება მხოლოდ ეკრანთან მიახლოებისას;
          width/height — გვერდი არ „ხტება" ჩატვირთვისას */}
      <img
        className="product-card__image"
        src={item.imageUrl ?? getCategoryImage(item.category)}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
      />
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

export default memo(ProductCard)
