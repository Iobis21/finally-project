import type { DeliveryStatus, OrderStatus } from '../types'

interface StatusConfig {
  label: string
  badge: string // CSS კლასი (badge-success, badge-warning ...)
}

export const orderStatuses: Record<OrderStatus, StatusConfig> = {
  draft: { label: 'მონახაზი', badge: 'badge-info' },
  pending: { label: 'დასადასტურებელი', badge: 'badge-warning' },
  approved: { label: 'დადასტურებული', badge: 'badge-info' },
  rejected: { label: 'უარყოფილი', badge: 'badge-danger' },
  received: { label: 'მიღებული', badge: 'badge-success' },
}

export const deliveryStatuses: Record<DeliveryStatus, StatusConfig> = {
  waiting: { label: 'ელოდება', badge: 'badge-warning' },
  in_transit: { label: 'გზაშია', badge: 'badge-info' },
  delivered: { label: 'მიტანილია', badge: 'badge-success' },
  failed: { label: 'ვერ ჩაბარდა', badge: 'badge-danger' },
}

// მიწოდების შემდეგი ნაბიჯი (ღილაკისთვის)
export const nextDeliveryStatus: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  waiting: 'in_transit',
  in_transit: 'delivered',
}

export const couriers = ['FastCourier', 'Glovo', 'Wolt', 'საკუთარი ტრანსპორტი']

// შემდეგი ნომერი: PO-0013, SO-0033 ...
export function nextNumber(prefix: string, numbers: string[]) {
  const max = Math.max(0, ...numbers.map((n) => Number(n.split('-')[1]) || 0))
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

export function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('ka-GE') : '—'
}
