import { memo } from 'react'
import { Link } from 'react-router'
import { Crown } from 'lucide-react'
import type { Item } from '../../../types'
import { formatPrice, getCategoryImage } from '../../../utils/stock'
import './TopValueStrip.css'

// ყველაზე ღირებული მარაგი — TOP 5 რეიტინგი (რაოდენობა × ფასი)
// თითო ბარათზე: ადგილი, ფოტო, ღირებულება და მთლიანი მარაგის რა წილია
function TopValueStrip({ items }: { items: Item[] }) {
  const value = (i: Item) => i.quantity * i.price
  const total = items.reduce((sum, i) => sum + value(i), 0) || 1
  const top = [...items].sort((a, b) => value(b) - value(a)).slice(0, 5)

  if (top.length === 0) return null

  return (
    <section className="top-value" aria-labelledby="top-value-title">
      <h2 id="top-value-title" className="top-value__title">
        <Crown size={18} aria-hidden="true" /> ყველაზე ღირებული მარაგი
      </h2>
      <ol className="top-value__list">
        {top.map((item, index) => {
          const share = (value(item) / total) * 100
          return (
            <li key={item.id}>
              <Link to={`/inventory/${item.id}`} className="top-value__card">
                <span className={`top-value__rank top-value__rank--${index + 1}`}>{index + 1}</span>
                <img
                  className="top-value__image"
                  src={item.imageUrl ?? getCategoryImage(item.category)}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                />
                <span className="top-value__body">
                  <span className="top-value__name">{item.name}</span>
                  <span className="top-value__value">{formatPrice(Math.round(value(item)))}</span>
                  <span className="top-value__meta">
                    {item.quantity} ც. × {formatPrice(item.price)}
                  </span>
                  <span className="top-value__bar" aria-hidden="true">
                    <span style={{ width: `${Math.max(share, 3)}%` }} />
                  </span>
                  <span className="top-value__share">{share.toFixed(1)}% მთლიანი მარაგის</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default memo(TopValueStrip)
