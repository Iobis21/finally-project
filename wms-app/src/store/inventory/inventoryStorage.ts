import { fallbackItems } from '../../data/fallbackItems'
import type { Item } from '../../types'
import {
  initialFilters,
  initialState,
  type InventoryFilters,
  type InventoryState,
} from './inventoryReducer'

const STORAGE_KEY = 'wms-inventory'

interface PersistedInventory {
  items: Item[]
  filters: InventoryFilters
  savedAt: string
}

// localStorage-ში ინახება ნივთები და ფილტრები (isLoading / error — არა, ისინი დროებითია)
export function saveInventory(state: InventoryState) {
  try {
    const data: PersistedInventory = {
      items: state.items,
      filters: state.filters,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage შეიძლება იყოს გამორთული ან სავსე — აპი მაინც მუშაობს
  }
}

function readInventory(): PersistedInventory | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const data = JSON.parse(saved) as PersistedInventory
    return Array.isArray(data.items) ? data : null
  } catch {
    return null // დაზიანებული მონაცემი — ვიწყებთ თავიდან
  }
}

// საწყისი state: localStorage-დან (გვერდის Refresh-ის შემდეგ მონაცემები და ფილტრები რჩება)
export function loadInitialState(): InventoryState {
  const saved = readInventory()
  if (!saved) return initialState

  return {
    ...initialState,
    items: saved.items,
    filters: { ...initialFilters, ...saved.filters },
    // თუ ნივთები უკვე გვაქვს, Skeleton-ს არ ვაჩვენებთ — სერვერიდან განახლება ფონურად მოვა
    isLoading: saved.items.length === 0,
  }
}

// სერვერის გათიშვისას: ჯერ შენახული ნივთები, თუ არ არის — დემო მონაცემები
export function loadFallbackItems(): { items: Item[]; source: 'cache' | 'demo' } {
  const saved = readInventory()
  if (saved && saved.items.length > 0) return { items: saved.items, source: 'cache' }
  return { items: fallbackItems, source: 'demo' }
}
