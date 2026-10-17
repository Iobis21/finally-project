import { useState } from 'react'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { roles } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'
import { useUsers } from '../../hooks/useUsers'
import type { Role } from '../../types'
import './UsersPage.css'

// თანამშრომლები — მხოლოდ მენეჯერისთვის: როლების განაწილება და დაბლოკვა
function UsersPage() {
  const { user: currentUser } = useAuth()
  const { users, isLoading, error, reload, changeRole, toggleActive } = useUsers()
  const [message, setMessage] = useState<string | null>(null)

  async function handleRoleChange(id: number, name: string, role: Role) {
    await changeRole(id, role)
    setMessage(`${name} — ახალი როლი: ${roles[role].label}`)
  }

  async function handleToggle(id: number, name: string, isActive: boolean) {
    await toggleActive(id, isActive)
    setMessage(isActive ? `${name} — აქტიურია` : `${name} — დაბლოკილია`)
  }

  if (isLoading) return <SkeletonGrid count={4} />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <>
      <div className="users__header">
        <h1>თანამშრომლები</h1>
        <p className="users__hint">
          ახალი მომხმარებელი რეგისტრაციისას იღებს როლს „{roles.operator.label}". როლს აქ ცვლით.
        </p>
      </div>

      {message && (
        <p className="users__message" role="status">
          ✓ {message}
        </p>
      )}

      <div className="users__table-wrap">
        <table className="users__table">
          <thead>
            <tr>
              <th scope="col">სახელი</th>
              <th scope="col">ელ-ფოსტა</th>
              <th scope="col">როლი</th>
              <th scope="col">სტატუსი</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const name = `${u.firstName} ${u.lastName}`
              const isMe = u.id === currentUser?.id

              return (
                <tr key={u.id}>
                  <td data-label="სახელი">
                    <strong>{name}</strong>
                    {isMe && <span className="users__me"> (თქვენ)</span>}
                    {u.companyName && <small className="users__company">{u.companyName}</small>}
                  </td>
                  <td data-label="ელ-ფოსტა">{u.email}</td>
                  <td data-label="როლი">
                    <label className="sr-only" htmlFor={`role-${u.id}`}>
                      {name}-ის როლი
                    </label>
                    <select
                      id={`role-${u.id}`}
                      className="input users__select"
                      value={u.role}
                      disabled={isMe} // საკუთარ როლს ვერ შეცვლი — რომ მენეჯერი შემთხვევით არ დაკარგოს წვდომა
                      onChange={(e) => handleRoleChange(u.id, name, e.target.value as Role)}
                    >
                      {(Object.keys(roles) as Role[]).map((r) => (
                        <option key={r} value={r}>
                          {roles[r].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td data-label="სტატუსი">
                    <button
                      className={u.isActive ? 'badge-success users__status' : 'badge-danger users__status'}
                      disabled={isMe}
                      onClick={() => handleToggle(u.id, name, !u.isActive)}
                      aria-label={`${name}: ${u.isActive ? 'დაბლოკვა' : 'გააქტიურება'}`}
                    >
                      {u.isActive ? 'აქტიური' : 'დაბლოკილი'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default UsersPage
