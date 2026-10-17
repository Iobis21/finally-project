import type { User } from '../types'
import { apiPost } from './apiClient'

export interface AuthResponse {
  accessToken: string
  user: User
}

export type RegisterData = Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }

// POST /login — json-server-auth ამოწმებს ელ-ფოსტას და პაროლს და აბრუნებს JWT ტოკენს
export function login(email: string, password: string) {
  return apiPost<AuthResponse>('/login', { email, password })
}

// POST /register — პაროლი სერვერზე იშიფრება (bcrypt), ბრუნდება ტოკენი
export function register(data: RegisterData) {
  return apiPost<AuthResponse>('/register', {
    ...data,
    isActive: true,
    createdAt: new Date().toISOString(),
  })
}
