import { useContext } from 'react'
import { getStockStatus } from '../../utils/stock'
import { InventoryContext } from './InventoryContext'

// Custom Hook — ერთადერთი გზა, რომლითაც კომპონენტები Store-ს უკავშირდებიან
export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventory უნდა იყოს InventoryProvider-ის შიგნით')
  return context
}

// სელექტორი: Header-ის მრიცხველებისთვის — სულ რამდენი ნივთია და რამდენია კრიტიკული
export function useInventoryCounts() {
  const { items } = useInventory().state
  return {
    total: items.length,
    critical: items.filter((item) => getStockStatus(item) !== 'in_stock').length,
  }
}
