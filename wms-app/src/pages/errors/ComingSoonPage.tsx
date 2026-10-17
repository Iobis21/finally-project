import { Construction } from 'lucide-react'
import EmptyState from '../../components/EmptyState/EmptyState'

// გვერდები, რომლებიც ჯერ არ არის აწყობილი
function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>{title}</h1>
      <EmptyState
        icon={Construction}
        title="გვერდი მზადდება"
        text="ეს მოდული შემდეგ სპრინტში დაემატება."
      />
    </>
  )
}

export default ComingSoonPage
