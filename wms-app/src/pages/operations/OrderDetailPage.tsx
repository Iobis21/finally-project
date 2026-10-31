import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, Search } from 'lucide-react'
import EmptyState from '../../components/EmptyState/EmptyState'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { formatDate, orderStatuses } from '../../config/statuses'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { getOrder, getVendors, updateOrder } from '../../services/warehouseService'
import type { OrderStatus, PurchaseOrder, Vendor } from '../../types'
import { formatPrice, getCategoryImage } from '../../utils/stock'
import './Operations.css'
import './OrderDetailPage.css'

// შეკვეთის ეტაპები — რომელი გავლილია, რომელი არა
const steps: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'შექმნილი' },
  { key: 'approved', label: 'დადასტურებული' },
  { key: 'received', label: 'მიღებული საწყობში' },
]

// შეკვეთის გვერდი: ნივთები ფოტოებით, მომწოდებელი, ჯამი და სტატუსის ისტორია
function OrderDetailPage() {
  const { id } = useParams()
  const { can } = useAuth()
  const { items } = useItems()
  const vendors = useFetch<Vendor>(getVendors, 'მომწოდებლები ვერ ჩაიტვირთა.')
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'missing' | 'ready'>('loading')

  useEffect(() => {
    let active = true
    getOrder(Number(id))
      .then((o) => {
        if (!active) return
        setOrder(o)
        setStatus('ready')
      })
      .catch((err) => active && setStatus(err?.status === 404 ? 'missing' : 'error'))
    return () => {
      active = false
    }
  }, [id])

  async function changeStatus(next: OrderStatus) {
    if (!order) return
    setOrder(await updateOrder(order.id, { status: next }))
  }

  if (status === 'loading') return <SkeletonGrid count={3} />
  if (status === 'error')
    return <ErrorState message="შეკვეთა ვერ ჩაიტვირთა." onRetry={() => location.reload()} />
  if (status === 'missing' || !order)
    return (
      <EmptyState icon={Search} title="შეკვეთა ვერ მოიძებნა" text="შესაძლოა ბმული არასწორია." />
    )

  const vendor = vendors.data.find((v) => v.id === order.vendorId)
  const total = order.items.reduce((sum, l) => sum + l.quantity * l.price, 0)
  const units = order.items.reduce((sum, l) => sum + l.quantity, 0)
  const reached =
    order.status === 'rejected' ? 1 : steps.findIndex((s) => s.key === order.status) + 1

  return (
    <>
      <Link to="/orders" className="btn-secondary ops__btn order__back">
        <ArrowLeft size={16} aria-hidden="true" /> შეკვეთები
      </Link>

      <div className="ops__header">
        <div>
          <h1>შეკვეთა {order.number}</h1>
          <p className="ops__hint">
            შექმნილია {formatDate(order.createdAt)} · მოსალოდნელი მიწოდება{' '}
            {formatDate(order.expectedDate)}
          </p>
        </div>
        <span className={`${orderStatuses[order.status].badge} order__status`}>
          {orderStatuses[order.status].label}
        </span>
      </div>

      {/* სტატუსის ეტაპები */}
      <ol className="order__steps ops__card">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className={i < reached ? 'order__step order__step--done' : 'order__step'}
          >
            <span className="order__step-dot">{i + 1}</span>
            <span>{step.label}</span>
            {step.key === 'pending' && <small>{formatDate(order.createdAt)}</small>}
            {step.key === 'received' && order.receivedAt && (
              <small>{formatDate(order.receivedAt)}</small>
            )}
          </li>
        ))}
        {order.status === 'rejected' && (
          <li className="order__step order__step--rejected">
            <span className="order__step-dot">✕</span>
            <span>უარყოფილი</span>
          </li>
        )}
      </ol>

      <div className="order__grid">
        <section className="ops__card">
          <h2 className="ops__section-title">
            ნივთები ({order.items.length}) · {units} ერთეული
          </h2>
          <ul className="order__lines">
            {order.items.map((line) => {
              const item = items.find((i) => i.id === line.itemId)
              return (
                <li key={line.itemId}>
                  <Link to={`/inventory/${line.itemId}`} className="order__line">
                    <img
                      className="order__image"
                      src={
                        item
                          ? (item.imageUrl ?? getCategoryImage(item.category))
                          : getCategoryImage('')
                      }
                      alt=""
                      width={96}
                      height={72}
                    />
                    <span className="order__line-body">
                      <strong>{item?.name ?? `ნივთი #${line.itemId}`}</strong>
                      <span className="ops__muted">
                        {item?.sku} · {item?.category} · თარო {item?.location}
                      </span>
                      <span className="ops__muted">
                        {line.quantity} ც. × {formatPrice(line.price)}
                        {item && ` (გასაყიდი ${formatPrice(item.price)})`}
                      </span>
                    </span>
                    <span className="order__line-total">
                      {formatPrice(Math.round(line.quantity * line.price))}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="order__total">
            სულ: <strong>{formatPrice(Math.round(total))}</strong>
          </p>
        </section>

        <aside className="order__side">
          <section className="ops__card">
            <h2 className="ops__section-title">მომწოდებელი</h2>
            {vendor ? (
              <ul className="order__vendor">
                <li>
                  <Building2 size={16} aria-hidden="true" /> <strong>{vendor.name}</strong>
                </li>
                <li>
                  <Phone size={16} aria-hidden="true" /> {vendor.phone}
                </li>
                <li>
                  <Mail size={16} aria-hidden="true" /> {vendor.email}
                </li>
                {vendor.address && (
                  <li>
                    <MapPin size={16} aria-hidden="true" /> {vendor.address}
                  </li>
                )}
              </ul>
            ) : (
              <p className="ops__muted">—</p>
            )}
          </section>

          <section className="ops__card">
            <h2 className="ops__section-title">დეტალები</h2>
            <ul className="order__vendor">
              <li>
                <CalendarDays size={16} aria-hidden="true" /> მოსალოდნელი:{' '}
                {formatDate(order.expectedDate)}
              </li>
              {order.note && <li>📝 {order.note}</li>}
            </ul>
            {order.status === 'pending' && can('approve:orders') && (
              <div className="ops__actions order__actions">
                <button className="btn-primary" onClick={() => changeStatus('approved')}>
                  დადასტურება
                </button>
                <button className="btn-secondary" onClick={() => changeStatus('rejected')}>
                  უარყოფა
                </button>
              </div>
            )}
            {order.status === 'approved' && (
              <Link to="/inbound" className="btn-primary order__actions">
                საწყობში მიღება →
              </Link>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}

export default OrderDetailPage
