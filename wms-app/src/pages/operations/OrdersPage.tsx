import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import FormField from '../../components/FormField/FormField'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { formatDate, nextNumber, orderStatuses } from '../../config/statuses'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { createOrder, getOrders, getVendors, updateOrder } from '../../services/warehouseService'
import type { OrderStatus, PurchaseOrder, Vendor } from '../../types'
import { formatPrice, getCategoryImage } from '../../utils/stock'
import './Operations.css'
import './OrderDetailPage.css'

const orderTotal = (order: PurchaseOrder) =>
  order.items.reduce((sum, line) => sum + line.quantity * line.price, 0)

// შესყიდვის შეკვეთები: შექმნა (შესყიდვები / მენეჯერი) → დადასტურება (მენეჯერი) → მიღება (მიღების გვერდი)
function OrdersPage() {
  const { user, can } = useAuth()
  const navigate = useNavigate()
  const { items } = useItems()
  const orders = useFetch<PurchaseOrder>(getOrders, 'შეკვეთები ვერ ჩაიტვირთა.')
  const vendors = useFetch<Vendor>(getVendors, 'მომწოდებლები ვერ ჩაიტვირთა.')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // ფორმის ველები
  const [vendorId, setVendorId] = useState('')
  const [itemId, setItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const vendorName = (id: number) => vendors.data.find((v) => v.id === id)?.name ?? '—'
  const itemName = (id: number) => items.find((i) => i.id === id)?.name ?? `#${id}`

  function openForm() {
    setVendorId('')
    setItemId('')
    setQuantity('')
    setPrice('')
    setExpectedDate('')
    setFormError(null)
    setIsFormOpen(true)
  }

  // ნივთის არჩევისას ფასი ავტომატურად ივსება (შეძენის ფასი ≈ გასაყიდის 85%)
  function selectItem(id: string) {
    setItemId(id)
    const item = items.find((i) => i.id === Number(id))
    if (item) setPrice(String(Math.round(item.price * 0.85 * 100) / 100))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!vendorId || !itemId || Number(quantity) <= 0 || Number(price) <= 0 || !expectedDate) {
      setFormError('შეავსეთ ყველა ველი (რაოდენობა და ფასი 0-ზე მეტი)')
      return
    }
    setIsSaving(true)
    try {
      const order = await createOrder({
        number: nextNumber(
          'PO',
          orders.data.map((o) => o.number),
        ),
        vendorId: Number(vendorId),
        status: 'pending',
        expectedDate,
        createdBy: user?.id ?? 0,
        createdAt: new Date().toISOString(),
        items: [{ itemId: Number(itemId), quantity: Number(quantity), price: Number(price) }],
      })
      orders.setData((prev) => [...prev, order])
      setMessage(`${order.number} შეიქმნა და ელოდება მენეჯერის დადასტურებას`)
      setIsFormOpen(false)
    } catch {
      setFormError('შეკვეთა ვერ შეინახა — სცადეთ ხელახლა')
    } finally {
      setIsSaving(false)
    }
  }

  async function changeStatus(order: PurchaseOrder, status: OrderStatus) {
    const updated = await updateOrder(order.id, { status })
    orders.setData((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    setMessage(`${order.number} — ${orderStatuses[status].label}`)
  }

  if (orders.isLoading) return <SkeletonGrid count={4} />
  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />

  const sorted = [...orders.data].sort((a, b) => b.id - a.id)

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>შეკვეთები</h1>
          <p className="ops__hint">მომწოდებლებთან შესყიდვის შეკვეთები (PO)</p>
        </div>
        <Button className="ops__btn" onClick={openForm}>
          <Plus size={18} aria-hidden="true" /> ახალი შეკვეთა
        </Button>
      </div>

      {message && (
        <p className="ops__message" role="status">
          ✓ {message}
        </p>
      )}

      <div className="ops__table-wrap">
        <table className="ops__table">
          <thead>
            <tr>
              <th scope="col">ნომერი</th>
              <th scope="col">მომწოდებელი</th>
              <th scope="col">ნივთები</th>
              <th scope="col">ჯამი</th>
              <th scope="col">მოსალოდნელი</th>
              <th scope="col">სტატუსი</th>
              {can('approve:orders') && <th scope="col">მოქმედება</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((order) => (
              <tr
                key={order.id}
                className="order__row"
                onClick={(e) => {
                  // რიგზე დაჭერა — შეკვეთის გვერდი (დადასტურების ღილაკები გამონაკლისია)
                  if (!(e.target as HTMLElement).closest('button')) navigate(`/orders/${order.id}`)
                }}
              >
                <td data-label="ნომერი">
                  <strong>{order.number}</strong>
                  <span className="ops__muted">{formatDate(order.createdAt)}</span>
                </td>
                <td data-label="მომწოდებელი">{vendorName(order.vendorId)}</td>
                <td data-label="ნივთები">
                  <span className="order__thumbs">
                    {order.items.map((line) => {
                      const item = items.find((i) => i.id === line.itemId)
                      return (
                        <img
                          key={line.itemId}
                          src={
                            item
                              ? (item.imageUrl ?? getCategoryImage(item.category))
                              : getCategoryImage('')
                          }
                          alt=""
                          width={36}
                          height={36}
                          loading="lazy"
                        />
                      )
                    })}
                  </span>
                  {order.items.map((line) => (
                    <span key={line.itemId} className="ops__muted">
                      {itemName(line.itemId)} × {line.quantity}
                    </span>
                  ))}
                </td>
                <td data-label="ჯამი">{formatPrice(orderTotal(order))}</td>
                <td data-label="მოსალოდნელი">{formatDate(order.expectedDate)}</td>
                <td data-label="სტატუსი">
                  <span className={orderStatuses[order.status].badge}>
                    {orderStatuses[order.status].label}
                  </span>
                </td>
                {can('approve:orders') && (
                  <td>
                    {order.status === 'pending' && (
                      <div className="ops__actions">
                        <button
                          className="btn-primary"
                          onClick={() => changeStatus(order, 'approved')}
                        >
                          დადასტურება
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => changeStatus(order, 'rejected')}
                        >
                          უარყოფა
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isFormOpen} title="ახალი შეკვეთა" onClose={() => setIsFormOpen(false)}>
        <form className="ops__form" onSubmit={submit} noValidate>
          <FormField label="მომწოდებელი">
            <select
              className="input"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">აირჩიეთ</option>
              {vendors.data.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="ნივთი">
            <select className="input" value={itemId} onChange={(e) => selectItem(e.target.value)}>
              <option value="">აირჩიეთ</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (ნაშთი {i.quantity})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="რაოდენობა">
            <input
              className="input"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </FormField>
          <FormField label="შეძენის ფასი (₾)">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </FormField>
          <FormField label="მოსალოდნელი თარიღი" full>
            <input
              className="input"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </FormField>
          {Number(quantity) > 0 && Number(price) > 0 && (
            <p className="ops__summary">ჯამი: {formatPrice(Number(quantity) * Number(price))}</p>
          )}
          {formError && (
            <p className="ops__error" role="alert">
              {formError}
            </p>
          )}
          <div className="ops__form-footer">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              გაუქმება
            </Button>
            <Button type="submit" isLoading={isSaving}>
              შექმნა
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default OrdersPage
