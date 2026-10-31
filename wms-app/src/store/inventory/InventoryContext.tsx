import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { createItem, deleteItem, getItem, getItems, updateItem } from '../../services/itemService'
import type { Item, ItemStatus, NewItem } from '../../types'
import { inventoryReducer, type InventoryState, type SortKey } from './inventoryReducer'
import { loadFallbackItems, loadInitialState, saveInventory } from './inventoryStorage'

export interface InventoryContextValue {
  state: InventoryState
  // მონაცემები (CRUD)
  reload: () => Promise<void>
  addItem: (data: NewItem) => Promise<void>
  editItem: (id: number, data: NewItem) => Promise<void>
  writeOffItem: (id: number, amount: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  changeStock: (id: number, delta: number) => Promise<void> // მიღება (+) / გაცემა (−)
  // ფილტრები
  setSearch: (search: string) => void
  setCategory: (category: string) => void
  setStatus: (status: ItemStatus | '') => void
  toggleSort: (sortKey: SortKey) => void
  resetFilters: () => void
}

export const InventoryContext = createContext<InventoryContextValue | null>(null)

// Provider — აპის ზედა დონეზე. ნებისმიერი კომპონენტი (Header, Dashboard, მარაგები, მოდალი)
// იღებს ერთსა და იმავე მონაცემებს useInventory()-ით — Prop Drilling-ის გარეშე.
export function InventoryProvider({ children }: { children: ReactNode }) {
  // საწყისი state — localStorage-დან (lazy initializer: იკითხება მხოლოდ ერთხელ)
  const [state, dispatch] = useReducer(inventoryReducer, undefined, loadInitialState)
  // ყოველ ჩატვირთვას აქვს ნომერი — ძველი მოთხოვნის გვიანი პასუხი ახალს ვერ გადაფარავს
  const requestIdRef = useRef(0)

  // ── სინქრონიზაცია localStorage-თან: ნებისმიერი ცვლილება ავტომატურად ინახება ──
  useEffect(() => {
    if (!state.isLoading) saveInventory(state)
  }, [state])

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current
    const timerLabel = `⏱ items:load #${requestId}`
    dispatch({ type: 'LOAD_START' })
    if (import.meta.env.DEV) console.time(timerLabel)
    try {
      const items = await getItems()
      if (requestId !== requestIdRef.current) return
      dispatch({ type: 'LOAD_SUCCESS', items })
      if (import.meta.env.DEV) {
        console.table(
          items.map(({ sku, name, quantity, minQuantity }) => ({
            sku,
            name,
            quantity,
            minQuantity,
          })),
        )
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      // სერვერი გათიშულია — ვაჩვენებთ შენახულ ან დემო მონაცემებს
      if (import.meta.env.DEV) console.warn('სერვერი მიუწვდომელია, ჩაირთო ლოკალური რეჟიმი:', err)
      dispatch({ type: 'LOAD_FALLBACK', ...loadFallbackItems() })
    } finally {
      if (import.meta.env.DEV) console.timeEnd(timerLabel)
    }
  }, [])

  // აპის გახსნისას — სერვერიდან უახლესი მონაცემები
  useEffect(() => {
    reload()
  }, [reload])

  // ── CRUD: ჯერ სერვერი, მერე dispatch — ყველა კომპონენტი მყისიერად განახლდება ──
  const addItem = useCallback(async (data: NewItem) => {
    dispatch({ type: 'ADD_ITEM', item: await createItem(data) })
  }, [])

  const editItem = useCallback(async (id: number, data: NewItem) => {
    dispatch({ type: 'UPDATE_ITEM', item: await updateItem(id, data) })
  }, [])

  // ჩამოწერა — ჩაწერამდე სერვერიდან უახლესი ნაშთი (უარყოფითი ნაშთისა და Race Condition-ის დაცვა)
  const writeOffItem = useCallback(async (id: number, amount: number) => {
    const fresh: Item = await getItem(id)
    if (amount > fresh.quantity) {
      throw new Error(`ნაშთი შეიცვალა — ახლა მხოლოდ ${fresh.quantity} ერთეულია`)
    }
    dispatch({
      type: 'UPDATE_ITEM',
      item: await updateItem(id, { quantity: fresh.quantity - amount }),
    })
  }, [])

  // მიღება / გაცემა — იგივე დაცვა: უახლესი ნაშთი სერვერიდან, უარყოფითი ნაშთი არ დაიშვება
  const changeStock = useCallback(async (id: number, delta: number) => {
    const fresh: Item = await getItem(id)
    if (fresh.quantity + delta < 0) {
      throw new Error(`${fresh.name}: მარაგში მხოლოდ ${fresh.quantity} ერთეულია`)
    }
    dispatch({
      type: 'UPDATE_ITEM',
      item: await updateItem(id, { quantity: fresh.quantity + delta }),
    })
  }, [])

  const removeItem = useCallback(async (id: number) => {
    await deleteItem(id)
    dispatch({ type: 'DELETE_ITEM', id })
  }, [])

  // ── ფილტრები ──
  const setSearch = useCallback((search: string) => dispatch({ type: 'SET_SEARCH', search }), [])
  const setCategory = useCallback(
    (category: string) => dispatch({ type: 'SET_CATEGORY', category }),
    [],
  )
  const setStatus = useCallback(
    (status: ItemStatus | '') => dispatch({ type: 'SET_STATUS', status }),
    [],
  )
  const toggleSort = useCallback(
    (sortKey: SortKey) => dispatch({ type: 'TOGGLE_SORT', sortKey }),
    [],
  )
  const resetFilters = useCallback(() => dispatch({ type: 'RESET_FILTERS' }), [])

  const value = useMemo(
    () => ({
      state,
      reload,
      addItem,
      editItem,
      writeOffItem,
      removeItem,
      changeStock,
      setSearch,
      setCategory,
      setStatus,
      toggleSort,
      resetFilters,
    }),
    [
      state,
      reload,
      addItem,
      editItem,
      writeOffItem,
      removeItem,
      changeStock,
      setSearch,
      setCategory,
      setStatus,
      toggleSort,
      resetFilters,
    ],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}
