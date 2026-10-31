import { useState, type FormEvent } from 'react'
import { PackageCheck } from 'lucide-react'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { formatDate } from '../../config/statuses'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { getOrders, getVendors, updateOrder } from '../../services/warehouseService'
import type { PurchaseOrder, Vendor } from '../../types'
import './Operations.css'

// თითო ხაზზე: რამდენი მოვიდა და რამდენი დაზიანდა
type Counts = Record<number, { received: string; damaged: string }>

// მიღება: დადასტურებული შეკვეთის საქონელი შემოდის საწყობში → მარაგი იზრდება
function InboundPage() {
  const { items, changeStock } = useItems()
  const orders = useFetch<PurchaseOrder>(getOrders, 'შეკვეთები ვერ ჩაიტვირთა.')
  const vendors = useFetch<Vendor>(getVendors, 'მომწოდებლები ვერ ჩაიტვირთა.')
  const [active, setActive] = useState<PurchaseOrder | null>(null)
  const [counts, setCounts] = useState<Counts>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const vendorName = (id: number) => vendors.data.find((v) => v.id === id)?.name ?? '—'
  const item = (id: number) => items.find((i) => i.id === id)

  function openReceive(order: PurchaseOrder) {
    // ნაგულისხმევად — მოვიდა იმდენი, რამდენიც შევუკვეთეთ, დაზიანებული 0
    setCounts(
      Object.fromEntries(
        order.items.map((line) => [line.itemId, { received: String(line.quantity), damaged: '0' }]),
      ),
    )
    setFormError(null)
    setActive(order)
  }

  function setCount(itemId: number, field: 'received' | 'damaged', value: string) {
    setCounts((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }))
  }

  async function confirm(e: FormEvent) {
    e.preventDefault()
    if (!active) return

    const lines = active.items.map((line) => ({
      itemId: line.itemId,
      received: Number(counts[line.itemId].received),
      damaged: Number(counts[line.itemId].damaged),
    }))
    if (lines.some((l) => l.received < 0 || l.damaged < 0 || l.damaged > l.received)) {
      setFormError('დაზიანებული ვერ იქნება მიღებულზე მეტი')
      return
    }

    setIsSaving(true)
    try {
      // მარაგში ემატება მხოლოდ ვარგისი (მიღებული − დაზიანებული)
      for (const line of lines) {
        const good = line.received - line.damaged
        if (good > 0) await changeStock(line.itemId, good)
      }
      const updated = await updateOrder(active.id, {
        status: 'received',
        receivedAt: new Date().toISOString(),
      })
      orders.setData((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      const total = lines.reduce((sum, l) => sum + l.received - l.damaged, 0)
      setMessage(`${active.number} მიღებულია — მარაგს დაემატა ${total} ერთეული`)
      setActive(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'მიღება ვერ მოხერხდა')
    } finally {
      setIsSaving(false)
    }
  }

  if (orders.isLoading) return <SkeletonGrid count={4} />
  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />

  const waiting = orders.data.filter((o) => o.status === 'approved')
  const received = orders.data.filter((o) => o.status === 'received').sort((a, b) => b.id - a.id)

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>მიღება</h1>
          <p className="ops__hint">დადასტურებული შეკვეთების საქონლის მიღება საწყობში</p>
        </div>
      </div>

      {message && (
        <p className="ops__message" role="status">
          ✓ {message}
        </p>
      )}

      <h2 className="ops__section-title">მოსალოდნელი მიწოდებები ({waiting.length})</h2>
      <div className="ops__table-wrap">
        {waiting.length === 0 ? (
          <p className="ops__empty">
            მისაღები შეკვეთა არ არის. ახალი შეკვეთა ჯერ მენეჯერმა უნდა დაადასტუროს.
          </p>
        ) : (
          <table className="ops__table">
            <thead>
              <tr>
                <th scope="col">შეკვეთა</th>
                <th scope="col">მომწოდებელი</th>
                <th scope="col">ნივთები</th>
                <th scope="col">მოსალოდნელი</th>
                <th scope="col">
                  <span className="sr-only">მოქმედება</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {waiting.map((order) => (
                <tr key={order.id}>
                  <td data-label="შეკვეთა">
                    <strong>{order.number}</strong>
                  </td>
                  <td data-label="მომწოდებელი">{vendorName(order.vendorId)}</td>
                  <td data-label="ნივთები">
                    {order.items.map((line) => (
                      <span key={line.itemId} className="ops__muted">
                        {item(line.itemId)?.name ?? `#${line.itemId}`} × {line.quantity}
                      </span>
                    ))}
                  </td>
                  <td data-label="მოსალოდნელი">{formatDate(order.expectedDate)}</td>
                  <td>
                    <Button className="ops__btn" onClick={() => openReceive(order)}>
                      <PackageCheck size={16} aria-hidden="true" /> მიღება
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="ops__section">
        <h2 className="ops__section-title">მიღებული ({received.length})</h2>
        <div className="ops__table-wrap">
          {received.length === 0 ? (
            <p className="ops__empty">ჯერ არაფერი მიღებულა</p>
          ) : (
            <table className="ops__table">
              <thead>
                <tr>
                  <th scope="col">შეკვეთა</th>
                  <th scope="col">მომწოდებელი</th>
                  <th scope="col">მიღების თარიღი</th>
                </tr>
              </thead>
              <tbody>
                {received.map((order) => (
                  <tr key={order.id}>
                    <td data-label="შეკვეთა">{order.number}</td>
                    <td data-label="მომწოდებელი">{vendorName(order.vendorId)}</td>
                    <td data-label="მიღების თარიღი">{formatDate(order.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Modal
        isOpen={!!active}
        title={`მიღება — ${active?.number ?? ''}`}
        onClose={() => setActive(null)}
      >
        <form className="ops__form" onSubmit={confirm} noValidate>
          {active?.items.map((line) => (
            <fieldset key={line.itemId} className="ops__card" style={{ gridColumn: '1 / -1' }}>
              <legend>
                <strong>{item(line.itemId)?.name}</strong> — შეკვეთილი {line.quantity}, ახლა მარაგში{' '}
                {item(line.itemId)?.quantity ?? 0}
              </legend>
              <div className="ops__form">
                <label>
                  მოვიდა
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={counts[line.itemId]?.received ?? ''}
                    onChange={(e) => setCount(line.itemId, 'received', e.target.value)}
                  />
                </label>
                <label>
                  დაზიანებული
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={counts[line.itemId]?.damaged ?? ''}
                    onChange={(e) => setCount(line.itemId, 'damaged', e.target.value)}
                  />
                </label>
              </div>
            </fieldset>
          ))}
          {formError && (
            <p className="ops__error" role="alert">
              {formError}
            </p>
          )}
          <div className="ops__form-footer">
            <Button type="button" variant="secondary" onClick={() => setActive(null)}>
              გაუქმება
            </Button>
            <Button type="submit" isLoading={isSaving}>
              მიღების დადასტურება
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default InboundPage
