import type { LucideIcon } from 'lucide-react'
import './EmptyState.css'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

function EmptyState({ icon: Icon, title, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <Icon size={40} className="empty-state__icon" aria-hidden="true" />
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{text}</p>
      {actionLabel && onAction && (
        <button className="btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
