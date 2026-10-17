import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '../types'

// თითო როლის მომხმარებელი და რომელ გვერდებზე აქვს წვდომა
export const roles: Record<
  Role,
  { label: string; user: string; initials: string; pages: string[] }
> = {
  manager: {
    label: 'საწყობის მენეჯერი',
    user: 'გიორგი ბერიძე',
    initials: 'გბ',
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
  },
  purchasing: {
    label: 'შესყიდვების მენეჯერი',
    user: 'ნინო კაპანაძე',
    initials: 'ნკ',
    pages: ['/', '/inventory', '/inbound', '/orders', '/reports'],
  },
  operator: {
    label: 'ოპერატორი',
    user: 'ნიკა გელაშვილი',
    initials: 'ნგ',
    pages: ['/', '/inventory', '/inbound', '/outbound'],
  },
  logistics: {
    label: 'ლოჯისტიკის თანამშრომელი',
    user: 'ლევან მამულაშვილი',
    initials: 'ლმ',
    pages: ['/', '/inventory', '/outbound', '/deliveries'],
  },
}

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
  canOpen: (path: string) => boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('manager')

  const canOpen = (path: string) => roles[role].pages.includes(path)

  return <RoleContext.Provider value={{ role, setRole, canOpen }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useRole უნდა იყოს RoleProvider-ის შიგნით')
  return context
}
