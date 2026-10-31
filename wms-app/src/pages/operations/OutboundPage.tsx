import { useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button/Button'
import FormField from '../../components/FormField/FormField'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { couriers, deliveryStatuses, formatDate, nextNumber } from '../../config/statuses'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { createDelivery, getDeliveries } from '../../services/warehouseService'
import type { Delivery } from '../../types'
import { formatPrice } from '../../utils/stock'
import './Operations.css'

// გაცემა: საქონელი გადის საწყობიდან → მარაგი მცირდება და იქმნება მიწოდება კურიერისთვის
function OutboundPage() {
  const { items, changeStock } = useItems()
  const deliveries = useFetch<Delivery>(getDeliveries, 'გაცემები ვერ ჩაიტვირთა.')
  const [itemId, setItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [address, setAddress] = useState('')
  const [courier, setCourier] = useState(couriers[0])
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const selected = items.find((i) => i.id === Number(itemId))
  const itemName = (id?: number) => items.find((i) => i.id === id)?.name ?? '—'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const amount = Number(quantity)
    if (!selected || amount <= 0 || !address.trim()) {
      setFormError('აირჩიეთ ნივთი, მიუთითეთ რაოდენობა და მისამართი')
      return
    }
    if (amount > selected.quantity) {
      setFormError(`მარაგში მხოლოდ ${selected.quantity} ერთეულია`)
      return
    }

    setIsSaving(true)
    try {
      await changeStock(selected.id, -amount) // სერვერზე კიდევ ერთხელ მოწმდება ნაშთი
      const delivery = await createDelivery({
        orderNumber: nextNumber(
          'SO',
          deliveries.data.map((d) => d.orderNumber),
        ),
        courier,
        address: address.trim(),
        status: 'waiting',
        itemId: selected.id,
        quantity: amount,
        createdAt: new Date().toISOString(),
      })
      deliveries.setData((prev) => [...prev, delivery])
      setMessage(`${delivery.orderNumber}: გაიცა ${amount} × ${selected.name} — გადაეცა მიწოდებას`)
      setItemId('')
      setQuantity('')
      setAddress('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'გაცემა ვერ მოხერხდა')
    } finally {
      setIsSaving(false)
    }
  }

  if (deliveries.isLoading) return <SkeletonGrid count={4} />
  if (deliveries.error) return <ErrorState message={deliveries.error} onRetry={deliveries.reload} />

  const history = deliveries.data.filter((d) => d.itemId).sort((a, b) => b.id - a.id)

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>გაცემა</h1>
          <p className="ops__hint">საქონლის გაცემა კლიენტზე — მარაგი ავტომატურად მცირდება</p>
        </div>
      </div>

      {message && (
        <p className="ops__message" role="status">
          ✓ {message}
        </p>
      )}

      <form className="ops__form ops__card" onSubmit={submit} noValidate>
        <FormField label="ნივთი">
          <select className="input" value={itemId} onChange={(e) => setItemId(e.target.value)}>
            <option value="">აირჩიეთ</option>
            {items.map((i) => (
              <option key={i.id} value={i.id} disabled={i.quantity === 0}>
                {i.name} — ნაშთი {i.quantity}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="რაოდენობა">
          <input
            className="input"
            type="number"
            min="1"
            max={selected?.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </FormField>
        <FormField label="მიწოდების მისამართი">
          <input
            className="input"
            placeholder="მაგ. თბილისი, რუსთაველის 10"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </FormField>
        <FormField label="კურიერი">
          <select className="input" value={courier} onChange={(e) => setCourier(e.target.value)}>
            {couriers.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </FormField>
        {selected && Number(quantity) > 0 && (
          <p className="ops__summary">
            თარო {selected.location} · ღირებულება {formatPrice(selected.price * Number(quantity))} ·
            დარჩება {selected.quantity - Number(quantity)}
          </p>
        )}
        {formError && (
          <p className="ops__error" role="alert">
            {formError}
          </p>
        )}
        <div className="ops__form-footer">
          <Button type="submit" isLoading={isSaving}>
            გაცემა
          </Button>
        </div>
      </form>

      <section className="ops__section">
        <h2 className="ops__section-title">ბოლო გაცემები ({history.length})</h2>
        <div className="ops__table-wrap">
          {history.length === 0 ? (
            <p className="ops__empty">ჯერ არაფერი გაცემულა</p>
          ) : (
            <table className="ops__table">
              <thead>
                <tr>
                  <th scope="col">ნომერი</th>
                  <th scope="col">ნივთი</th>
                  <th scope="col">მისამართი</th>
                  <th scope="col">თარიღი</th>
                  <th scope="col">სტატუსი</th>
                </tr>
              </thead>
              <tbody>
                {history.map((d) => (
                  <tr key={d.id}>
                    <td data-label="ნომერი">
                      <strong>{d.orderNumber}</strong>
                    </td>
                    <td data-label="ნივთი">
                      {itemName(d.itemId)} × {d.quantity}
                    </td>
                    <td data-label="მისამართი">{d.address}</td>
                    <td data-label="თარიღი">{formatDate(d.createdAt)}</td>
                    <td data-label="სტატუსი">
                      <span className={deliveryStatuses[d.status].badge}>
                        {deliveryStatuses[d.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}

export default OutboundPage
