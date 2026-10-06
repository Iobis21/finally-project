import type { Item } from '../types'

// დროებითი სატესტო მონაცემები — მოგვიანებით წამოვა json-server-იდან
export const items: Item[] = [
  { id: 1, sku: 'LAP-001', barcode: '4860001234567', name: 'ლეპტოპი Lenovo', category: 'ელექტრონიკა', quantity: 25, minQuantity: 10, price: 1500, location: 'A-01-03' },
  { id: 2, sku: 'MOU-014', barcode: '4860001234574', name: 'მაუსი Logitech', category: 'ელექტრონიკა', quantity: 4, minQuantity: 20, price: 45, location: 'A-02-01' },
  { id: 3, sku: 'CHR-220', barcode: '4860001234581', name: 'საოფისე სკამი', category: 'ავეჯი', quantity: 12, minQuantity: 5, price: 320, location: 'B-04-02' },
  { id: 4, sku: 'PAP-500', barcode: '4860001234598', name: 'A4 ქაღალდი (500 ფ.)', category: 'საკანცელარიო', quantity: 0, minQuantity: 50, price: 15, location: 'C-01-01' },
  { id: 5, sku: 'MON-027', barcode: '4860001234604', name: 'მონიტორი Dell 27"', category: 'ელექტრონიკა', quantity: 18, minQuantity: 8, price: 780, location: 'A-03-04' },
  { id: 6, sku: 'DSK-140', barcode: '4860001234611', name: 'საწერი მაგიდა', category: 'ავეჯი', quantity: 7, minQuantity: 3, price: 450, location: 'B-02-01' },
  { id: 7, sku: 'KEY-101', barcode: '4860001234628', name: 'კლავიატურა', category: 'ელექტრონიკა', quantity: 9, minQuantity: 15, price: 60, location: 'A-02-03' },
  { id: 8, sku: 'BOX-L', barcode: '4860001234635', name: 'მუყაოს ყუთი (L)', category: 'შესაფუთი', quantity: 340, minQuantity: 100, price: 3, location: 'D-01-01' },
]
