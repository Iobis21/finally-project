import type { Item, ItemStatus } from '../types'

// ნივთის სტატუსი რაოდენობის მიხედვით
export function getStockStatus(item: Item): ItemStatus {
  if (item.quantity === 0) return 'out_of_stock'
  if (item.quantity < item.minQuantity) return 'low_stock'
  return 'in_stock'
}

export const statusLabels: Record<ItemStatus, string> = {
  in_stock: 'მარაგშია',
  low_stock: 'კრიტიკული',
  out_of_stock: 'ამოწურულია',
}

export const statusBadges: Record<ItemStatus, string> = {
  in_stock: 'badge-success',
  low_stock: 'badge-warning',
  out_of_stock: 'badge-danger',
}

export function formatPrice(value: number) {
  return `${value.toLocaleString('ka-GE')} ₾`
}
