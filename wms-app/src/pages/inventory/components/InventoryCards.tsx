import { memo } from 'react'
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
  canEdit: boolean
  canWriteOff: boolean
}

interface InventoryCardProps {
  item: Item
  canEdit: boolean
  canWriteOff: boolean
}

const InventoryCard = memo(function InventoryCard({
  item,
  canEdit,
  canWriteOff,
}: InventoryCardProps) {
  return (
    <li className="inventory-card lift">
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
      {(canEdit || canWriteOff) && (
        <div className="inventory-card__actions">
          <RowActions id={item.id} name={item.name} canEdit={canEdit} canWriteOff={canWriteOff} />
        </div>
      )}
    </li>
  )
})

function InventoryCards({ items, onAction, canEdit, canWriteOff }: InventoryCardsProps) {
  const listRef = useEventDelegation<HTMLUListElement>(onAction)

  return (
    <ul ref={listRef} className="inventory__cards">
      {items.map((item) => (
        <InventoryCard key={item.id} item={item} canEdit={canEdit} canWriteOff={canWriteOff} />
      ))}
    </ul>
  )
}

export default memo(InventoryCards)
