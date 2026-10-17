import { useMemo, useState } from 'react'
import type { Item, ItemStatus } from '../types'
import { getStockStatus } from '../utils/stock'

export type SortKey = 'name' | 'quantity' | 'price'

// ძებნის, ფილტრების და სორტირების ლოგიკა — გამოყოფილია გვერდის ვიზუალისგან
export function useInventoryFilters(items: Item[]) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<ItemStatus | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

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
  }, [items, search, category, status, sortKey, sortAsc])

  const categories = useMemo(() => [...new Set(items.map((item) => item.category))], [items])

  function toggleSort(key: SortKey) {
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

  return {
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    sortKey,
    sortAsc,
    toggleSort,
    resetFilters,
    hasFilters: Boolean(search || category || status),
    visibleItems,
    categories,
  }
}
