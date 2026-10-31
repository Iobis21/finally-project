import { memo } from 'react'
import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import './StatCard.css'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'orange' | 'red'
  to?: string // თუ მითითებულია — ბარათი ბმულია და დაჭერით სხვა გვერდზე გადადის
  onClick?: () => void
}

function StatCard({ title, value, change, icon: Icon, color, to, onClick }: StatCardProps) {
  const content = (
    <>
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-card__body">
        <h3 className="stat-card__title">{title}</h3>
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__change">{change}</p>
      </div>
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="stat-card stat-card--link lift"
        aria-label={`${title}: ${value}`}
      >
        {content}
      </Link>
    )
  }

  return <article className="stat-card lift">{content}</article>
}

export default memo(StatCard)
