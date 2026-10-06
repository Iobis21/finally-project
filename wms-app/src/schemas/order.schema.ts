import { z } from 'zod'

// ---------- შესყიდვის შეკვეთის (Purchase Order) შექმნა ----------
const orderLineSchema = z.object({
  itemId: z.number({ message: 'აირჩიეთ ნივთი' }).int().positive('აირჩიეთ ნივთი'),
  quantity: z
    .number({ message: 'შეიყვანეთ რაოდენობა' })
    .int('რაოდენობა უნდა იყოს მთელი რიცხვი')
    .min(1, 'რაოდენობა მინიმუმ 1')
    .max(10000, 'მაქსიმუმ 10 000 ერთეული'),
  price: z.number({ message: 'შეიყვანეთ ფასი' }).positive('ფასი უნდა იყოს 0-ზე მეტი'),
})

export const orderSchema = z
  .object({
    vendorId: z.number({ message: 'აირჩიეთ მომწოდებელი' }).int().positive('აირჩიეთ მომწოდებელი'),
    expectedDate: z.string().min(1, 'მიუთითეთ მიწოდების თარიღი'),
    note: z.string().max(500, 'შენიშვნა მაქსიმუმ 500 სიმბოლო').optional(),
    items: z.array(orderLineSchema).min(1, 'დაამატეთ მინიმუმ ერთი ნივთი'),
  })
  // მიწოდების თარიღი არ შეიძლება იყოს წარსულში
  .refine((data) => new Date(data.expectedDate) >= new Date(new Date().toDateString()), {
    message: 'თარიღი არ შეიძლება იყოს წარსულში',
    path: ['expectedDate'],
  })
  // ერთი და იგივე ნივთი ორჯერ არ უნდა იყოს
  .refine((data) => new Set(data.items.map((i) => i.itemId)).size === data.items.length, {
    message: 'ერთი ნივთი ორჯერ არის დამატებული',
    path: ['items'],
  })

export type OrderForm = z.infer<typeof orderSchema>

// ---------- საქონლის მიღება (სკანირება) ----------
export const scanSchema = z.object({
  barcode: z.string().trim().regex(/^\d{13}$/, 'შტრიხკოდი უნდა იყოს 13 ციფრი'),
})

export const damageSchema = z.object({
  itemId: z.number().int().positive(),
  damaged: z.number().int().min(1, 'მინიმუმ 1 ერთეული'),
  reason: z.enum(['broken', 'wet', 'wrong_item', 'other'], { message: 'აირჩიეთ მიზეზი' }),
  comment: z.string().max(300, 'მაქსიმუმ 300 სიმბოლო').optional(),
})
