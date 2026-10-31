// მონაცემთა ძირითადი მოდელები

export type Role = 'manager' | 'purchasing' | 'operator' | 'logistics'

export type UserType = 'individual' | 'company'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  userType: UserType
  companyName?: string
  isActive: boolean
  createdAt: string
}

export type ItemStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface Item {
  id: number
  sku: string // საქონლის კოდი, მაგ. "LAP-001"
  barcode: string // 13 ციფრი
  name: string
  category: string
  quantity: number // რამდენია საწყობში
  minQuantity: number // ამაზე ნაკლები = კრიტიკული მარაგი
  price: number
  location: string // თაროს მისამართი, მაგ. "A-03-02"
  imageUrl?: string
}

// ახალი ნივთი — id-ს სერვერი თვითონ ანიჭებს
export type NewItem = Omit<Item, 'id'>

export interface Vendor {
  id: number
  name: string
  phone: string
  email: string
  address?: string
}

export type OrderStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'received'

export interface OrderLine {
  itemId: number
  quantity: number
  price: number
}

export interface PurchaseOrder {
  id: number
  number: string // მაგ. "PO-0012"
  vendorId: number
  status: OrderStatus
  expectedDate: string
  note?: string
  createdBy: number
  createdAt: string
  receivedAt?: string // როდის მიიღო საწყობმა
  items: OrderLine[]
}

export type ShipmentStatus = 'expected' | 'receiving' | 'completed'

export interface ShipmentLine {
  itemId: number
  expected: number
  received: number
  damaged: number
}

export interface Shipment {
  id: number
  orderId: number
  status: ShipmentStatus
  items: ShipmentLine[]
}

export type DeliveryStatus = 'waiting' | 'in_transit' | 'delivered' | 'failed'

export interface Delivery {
  id: number
  orderNumber: string
  courier: string
  address: string
  status: DeliveryStatus
  itemId?: number // გაცემული ნივთი (გაცემის გვერდიდან შექმნილზე)
  quantity?: number
  createdAt?: string
}
