import { memo } from 'react'
import type { Item } from '../../types'
import { getStockStatus, statusBadges, statusLabels } from '../../utils/stock'

// სტატუსის ნიშანი — ერთ ადგილას, რომ ProductCard-ში, ცხრილში და ბარათებში არ გავიმეოროთ
function StatusBadge({ item }: { item: Item }) {
  const status = getStockStatus(item)

  return (
    <span className={statusBadges[status]}>
      {status !== 'in_stock' && (
        // წითელი პულსირებადი წერტილი — კრიტიკული ან ამოწურული მარაგი
        <span className="pulse-dot" aria-hidden="true" />
      )}
      {statusLabels[status]}
    </span>
  )
}

export default memo(StatusBadge)
