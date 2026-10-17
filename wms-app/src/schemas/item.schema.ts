import { z } from 'zod'

// ნივთის დამატების / რედაქტირების ფორმის წესები
export const itemSchema = z.object({
  name: z.string().trim().min(3, 'დასახელება მინიმუმ 3 სიმბოლო').max(60, 'მაქსიმუმ 60 სიმბოლო'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU სავალდებულოა')
    .regex(/^[A-Z]{2,4}-[A-Z0-9]{1,5}$/, 'ფორმატი: LAP-001 (დიდი ლათინური ასოები)'),
  barcode: z.string().trim().regex(/^\d{13}$/, 'შტრიხკოდი უნდა იყოს 13 ციფრი'),
  category: z.string().min(1, 'აირჩიეთ კატეგორია'),
  quantity: z
    .number({ message: 'შეიყვანეთ რაოდენობა' })
    .int('მთელი რიცხვი')
    .min(0, 'არ შეიძლება იყოს უარყოფითი'),
  minQuantity: z
    .number({ message: 'შეიყვანეთ მინიმალური რაოდენობა' })
    .int('მთელი რიცხვი')
    .min(1, 'მინიმუმ 1'),
  price: z.number({ message: 'შეიყვანეთ ფასი' }).positive('ფასი უნდა იყოს 0-ზე მეტი'),
  location: z
    .string()
    .trim()
    .regex(/^[A-Z]-\d{2}-\d{2}$/, 'ფორმატი: A-01-03'),
})

export type ItemForm = z.infer<typeof itemSchema>

export const categories = ['ელექტრონიკა', 'ავეჯი', 'საკანცელარიო', 'შესაფუთი']
