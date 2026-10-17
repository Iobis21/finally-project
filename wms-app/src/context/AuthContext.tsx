import { createContext, useContext, useState, type ReactNode } from 'react'
import { roles, type Permission } from '../config/roles'
import { TOKEN_KEY } from '../services/apiClient'
import * as authService from '../services/authService'
import type { User } from '../types'

const USER_KEY = 'wms-user'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: authService.RegisterData) => Promise<void>
  logout: () => void
  canOpen: (path: string) => boolean // გვერდზე წვდომა
  can: (permission: Permission) => boolean // მოქმედების უფლება
}

const AuthContext = createContext<AuthContextValue | null>(null)

// გვერდის განახლების შემდეგ მომხმარებელი localStorage-იდან ბრუნდება
function loadUser(): User | null {
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved && localStorage.getItem(TOKEN_KEY) ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser)

  function saveSession({ accessToken, user }: authService.AuthResponse) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setUser(user)
  }

  async function login(email: string, password: string) {
    const response = await authService.login(email, password)
    if (!response.user.isActive) {
      throw new Error('ანგარიში დაბლოკილია, მიმართეთ მენეჯერს')
    }
    saveSession(response)
  }

  async function register(data: authService.RegisterData) {
    saveSession(await authService.register(data))
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const canOpen = (path: string) => !!user && roles[user.role].pages.includes(path)
  const can = (permission: Permission) =>
    !!user && roles[user.role].permissions.includes(permission)

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout, canOpen, can }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth უნდა იყოს AuthProvider-ის შიგნით')
  return context
}
