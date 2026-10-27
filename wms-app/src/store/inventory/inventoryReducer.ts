import type { Item, ItemStatus } from '../../types'

export type DataSource = 'server' | 'cache' | 'demo'
export type SortKey = 'name' | 'quantity' | 'price'

export interface InventoryFilters {
  search: string
  category: string
  status: ItemStatus | ''
  sortKey: SortKey
  sortAsc: boolean
}

// ── მთელი მარაგების მდგომარეობა ერთ ადგილას (Single Source of Truth) ──
export interface InventoryState {
  items: Item[]
  source: DataSource
  isLoading: boolean
  error: string | null
  filters: InventoryFilters
}

export const initialFilters: InventoryFilters = {
  search: '',
  category: '',
  status: '',
  sortKey: 'name',
  sortAsc: true,
}

export const initialState: InventoryState = {
  items: [],
  source: 'server',
  isLoading: true,
  error: null,
  filters: initialFilters,
}

// ── ყველა შესაძლო მოქმედება (Action) ──
export type InventoryAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; items: Item[] }
  | { type: 'LOAD_FALLBACK'; items: Item[]; source: 'cache' | 'demo' }
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'UPDATE_ITEM'; item: Item }
  | { type: 'DELETE_ITEM'; id: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_STATUS'; status: ItemStatus | '' }
  | { type: 'TOGGLE_SORT'; sortKey: SortKey }
  | { type: 'RESET_FILTERS' }

// Reducer — სუფთა ფუნქცია: იღებს ძველ state-ს და action-ს, აბრუნებს ახალ state-ს.
// state პირდაპირ არასდროს იცვლება — ყოველთვის იქმნება ახალი ობიექტი (immutability).
export function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null }

    case 'LOAD_SUCCESS':
      return { ...state, items: action.items, source: 'server', isLoading: false }

    case 'LOAD_FALLBACK':
      return { ...state, items: action.items, source: action.source, isLoading: false }

    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.item.id ? action.item : item)),
      }

    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) }

    case 'SET_SEARCH':
      return { ...state, filters: { ...state.filters, search: action.search } }

    case 'SET_CATEGORY':
      return { ...state, filters: { ...state.filters, category: action.category } }

    case 'SET_STATUS':
      return { ...state, filters: { ...state.filters, status: action.status } }

    case 'TOGGLE_SORT': {
      const { sortKey, sortAsc } = state.filters
      return {
        ...state,
        filters: {
          ...state.filters,
          sortKey: action.sortKey,
          // იგივე სვეტი → მიმართულების შეცვლა; ახალი სვეტი → ზრდადობით
          sortAsc: action.sortKey === sortKey ? !sortAsc : true,
        },
      }
    }

    case 'RESET_FILTERS':
      return { ...state, filters: { ...state.filters, search: '', category: '', status: '' } }

    default:
      return state
  }
}
