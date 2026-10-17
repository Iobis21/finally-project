import type { Item, NewItem } from '../types'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export function getItems() {
  return apiGet<Item[]>('/items')
}

export function getItem(id: number) {
  return apiGet<Item>(`/items/${id}`)
}

export function createItem(item: NewItem) {
  return apiPost<Item>('/items', item)
}

export function updateItem(id: number, item: Partial<NewItem>) {
  return apiPatch<Item>(`/items/${id}`, item)
}

export function deleteItem(id: number) {
  return apiDelete(`/items/${id}`)
}
