import { MapPin } from 'lucide-react'
import StatusBadge from '../../../components/StatusBadge/StatusBadge'
import type { Item } from '../../../types'
import { formatPrice } from '../../../utils/stock'

// მობილური ხედი — ცხრილის ნაცვლად ბარათები
function InventoryCards({ items }: { items: Item[] }) {
  return (
    <ul className="inventory__cards">
      {items.map((item) => (
        <li key={item.id} className="inventory-card">
          <div className="inventory-card__top">
            <h2 className="inventory-card__name">{item.name}</h2>
            <StatusBadge item={item} />
          </div>
          <p className="inventory-card__meta">
            <span className="inventory__sku">{item.sku}</span> · {item.category}
          </p>
          <dl className="inventory-card__details">
            <div>
              <dt>რაოდენობა</dt>
              <dd>
                {item.quantity} / {item.minQuantity}
              </dd>
            </div>
            <div>
              <dt>ფასი</dt>
              <dd>{formatPrice(item.price)}</dd>
            </div>
            <div>
              <dt>თარო</dt>
              <dd>
                <MapPin size={13} aria-hidden="true" /> {item.location}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}

export default InventoryCards
