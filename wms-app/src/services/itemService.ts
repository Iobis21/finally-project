import type { Item } from '../types'
import { apiGet, apiPatch } from './apiClient'

export function getItems() {
  return apiGet<Item[]>('/items')
}

export function getItem(id: number) {
  return apiGet<Item>(`/items/${id}`)
}

export function updateItemQuantity(id: number, quantity: number) {
  return apiPatch<Item>(`/items/${id}`, { quantity })
}
