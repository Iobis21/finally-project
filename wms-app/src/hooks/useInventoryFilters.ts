import { useMemo } from 'react'
import { useInventory } from '../store/inventory/useInventory'
import type { Item } from '../types'
import { compareNames } from '../utils/sort'
import { getStockStatus } from '../utils/stock'
import { useDebounce } from './useDebounce'

export type { SortKey } from '../store/inventory/inventoryReducer'

// ძებნა, ფილტრები და სორტირება. ფილტრების მნიშვნელობები გლობალურ Store-შია —
// ამიტომ გვერდის Refresh-ის ან სხვა გვერდიდან დაბრუნების შემდეგ ისინი რჩება.
export function useInventoryFilters(items: Item[]) {
  const { state, setSearch, setCategory, setStatus, toggleSort, resetFilters } = useInventory()
  const { search, category, status, sortKey, sortAsc } = state.filters

  // ველში ტექსტი მაშინვე ჩანს, მაგრამ ძებნა იწყება ბეჭდვის შეწყვეტიდან 300ms-ში
  const debouncedSearch = useDebounce(search, 300)

  const visibleItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

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
          sortKey === 'name' ? compareNames(a.name, b.name) : a[sortKey] - b[sortKey]
        return sortAsc ? result : -result
      })
  }, [items, debouncedSearch, category, status, sortKey, sortAsc])

  const categories = useMemo(() => [...new Set(items.map((item) => item.category))], [items])

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
