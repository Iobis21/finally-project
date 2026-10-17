import type { Role, User } from '../types'
import { apiGet, apiPatch } from './apiClient'

// სერვერი users-ში პაროლის ჰეშსაც ინახავს — ფრონტენდზე არ ვაჩვენებთ
type UserWithPassword = User & { password?: string }

const withoutPassword = ({ password: _password, ...user }: UserWithPassword): User => user

export async function getUsers() {
  const users = await apiGet<UserWithPassword[]>('/users')
  return users.map(withoutPassword)
}

export async function updateUserRole(id: number, role: Role) {
  return withoutPassword(await apiPatch<UserWithPassword>(`/users/${id}`, { role }))
}

export async function updateUserStatus(id: number, isActive: boolean) {
  return withoutPassword(await apiPatch<UserWithPassword>(`/users/${id}`, { isActive }))
}
