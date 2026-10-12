import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, MapPin, PackageSearch, Search } from 'lucide-react'
import EmptyState from '../../components/EmptyState/EmptyState'
import { items } from '../../data/items'
import type { Item, ItemStatus } from '../../types'
import { formatPrice, getStockStatus, statusBadges, statusLabels } from '../../utils/stock'
import './InventoryPage.css'

type SortKey = 'name' | 'quantity' | 'price'

const categories = [...new Set(items.map((item) => item.category))]

function InventoryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<ItemStatus | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  // ძებნა + ფილტრები + სორტირება
  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items
      .filter((item) => {
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.barcode.includes(query)
        const matchesCategory = !category || item.category === category
        const matchesStatus = !status || getStockStatus(item) === status
        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        const result =
          sortKey === 'name' ? a.name.localeCompare(b.name, 'ka') : a[sortKey] - b[sortKey]
        return sortAsc ? result : -result
      })
  }, [search, category, status, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  function resetFilters() {
    setSearch('')
    setCategory('')
    setStatus('')
  }

  const hasFilters = search || category || status

  return (
    <>
      <div className="inventory__header">
        <h1>მარაგები</h1>
        <p className="inventory__count">
          ნაჩვენებია {visibleItems.length} / {items.length}
        </p>
      </div>

      <section className="inventory__filters" aria-label="ძებნა და ფილტრები">
        <label className="inventory__search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">ძებნა</span>
          <input
            type="search"
            className="input"
            placeholder="სახელი, SKU ან შტრიხკოდი..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label>
          <span className="sr-only">კატეგორია</span>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
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
            onChange={(e) => setStatus(e.target.value as ItemStatus | '')}
          >
            <option value="">ყველა სტატუსი</option>
            <option value="in_stock">მარაგშია</option>
            <option value="low_stock">კრიტიკული</option>
            <option value="out_of_stock">ამოწურულია</option>
          </select>
        </label>

        {hasFilters && (
          <button className="btn-secondary" onClick={resetFilters}>
            გასუფთავება
          </button>
        )}
      </section>

      {visibleItems.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="ნივთი ვერ მოიძებნა"
          text="სცადეთ სხვა სიტყვა ან გაასუფთავეთ ფილტრები."
          actionLabel="ფილტრების გასუფთავება"
          onAction={resetFilters}
        />
      ) : (
        <>
          {/* დესკტოპი: ცხრილი */}
          <div className="inventory__table-wrap">
            <table className="inventory__table">
              <thead>
                <tr>
                  <th scope="col">SKU</th>
                  <SortableHeader label="დასახელება" sortKey="name" current={sortKey} asc={sortAsc} onSort={handleSort} />
                  <th scope="col">კატეგორია</th>
                  <SortableHeader label="რაოდენობა" sortKey="quantity" current={sortKey} asc={sortAsc} onSort={handleSort} />
                  <SortableHeader label="ფასი" sortKey="price" current={sortKey} asc={sortAsc} onSort={handleSort} />
                  <th scope="col">თარო</th>
                  <th scope="col">სტატუსი</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <InventoryRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>

          {/* მობილური: ბარათები */}
          <ul className="inventory__cards">
            {visibleItems.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}

interface SortableHeaderProps {
  label: string
  sortKey: SortKey
  current: SortKey
  asc: boolean
  onSort: (key: SortKey) => void
}

function SortableHeader({ label, sortKey, current, asc, onSort }: SortableHeaderProps) {
  const isActive = sortKey === current

  return (
    <th scope="col" aria-sort={isActive ? (asc ? 'ascending' : 'descending') : 'none'}>
      <button className="inventory__sort" onClick={() => onSort(sortKey)}>
        {label}
        {isActive && (asc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
      </button>
    </th>
  )
}

function InventoryRow({ item }: { item: Item }) {
  const status = getStockStatus(item)

  return (
    <tr>
      <td className="inventory__sku">{item.sku}</td>
      <td className="inventory__name">{item.name}</td>
      <td>{item.category}</td>
      <td>
        <strong>{item.quantity}</strong> / {item.minQuantity}
      </td>
      <td>{formatPrice(item.price)}</td>
      <td>{item.location}</td>
      <td>
        <span className={statusBadges[status]}>{statusLabels[status]}</span>
      </td>
    </tr>
  )
}

function InventoryCard({ item }: { item: Item }) {
  const status = getStockStatus(item)

  return (
    <li className="inventory-card">
      <div className="inventory-card__top">
        <h2 className="inventory-card__name">{item.name}</h2>
        <span className={statusBadges[status]}>{statusLabels[status]}</span>
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
  )
}

export default InventoryPage
