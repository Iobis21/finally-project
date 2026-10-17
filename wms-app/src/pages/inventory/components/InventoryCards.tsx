import { MapPin } from 'lucide-react'
import StatusBadge from '../../../components/StatusBadge/StatusBadge'
import type { Item } from '../../../types'
import { useEventDelegation } from '../../../hooks/useEventDelegation'
import { formatPrice } from '../../../utils/stock'
import RowActions from './RowActions'

// მობილური ხედი — ცხრილის ნაცვლად ბარათები
interface InventoryCardsProps {
  items: Item[]
  onAction: (action: string, id: number) => void
}

function InventoryCards({ items, onAction }: InventoryCardsProps) {
  const listRef = useEventDelegation<HTMLUListElement>(onAction)

  return (
    <ul ref={listRef} className="inventory__cards">
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
          <div className="inventory-card__actions">
            <RowActions id={item.id} name={item.name} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default InventoryCards
