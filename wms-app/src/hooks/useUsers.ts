import { useEffect, useState } from 'react'
import { getUsers, updateUserRole, updateUserStatus } from '../services/userService'
import type { Role, User } from '../types'

// თანამშრომლების სია + როლის შეცვლა და დაბლოკვა
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setIsLoading(true)
    setError(null)
    try {
      setUsers(await getUsers())
    } catch {
      setError('თანამშრომლები ვერ ჩაიტვირთა.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const replace = (updated: User) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))

  async function changeRole(id: number, role: Role) {
    replace(await updateUserRole(id, role))
  }

  async function toggleActive(id: number, isActive: boolean) {
    replace(await updateUserStatus(id, isActive))
  }

  return { users, isLoading, error, reload: load, changeRole, toggleActive }
}
