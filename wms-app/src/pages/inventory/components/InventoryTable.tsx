import { ArrowDown, ArrowUp } from 'lucide-react'
import StatusBadge from '../../../components/StatusBadge/StatusBadge'
import type { SortKey } from '../../../hooks/useInventoryFilters'
import type { Item } from '../../../types'
import { useEventDelegation } from '../../../hooks/useEventDelegation'
import { formatPrice } from '../../../utils/stock'
import RowActions from './RowActions'

interface InventoryTableProps {
  items: Item[]
  sortKey: SortKey
  sortAsc: boolean
  onSort: (key: SortKey) => void
  onAction: (action: string, id: number) => void
}

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'დასახელება' },
  { key: 'quantity', label: 'რაოდენობა' },
  { key: 'price', label: 'ფასი' },
]

interface SortHeaderProps {
  column: (typeof sortableColumns)[number]
  sortKey: SortKey
  sortAsc: boolean
  onSort: (key: SortKey) => void
}

function SortHeader({ column, sortKey, sortAsc, onSort }: SortHeaderProps) {
  const isActive = column.key === sortKey

  return (
    <th scope="col" aria-sort={isActive ? (sortAsc ? 'ascending' : 'descending') : 'none'}>
      <button className="inventory__sort" onClick={() => onSort(column.key)}>
        {column.label}
        {isActive && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
      </button>
    </th>
  )
}

function InventoryTable({ items, sortKey, sortAsc, onSort, onAction }: InventoryTableProps) {
  // ერთი მსმენელი მთელ ცხრილზე — Event Delegation
  const tableRef = useEventDelegation<HTMLTableElement>(onAction)

  return (
    <div className="inventory__table-wrap">
      <table ref={tableRef} className="inventory__table">
        <thead>
          <tr>
            <th scope="col">SKU</th>
            <SortHeader column={sortableColumns[0]} sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <th scope="col">კატეგორია</th>
            <SortHeader column={sortableColumns[1]} sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <SortHeader column={sortableColumns[2]} sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <th scope="col">თარო</th>
            <th scope="col">სტატუსი</th>
            <th scope="col">
              <span className="sr-only">მოქმედებები</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="inventory__sku">{item.sku}</td>
              <td className="inventory__name">{item.name}</td>
              <td>{item.category}</td>
              <td>
                <strong>{item.quantity}</strong> / {item.minQuantity}
              </td>
              <td>{formatPrice(item.price)}</td>
              <td>{item.location}</td>
              <td>
                <StatusBadge item={item} />
              </td>
              <td>
                <RowActions id={item.id} name={item.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
