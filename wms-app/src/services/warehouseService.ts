import type { Delivery, PurchaseOrder, Vendor } from '../types'
import { apiGet, apiPatch, apiPost } from './apiClient'

// შეკვეთები, მომწოდებლები და მიწოდებები — საწყობის ოპერაციებისთვის

export function getVendors() {
  return apiGet<Vendor[]>('/vendors')
}

export function getOrders() {
  return apiGet<PurchaseOrder[]>('/orders')
}

export function createOrder(order: Omit<PurchaseOrder, 'id'>) {
  return apiPost<PurchaseOrder>('/orders', order)
}

export function updateOrder(id: number, data: Partial<PurchaseOrder>) {
  return apiPatch<PurchaseOrder>(`/orders/${id}`, data)
}

export function getDeliveries() {
  return apiGet<Delivery[]>('/deliveries')
}

export function createDelivery(delivery: Omit<Delivery, 'id'>) {
  return apiPost<Delivery>('/deliveries', delivery)
}

export function updateDelivery(id: number, data: Partial<Delivery>) {
  return apiPatch<Delivery>(`/deliveries/${id}`, data)
}
