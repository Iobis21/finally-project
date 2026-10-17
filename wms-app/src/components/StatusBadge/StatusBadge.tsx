import type { Item } from '../../types'
import { getStockStatus, statusBadges, statusLabels } from '../../utils/stock'

// სტატუსის ნიშანი — ერთ ადგილას, რომ ProductCard-ში, ცხრილში და ბარათებში არ გავიმეოროთ
function StatusBadge({ item }: { item: Item }) {
  const status = getStockStatus(item)

  return <span className={statusBadges[status]}>{statusLabels[status]}</span>
}

export default StatusBadge
