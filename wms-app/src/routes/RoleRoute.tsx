import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ShieldX } from 'lucide-react'
import EmptyState from '../components/EmptyState/EmptyState'
import { roles, useRole } from '../context/RoleContext'

// თუ როლს ამ გვერდზე წვდომა არ აქვს — აჩვენებს „წვდომა აკრძალულია"
function RoleRoute({ path, children }: { path: string; children: ReactNode }) {
  const { role, canOpen } = useRole()
  const navigate = useNavigate()

  if (canOpen(path)) return children

  return (
    <>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>403</h1>
      <EmptyState
        icon={ShieldX}
        title="წვდომა აკრძალულია"
        text={`როლს „${roles[role].label}" ამ გვერდზე შესვლის უფლება არ აქვს.`}
        actionLabel="მთავარ გვერდზე დაბრუნება"
        onAction={() => navigate('/')}
      />
    </>
  )
}

export default RoleRoute
