import { useNavigate } from 'react-router'
import { MapPinOff } from 'lucide-react'
import EmptyState from '../../components/EmptyState/EmptyState'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>404</h1>
      <EmptyState
        icon={MapPinOff}
        title="გვერდი ვერ მოიძებნა"
        text="მისამართი არასწორია ან გვერდი წაშლილია."
        actionLabel="მთავარ გვერდზე დაბრუნება"
        onAction={() => navigate('/')}
      />
    </>
  )
}

export default NotFoundPage
