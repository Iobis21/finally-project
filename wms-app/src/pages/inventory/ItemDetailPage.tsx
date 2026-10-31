import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Barcode, MapPin, PackageCheck, Search, Wallet, Warehouse } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import EmptyState from '../../components/EmptyState/EmptyState'
import { ColumnChart } from '../../components/Charts/Charts'
import { SkeletonGrid } from '../../components/Loader/Loader'
import { deliveryStatuses, formatDate } from '../../config/statuses'
import { warehouses } from '../../config/warehouses'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { getDeliveries } from '../../services/warehouseService'
import type { Delivery } from '../../types'
import { formatPrice, getCategoryImage } from '../../utils/stock'
import '../operations/Operations.css'
import '../operations/ReportsPage.css'
import './ItemDetailPage.css'

const PAGE = 60 // ერთეულების სიაში ერთბაშად ნაჩვენები რაოდენობა

// თითო ცალის უნიკალური კოდი: SKU + რიგითი ნომერი, მაგ. LAP-001-0007
const unitCode = (sku: string, n: number) => `${sku}-${String(n).padStart(4, '0')}`

// ნივთის გვერდი: ინფორმაცია, თითო ერთეული ცალკე კოდით და გაყიდვების ისტორია
function ItemDetailPage() {
  const { id } = useParams()
  const { items, isLoading } = useItems()
  const deliveries = useFetch<Delivery>(getDeliveries, 'გაყიდვები ვერ ჩაიტვირთა.')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)

  const item = items.find((i) => i.id === Number(id))

  const sales = useMemo(
    () =>
      deliveries.data
        .filter((d) => d.itemId === Number(id) && d.createdAt)
        .sort((a, b) => +new Date(b.createdAt!) - +new Date(a.createdAt!)),
    [deliveries.data, id],
  )

  // ბოლო 14 დღის გაყიდვები (ცალი) — სვეტოვანი დიაგრამისთვის
  const last14 = useMemo(() => {
    const end = Math.max(Date.now(), ...sales.map((s) => +new Date(s.createdAt!)))
    return Array.from({ length: 14 }, (_, k) => {
      const day = new Date(end - (13 - k) * 86_400_000)
      const label = `${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}`
      const value = sales
        .filter((s) => new Date(s.createdAt!).toDateString() === day.toDateString())
        .reduce((sum, s) => sum + (s.quantity ?? 0), 0)
      return { label, value }
    })
  }, [sales])

  if (isLoading) return <SkeletonGrid count={4} />
  if (!item) {
    return (
      <EmptyState
        icon={Search}
        title="ნივთი ვერ მოიძებნა"
        text="შესაძლოა წაშლილია ან ბმული არასწორია."
      />
    )
  }

  const warehouse = warehouses.find((w) => w.zones.includes(item.location[0]))
  const sold = sales
    .filter((s) => s.status !== 'failed')
    .reduce((sum, s) => sum + (s.quantity ?? 0), 0)

  // თითო ცალი ცალკე — კოდი, თარო და სტატუსი
  const units = Array.from({ length: item.quantity }, (_, k) => unitCode(item.sku, k + 1))
  const filtered = units.filter((code) => code.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <>
      <Link to="/inventory" className="btn-secondary ops__btn item__back">
        <ArrowLeft size={16} aria-hidden="true" /> მარაგები
      </Link>

      <section className="item__hero ops__card">
        <img
          className="item__image"
          src={item.imageUrl ?? getCategoryImage(item.category)}
          alt={item.name}
          width={480}
          height={360}
        />
        <div className="item__info">
          <div className="item__badges">
            <span className="badge-info">{item.category}</span>
            <StatusBadge item={item} />
          </div>
          <h1 className="item__title">{item.name}</h1>
          <dl className="item__facts">
            <div>
              <dt>SKU</dt>
              <dd className="item__mono">{item.sku}</dd>
            </div>
            <div>
              <dt>
                <Barcode size={14} aria-hidden="true" /> შტრიხკოდი
              </dt>
              <dd className="item__mono">{item.barcode}</dd>
            </div>
            <div>
              <dt>
                <MapPin size={14} aria-hidden="true" /> თარო
              </dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt>
                <Warehouse size={14} aria-hidden="true" /> საწყობი
              </dt>
              <dd>{warehouse?.name ?? '—'}</dd>
            </div>
            <div>
              <dt>ფასი</dt>
              <dd>{formatPrice(item.price)}</dd>
            </div>
            <div>
              <dt>მინიმალური მარაგი</dt>
              <dd>{item.minQuantity} ც.</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="report__stats item__stats">
        <StatCard
          title="მარაგში"
          value={`${item.quantity} ც.`}
          change={`მინიმუმი ${item.minQuantity}`}
          icon={PackageCheck}
          color={item.quantity < item.minQuantity ? 'red' : 'green'}
        />
        <StatCard
          title="მარაგის ღირებულება"
          value={formatPrice(Math.round(item.quantity * item.price))}
          change={`${formatPrice(item.price)} × ${item.quantity}`}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="გაყიდული"
          value={`${sold} ც.`}
          change={`${sales.length} გაყიდვა · ${formatPrice(Math.round(sold * item.price))}`}
          icon={Barcode}
          color="orange"
        />
      </div>

      <section className="ops__card item__section">
        <div className="item__units-head">
          <h2 className="ops__section-title">
            ერთეულები საწყობში — თითოეული ცალკე კოდით ({item.quantity})
          </h2>
          <label className="item__search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">კოდით ძებნა</span>
            <input
              className="input"
              placeholder="კოდით ძებნა, მაგ. 0007"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShown(PAGE)
              }}
            />
          </label>
        </div>
        {item.quantity === 0 ? (
          <p className="ops__empty">ამ ნივთის მარაგი ამოწურულია — საჭიროა შეკვეთა</p>
        ) : (
          <>
            <ul className="item__units">
              {filtered.slice(0, shown).map((code) => (
                <li key={code} className="item__unit">
                  <span className="item__mono">{code}</span>
                  <span className="item__unit-meta">
                    <MapPin size={12} aria-hidden="true" /> {item.location}
                  </span>
                </li>
              ))}
            </ul>
            {filtered.length === 0 && <p className="ops__empty">ასეთი კოდი არ მოიძებნა</p>}
            {filtered.length > shown && (
              <button className="btn-secondary item__more" onClick={() => setShown(shown + PAGE)}>
                მეტის ჩვენება ({filtered.length - shown} დარჩა)
              </button>
            )}
          </>
        )}
      </section>

      <div className="report__grid item__section">
        <section className="ops__card">
          <h2 className="ops__section-title">გაყიდვები — ბოლო 14 დღე (ც.)</h2>
          <ColumnChart data={last14} />
        </section>

        <section className="ops__card">
          <h2 className="ops__section-title">გაყიდვების ისტორია ({sales.length})</h2>
          {sales.length === 0 ? (
            <p className="ops__empty">ეს ნივთი ჯერ არ გაყიდულა</p>
          ) : (
            <ul className="item__history">
              {sales.slice(0, 10).map((s) => (
                <li key={s.id}>
                  <span>
                    <strong>{s.orderNumber}</strong> · {s.quantity} ც.
                    <span className="ops__muted">
                      {formatDate(s.createdAt)} · {s.address}
                    </span>
                  </span>
                  <span className={deliveryStatuses[s.status].badge}>
                    {deliveryStatuses[s.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

export default ItemDetailPage
