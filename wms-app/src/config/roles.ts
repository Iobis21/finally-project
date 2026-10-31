import type { Role } from '../types'

export type Permission = 'manage:items' | 'manage:users' | 'adjust:stock' | 'approve:orders'

interface RoleConfig {
  label: string
  pages: string[] // რომელ გვერდებზე აქვს წვდომა
  permissions: Permission[] // რა მოქმედებები შეუძლია
}

// როლების და უფლებების ერთი წყარო — მენიუც, გვერდებიც და ღილაკებიც აქედან კითხულობს
export const roles: Record<Role, RoleConfig> = {
  manager: {
    label: 'საწყობის მენეჯერი',
    pages: [
      '/',
      '/inventory',
      '/inbound',
      '/outbound',
      '/orders',
      '/deliveries',
      '/map',
      '/users',
      '/reports',
      '/messages',
    ],
    permissions: ['manage:items', 'manage:users', 'adjust:stock', 'approve:orders'],
  },
  purchasing: {
    label: 'შესყიდვების მენეჯერი',
    pages: ['/', '/inventory', '/inbound', '/orders', '/reports', '/messages'],
    permissions: [],
  },
  operator: {
    label: 'ოპერატორი',
    pages: ['/', '/inventory', '/inbound', '/outbound', '/messages'],
    permissions: ['adjust:stock'], // ოპერატორს შეუძლია დაზიანებული / დაკარგული საქონლის ჩამოწერა
  },
  logistics: {
    label: 'ლოჯისტიკის თანამშრომელი',
    pages: ['/', '/inventory', '/outbound', '/deliveries', '/messages'],
    permissions: [],
  },
}

// ახალი მომხმარებელი რეგისტრაციისას იღებს ყველაზე მცირე უფლებებს
export const DEFAULT_ROLE: Role = 'operator'
