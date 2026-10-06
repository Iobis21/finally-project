import type { LucideIcon } from 'lucide-react'
import './StatCard.css'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'orange' | 'red'
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-card__body">
        <h3 className="stat-card__title">{title}</h3>
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__change">{change}</p>
      </div>
    </article>
  )
}

export default StatCard
