import { useCallback, useMemo, useState } from 'react'
import type { Item, ItemStatus } from '../types'
import { compareNames } from '../utils/sort'
import { getStockStatus } from '../utils/stock'
import { useDebounce } from './useDebounce'

export type SortKey = 'name' | 'quantity' | 'price'

// ძებნის, ფილტრების და სორტირების ლოგიკა — გამოყოფილია გვერდის ვიზუალისგან
export function useInventoryFilters(items: Item[]) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<ItemStatus | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

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

  // useCallback — ფუნქცია არ იქმნება თავიდან ყოველ რენდერზე, ამიტომ memo-ცხრილი ტყუილად არ გადაიხატება
  const toggleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortAsc((asc) => !asc)
      } else {
        setSortKey(key)
        setSortAsc(true)
      }
    },
    [sortKey],
  )

  const resetFilters = useCallback(() => {
    setSearch('')
    setCategory('')
    setStatus('')
  }, [])

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
