import { useInventory } from '../store/inventory/useInventory'

export type { DataSource } from '../store/inventory/inventoryReducer'

// ნივთები და მათი მართვა — გლობალური Store-იდან (InventoryContext).
// ადრე თითო გვერდი თავის useState-ს ინახავდა და სერვერს ცალ-ცალკე ეკითხებოდა;
// ახლა Dashboard, მარაგები და Header ერთსა და იმავე მონაცემებს ხედავენ.
export function useItems() {
  const { state, reload, addItem, editItem, writeOffItem, removeItem } = useInventory()

  return {
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    source: state.source,
    isOffline: state.source !== 'server',
    reload,
    addItem,
    editItem,
    writeOffItem,
    removeItem,
  }
}
