import { z } from 'zod'

// ---------- შესვლა ----------
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'ელ-ფოსტა სავალდებულოა').email('ელ-ფოსტის ფორმატი არასწორია'),
  password: z.string().min(1, 'პაროლი სავალდებულოა'),
  rememberMe: z.boolean().optional(),
})

export type LoginForm = z.infer<typeof loginSchema>

// ---------- რეგისტრაცია (ახალი თანამშრომლის დამატება) ----------
const georgianPhone = /^\+995\s?5\d{2}\s?\d{3}\s?\d{3}$/ // +995 5XX XXX XXX

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'სახელი მინიმუმ 2 სიმბოლო').max(50, 'მაქსიმუმ 50 სიმბოლო'),
    lastName: z.string().trim().min(2, 'გვარი მინიმუმ 2 სიმბოლო').max(50, 'მაქსიმუმ 50 სიმბოლო'),
    email: z.string().trim().min(1, 'ელ-ფოსტა სავალდებულოა').email('ელ-ფოსტის ფორმატი არასწორია'),
    phone: z
      .string()
      .trim()
      .regex(georgianPhone, 'ფორმატი: +995 5XX XXX XXX')
      .optional()
      .or(z.literal('')), // არასავალდებულოა
    password: z
      .string()
      .min(8, 'პაროლი მინიმუმ 8 სიმბოლო')
      .regex(/\d/, 'პაროლი უნდა შეიცავდეს ციფრს')
      .regex(/[^A-Za-z0-9]/, 'პაროლი უნდა შეიცავდეს სიმბოლოს (!@#$...)'),
    confirmPassword: z.string().min(1, 'გაიმეორეთ პაროლი'),
    role: z.enum(['manager', 'purchasing', 'operator', 'logistics'], {
      message: 'აირჩიეთ როლი',
    }),
    userType: z.enum(['individual', 'company'], { message: 'აირჩიეთ მომხმარებლის ტიპი' }),
    companyName: z.string().trim().optional(),
  })
  // პაროლები უნდა ემთხვეოდეს
  .refine((data) => data.password === data.confirmPassword, {
    message: 'პაროლები არ ემთხვევა',
    path: ['confirmPassword'],
  })
  // კომპანიის სახელი სავალდებულოა მხოლოდ company ტიპისთვის
  .refine((data) => data.userType !== 'company' || (data.companyName?.length ?? 0) >= 2, {
    message: 'მიუთითეთ კომპანიის სახელი',
    path: ['companyName'],
  })

export type RegisterForm = z.infer<typeof registerSchema>
