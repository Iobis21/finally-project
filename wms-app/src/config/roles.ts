import type { Role } from '../types'

export type Permission = 'manage:items' | 'manage:users' | 'adjust:stock'

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
    ],
    permissions: ['manage:items', 'manage:users', 'adjust:stock'],
  },
  purchasing: {
    label: 'შესყიდვების მენეჯერი',
    pages: ['/', '/inventory', '/inbound', '/orders', '/reports'],
    permissions: [],
  },
  operator: {
    label: 'ოპერატორი',
    pages: ['/', '/inventory', '/inbound', '/outbound'],
    permissions: ['adjust:stock'], // ოპერატორს შეუძლია დაზიანებული / დაკარგული საქონლის ჩამოწერა
  },
  logistics: {
    label: 'ლოჯისტიკის თანამშრომელი',
    pages: ['/', '/inventory', '/outbound', '/deliveries'],
    permissions: [],
  },
}

// ახალი მომხმარებელი რეგისტრაციისას იღებს ყველაზე მცირე უფლებებს
export const DEFAULT_ROLE: Role = 'operator'
