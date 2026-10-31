import { useState } from 'react'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { deliveryStatuses, formatDate, nextDeliveryStatus } from '../../config/statuses'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { getDeliveries, updateDelivery } from '../../services/warehouseService'
import type { Delivery, DeliveryStatus } from '../../types'
import DeliveryMap from './DeliveryMap'
import './Operations.css'

const nextLabels: Partial<Record<DeliveryStatus, string>> = {
  waiting: 'გაგზავნა',
  in_transit: 'მიტანილია',
}

// მიწოდებები: კურიერის სტატუსი — ელოდება → გზაშია → მიტანილია (ან ვერ ჩაბარდა)
function DeliveriesPage() {
  const { items } = useItems()
  const deliveries = useFetch<Delivery>(getDeliveries, 'მიწოდებები ვერ ჩაიტვირთა.')
  const [filter, setFilter] = useState<DeliveryStatus | ''>('')
  const [message, setMessage] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null) // რუკაზე მონიშნული მიწოდება

  const itemName = (id?: number) => items.find((i) => i.id === id)?.name

  async function changeStatus(delivery: Delivery, status: DeliveryStatus) {
    const updated = await updateDelivery(delivery.id, { status })
    deliveries.setData((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setMessage(`${delivery.orderNumber} — ${deliveryStatuses[status].label}`)
  }

  if (deliveries.isLoading) return <SkeletonGrid count={4} />
  if (deliveries.error) return <ErrorState message={deliveries.error} onRetry={deliveries.reload} />

  const list = deliveries.data
    .filter((d) => !filter || d.status === filter)
    .sort((a, b) => b.id - a.id)
  const countOf = (status: DeliveryStatus) =>
    deliveries.data.filter((d) => d.status === status).length

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>მიწოდებები</h1>
          <p className="ops__hint">გაცემული შეკვეთების მიტანა კლიენტამდე</p>
        </div>
      </div>

      {message && (
        <p className="ops__message" role="status">
          ✓ {message}
        </p>
      )}

      <DeliveryMap deliveries={deliveries.data} items={items} selectedId={selectedId} />

      <div className="ops__tabs">
        <button
          className="btn-secondary ops__tab"
          aria-pressed={filter === ''}
          onClick={() => setFilter('')}
        >
          ყველა ({deliveries.data.length})
        </button>
        {(Object.keys(deliveryStatuses) as DeliveryStatus[]).map((status) => (
          <button
            key={status}
            className="btn-secondary ops__tab"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {deliveryStatuses[status].label} ({countOf(status)})
          </button>
        ))}
      </div>

      <div className="ops__table-wrap">
        {list.length === 0 ? (
          <p className="ops__empty">ამ სტატუსით მიწოდება არ არის</p>
        ) : (
          <table className="ops__table">
            <thead>
              <tr>
                <th scope="col">ნომერი</th>
                <th scope="col">მისამართი</th>
                <th scope="col">კურიერი</th>
                <th scope="col">სტატუსი</th>
                <th scope="col">მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => {
                const next = nextDeliveryStatus[d.status]
                return (
                  <tr
                    key={d.id}
                    className={
                      d.id === selectedId
                        ? 'delivery__row delivery__row--selected'
                        : 'delivery__row'
                    }
                    onClick={() => {
                      // რიგზე დაჭერა — გვერდი რუკაზე ადის და რუკა ამ მიწოდებაზე გადადის
                      setSelectedId(d.id)
                      document
                        .querySelector('.delivery-map')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                  >
                    <td data-label="ნომერი">
                      <strong>{d.orderNumber}</strong>
                      {itemName(d.itemId) && (
                        <span className="ops__muted">
                          {itemName(d.itemId)} × {d.quantity}
                        </span>
                      )}
                      {d.createdAt && <span className="ops__muted">{formatDate(d.createdAt)}</span>}
                    </td>
                    <td data-label="მისამართი">{d.address}</td>
                    <td data-label="კურიერი">{d.courier}</td>
                    <td data-label="სტატუსი">
                      <span className={deliveryStatuses[d.status].badge}>
                        {deliveryStatuses[d.status].label}
                      </span>
                    </td>
                    <td>
                      {next && (
                        <div className="ops__actions">
                          <button className="btn-primary" onClick={() => changeStatus(d, next)}>
                            {nextLabels[d.status]}
                          </button>
                          {d.status === 'in_transit' && (
                            <button
                              className="btn-secondary"
                              onClick={() => changeStatus(d, 'failed')}
                            >
                              ვერ ჩაბარდა
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default DeliveriesPage
