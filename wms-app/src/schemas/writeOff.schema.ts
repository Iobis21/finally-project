import { z } from 'zod'

export const writeOffReasons = {
  damaged: 'დაზიანებული',
  expired: 'ვადაგასული',
  lost: 'დაკარგული',
  other: 'სხვა',
} as const

// სქემა იქმნება კონკრეტული ნაშთისთვის — ჩამოწერა ნაშთზე მეტი ვერ იქნება (Fail-Fast, გაგზავნამდე)
export function createWriteOffSchema(stock: number) {
  return z.object({
    amount: z
      .number({ message: 'შეიყვანეთ რაოდენობა' })
      .int('მთელი რიცხვი')
      .min(1, 'მინიმუმ 1 ერთეული')
      .max(stock, `ნაშთში მხოლოდ ${stock} ერთეულია — მეტს ვერ ჩამოწერთ`),
    reason: z.enum(['damaged', 'expired', 'lost', 'other'], { message: 'აირჩიეთ მიზეზი' }),
  })
}

export type WriteOffForm = z.infer<ReturnType<typeof createWriteOffSchema>>
