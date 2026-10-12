import { AlertTriangle } from 'lucide-react'
import EmptyState from '../EmptyState/EmptyState'
import './Loader.css'

// Skeleton — ნაცრისფერი ბლოკები ჩატვირთვისას
export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="იტვირთება">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-grid__item" />
      ))}
    </div>
  )
}

// შეცდომის ბლოკი „თავიდან ცდის" ღილაკით
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="რაღაც შეცდომა მოხდა"
      text={message}
      actionLabel="თავიდან ცდა"
      onAction={onRetry}
    />
  )
}
