import { Search } from 'lucide-react'
import type { ItemStatus } from '../../../types'
import { statusLabels } from '../../../utils/stock'

interface InventoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  status: ItemStatus | ''
  onStatusChange: (value: ItemStatus | '') => void
  categories: string[]
}

function InventoryFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  categories,
}: InventoryFiltersProps) {
  return (
    <section className="inventory__filters" aria-label="ძებნა და ფილტრები">
      <label className="inventory__search">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">ძებნა</span>
        <input
          type="search"
          className="input"
          placeholder="სახელი, SKU ან შტრიხკოდი..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>

      <label>
        <span className="sr-only">კატეგორია</span>
        <select
          className="input"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">ყველა კატეგორია</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">სტატუსი</span>
        <select
          className="input"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ItemStatus | '')}
        >
          <option value="">ყველა სტატუსი</option>
          {(Object.keys(statusLabels) as ItemStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}

export default InventoryFilters
