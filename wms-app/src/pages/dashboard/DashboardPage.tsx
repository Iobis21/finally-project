import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Truck,
  Wallet,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import OfflineBanner from '../../components/OfflineBanner/OfflineBanner'
import { deliveryStatuses, formatDate, orderStatuses } from '../../config/statuses'
import { warehouses } from '../../config/warehouses'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { useInventory } from '../../store/inventory/useInventory'
import { getDeliveries, getOrders } from '../../services/warehouseService'
import type { Delivery, PurchaseOrder } from '../../types'
import { maybeCrash } from '../../utils/crashTest'
import { formatPrice } from '../../utils/stock'
import './DashboardPage.css'

const weekdayNames = [
  'კვირა',
  'ორშაბათი',
  'სამშაბათი',
  'ოთხშაბათი',
  'ხუთშაბათი',
  'პარასკევი',
  'შაბათი',
]
const monthNames = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
]

function DashboardPage() {
  maybeCrash('DashboardPage')
  const { user, canOpen } = useAuth()
  const { items, isLoading, error, reload, source } = useItems()
  const { setStatus } = useInventory()
  const deliveries = useFetch<Delivery>(getDeliveries, 'მიწოდებები ვერ ჩაიტვირთა.')
  const orders = useFetch<PurchaseOrder>(getOrders, 'შეკვეთები ვერ ჩაიტვირთა.')

  // useMemo — ყველა ციფრი ითვლება რეალური მარაგიდან, მხოლოდ items-ის შეცვლისას
  const stats = useMemo(() => {
    const value = (list: typeof items) =>
      list.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return {
      totalValue: value(items),
      totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
      lowStock: items
        .filter((item) => item.quantity < item.minQuantity)
        .sort((a, b) => a.quantity / a.minQuantity - b.quantity / b.minQuantity),
      outOfStock: items.filter((item) => item.quantity === 0).length,
      byWarehouse: warehouses.map((w) => {
        const list = items.filter((item) => w.zones.includes(item.location[0]))
        return {
          ...w,
          kinds: list.length,
          units: list.reduce((sum, item) => sum + item.quantity, 0),
          value: value(list),
        }
      }),
    }
  }, [items])

  if (isLoading) return <SkeletonGrid count={8} />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const activeDeliveries = deliveries.data.filter(
    (d) => d.status === 'waiting' || d.status === 'in_transit',
  )
  // შემოსული მოთხოვნები: დასადასტურებელი შეკვეთები, მისაღები საქონელი და გასაგზავნი მიწოდებები
  const requests = [
    ...orders.data
      .filter((o) => o.status === 'pending' || o.status === 'approved')
      .map((o) => ({
        key: `o${o.id}`,
        title: o.number,
        text:
          o.status === 'pending'
            ? `შესყიდვა — ელოდება დადასტურებას · ${formatDate(o.createdAt)}`
            : `მისაღები საქონელი · მოსალოდნელი ${formatDate(o.expectedDate)}`,
        badge: orderStatuses[o.status],
        to: o.status === 'pending' ? '/orders' : '/inbound',
      })),
    ...deliveries.data
      .filter((d) => d.status === 'waiting')
      .map((d) => ({
        key: `d${d.id}`,
        title: d.orderNumber,
        text: `გასაგზავნი · ${d.address}`,
        badge: deliveryStatuses[d.status],
        to: '/deliveries',
      })),
  ]
  const recentDeliveries = [...deliveries.data].sort((a, b) => b.id - a.id).slice(0, 5)
  // თარიღი ქართულად — ზოგი ბრაუზერი ka-GE ლოკალს არ იცნობს და ინგლისურად წერს
  const now = new Date()
  const today = `${weekdayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`

  return (
    <>
      <section className="dashboard__hero">
        <div>
          <p className="dashboard__date">{today}</p>
          <h1 className="dashboard__title">გამარჯობა, {user?.firstName} 👋</h1>
          <p className="dashboard__subtitle">
            საწყობის მიმდინარე მდგომარეობა — {stats.lowStock.length} ნივთი საჭიროებს ყურადღებას
          </p>
        </div>
      </section>

      <OfflineBanner source={source} onRetry={reload} />

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          სტატისტიკა
        </h2>
        <div className="dashboard__stats">
          <StatCard
            title="მარაგის ღირებულება"
            value={formatPrice(Math.round(stats.totalValue))}
            change={`${items.length} სახეობის ნივთი`}
            icon={Wallet}
            to={canOpen('/reports') ? '/reports' : undefined}
            color="blue"
          />
          <StatCard
            title="სულ ერთეული"
            value={stats.totalUnits.toLocaleString('ka-GE')}
            change={`${warehouses.length} საწყობში`}
            icon={Boxes}
            to="/inventory"
            onClick={() => setStatus('')}
            color="green"
          />
          <StatCard
            title="აქტიური მიწოდებები"
            value={String(activeDeliveries.length)}
            change={`${activeDeliveries.filter((d) => d.status === 'in_transit').length} გზაშია`}
            icon={Truck}
            to={canOpen('/deliveries') ? '/deliveries' : undefined}
            color="orange"
          />
          <StatCard
            title="კრიტიკული მარაგი"
            value={String(stats.lowStock.length)}
            change={`${stats.outOfStock} ამოწურულია`}
            icon={AlertTriangle}
            to="/inventory"
            onClick={() => setStatus('low_stock')} // მარაგები — მხოლოდ კრიტიკულები
            color="red"
          />
        </div>
      </section>

      <section className="dashboard__panel dashboard__requests" aria-labelledby="requests-title">
        <div className="dashboard__panel-head">
          <h2 id="requests-title">
            შემოსული მოთხოვნები <span className="dashboard__count">{requests.length}</span>
          </h2>
        </div>
        {requests.length === 0 ? (
          <p className="dashboard__empty">ახალი მოთხოვნა არ არის ✓</p>
        ) : (
          <ul className="dashboard__list">
            {requests.map((r) => (
              <li key={r.key}>
                {canOpen(r.to) ? (
                  <Link to={r.to} className="dashboard__request">
                    <span>
                      <strong>{r.title}</strong>
                      <span className="dashboard__muted">{r.text}</span>
                    </span>
                    <span className={r.badge.badge}>{r.badge.label}</span>
                  </Link>
                ) : (
                  <div className="dashboard__request">
                    <span>
                      <strong>{r.title}</strong>
                      <span className="dashboard__muted">{r.text}</span>
                    </span>
                    <span className={r.badge.badge}>{r.badge.label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="dashboard__columns">
        <section className="dashboard__panel" aria-labelledby="low-title">
          <div className="dashboard__panel-head">
            <h2 id="low-title">საჭიროებს შევსებას</h2>
            <Link to="/inventory" className="dashboard__more">
              მარაგები <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="dashboard__empty">ყველა ნივთი საკმარისადაა ✓</p>
          ) : (
            <ul className="dashboard__list">
              {stats.lowStock.slice(0, 6).map((item) => {
                const percent = Math.min(100, (item.quantity / item.minQuantity) * 100)
                return (
                  <li key={item.id} className="dashboard__low">
                    <div className="dashboard__low-top">
                      <span className="dashboard__low-name">{item.name}</span>
                      <span className="dashboard__low-qty">
                        {item.quantity} / {item.minQuantity}
                      </span>
                    </div>
                    <span className="dashboard__progress" aria-hidden="true">
                      <span
                        className={
                          item.quantity === 0 ? 'dashboard__fill--empty' : 'dashboard__fill'
                        }
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="dashboard__panel" aria-labelledby="deliveries-title">
          <div className="dashboard__panel-head">
            <h2 id="deliveries-title">ბოლო მიწოდებები</h2>
            {canOpen('/deliveries') && (
              <Link to="/deliveries" className="dashboard__more">
                ყველა <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
          {recentDeliveries.length === 0 ? (
            <p className="dashboard__empty">მიწოდებები ჯერ არ არის</p>
          ) : (
            <ul className="dashboard__list">
              {recentDeliveries.map((d) => (
                <li key={d.id} className="dashboard__delivery">
                  <div>
                    <strong>{d.orderNumber}</strong>
                    <span className="dashboard__muted">
                      {d.courier} · {d.address}
                    </span>
                  </div>
                  <span className={deliveryStatuses[d.status].badge}>
                    {deliveryStatuses[d.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="dashboard__section" aria-labelledby="warehouses-title">
        <div className="dashboard__panel-head">
          <h2 id="warehouses-title">საწყობები</h2>
          {canOpen('/map') && (
            <Link to="/map" className="dashboard__more">
              რუკა <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="dashboard__warehouses">
          {stats.byWarehouse.map((w) => (
            <article key={w.id} className="dashboard__warehouse lift">
              <span className="dashboard__warehouse-icon">
                <WarehouseIcon size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>{w.name}</h3>
                <p className="dashboard__muted">{w.address}</p>
                <p className="dashboard__warehouse-stats">
                  <strong>{w.units}</strong> ც. · {w.kinds} სახეობა ·{' '}
                  {formatPrice(Math.round(w.value))}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default DashboardPage
