import { useMemo } from 'react'
import { AlertTriangle, Boxes, ClipboardList, Printer, Wallet } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import { SkeletonGrid } from '../../components/Loader/Loader'
import { deliveryStatuses, orderStatuses } from '../../config/statuses'
import { warehouses } from '../../config/warehouses'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { getDeliveries, getOrders } from '../../services/warehouseService'
import type { Delivery, DeliveryStatus, OrderStatus, PurchaseOrder } from '../../types'
import { formatPrice } from '../../utils/stock'
import './Operations.css'
import './ReportsPage.css'

interface Row {
  label: string
  value: number
}

// ჰორიზონტალური სვეტები — მარტივი CSS დიაგრამა ბიბლიოთეკის გარეშე
function BarList({ rows, format }: { rows: Row[]; format: (v: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="report__bars">
      {rows.map((row) => (
        <li key={row.label} className="report__bar-row">
          <span className="report__bar-label">{row.label}</span>
          <span className="report__bar-track">
            <span className="report__bar" style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <span className="report__bar-value">{format(row.value)}</span>
        </li>
      ))}
    </ul>
  )
}

// ანგარიშები: მარაგის ღირებულება, საწყობები, კატეგორიები, კრიტიკული ნაშთი, შეკვეთები და მიწოდებები
function ReportsPage() {
  const { items, isLoading } = useItems()
  const orders = useFetch<PurchaseOrder>(getOrders, 'შეკვეთები ვერ ჩაიტვირთა.')
  const deliveries = useFetch<Delivery>(getDeliveries, 'მიწოდებები ვერ ჩაიტვირთა.')

  const report = useMemo(() => {
    const value = (list: typeof items) =>
      list.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const categories = [...new Set(items.map((i) => i.category))]

    return {
      totalValue: value(items),
      totalUnits: items.reduce((sum, i) => sum + i.quantity, 0),
      lowStock: items
        .filter((i) => i.quantity < i.minQuantity)
        .sort((a, b) => a.quantity / a.minQuantity - b.quantity / b.minQuantity),
      byWarehouse: warehouses.map((w) => ({
        label: w.name,
        value: value(items.filter((i) => w.zones.includes(i.location[0]))),
      })),
      byCategory: categories
        .map((c) => ({ label: c, value: value(items.filter((i) => i.category === c)) }))
        .sort((a, b) => b.value - a.value),
      topItems: [...items]
        .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
        .slice(0, 5)
        .map((i) => ({ label: i.name, value: i.quantity * i.price })),
    }
  }, [items])

  if (isLoading) return <SkeletonGrid count={4} />

  const ordersBy = (status: OrderStatus) => orders.data.filter((o) => o.status === status).length
  const deliveriesBy = (status: DeliveryStatus) =>
    deliveries.data.filter((d) => d.status === status).length

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>ანგარიშები</h1>
          <p className="ops__hint">
            მდგომარეობა: {new Date().toLocaleDateString('ka-GE')} — ციფრები ითვლება მიმდინარე
            მარაგიდან
          </p>
        </div>
        <button className="btn-secondary ops__btn report__print" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" /> ბეჭდვა / PDF
        </button>
      </div>

      <div className="report__stats">
        <StatCard
          title="მარაგის ღირებულება"
          value={formatPrice(Math.round(report.totalValue))}
          change={`${items.length} სახეობის ნივთი`}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="სულ ერთეული"
          value={report.totalUnits.toLocaleString('ka-GE')}
          change={`${warehouses.length} საწყობში`}
          icon={Boxes}
          color="green"
        />
        <StatCard
          title="კრიტიკული ნაშთი"
          value={String(report.lowStock.length)}
          change="საჭიროებს შეკვეთას"
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="ღია შეკვეთები"
          value={String(ordersBy('pending') + ordersBy('approved'))}
          change={`სულ ${orders.data.length} შეკვეთა`}
          icon={ClipboardList}
          color="red"
        />
      </div>

      <div className="report__grid">
        <section className="ops__card">
          <h2 className="ops__section-title">ღირებულება საწყობების მიხედვით</h2>
          <BarList rows={report.byWarehouse} format={(v) => formatPrice(Math.round(v))} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">ღირებულება კატეგორიების მიხედვით</h2>
          <BarList rows={report.byCategory} format={(v) => formatPrice(Math.round(v))} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">TOP 5 — ყველაზე ძვირი მარაგი</h2>
          <BarList rows={report.topItems} format={(v) => formatPrice(Math.round(v))} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">შეკვეთები და მიწოდებები</h2>
          <BarList
            rows={[
              ...(Object.keys(orderStatuses) as OrderStatus[]).map((s) => ({
                label: `შეკვეთა: ${orderStatuses[s].label}`,
                value: ordersBy(s),
              })),
              ...(Object.keys(deliveryStatuses) as DeliveryStatus[]).map((s) => ({
                label: `მიწოდება: ${deliveryStatuses[s].label}`,
                value: deliveriesBy(s),
              })),
            ].filter((r) => r.value > 0)}
            format={String}
          />
        </section>
      </div>

      <section className="ops__section">
        <h2 className="ops__section-title">შესაკვეთი ნივთები ({report.lowStock.length})</h2>
        <div className="ops__table-wrap">
          <table className="ops__table">
            <thead>
              <tr>
                <th scope="col">ნივთი</th>
                <th scope="col">თარო</th>
                <th scope="col">ნაშთი / მინ.</th>
                <th scope="col">შესაკვეთი</th>
                <th scope="col">სტატუსი</th>
              </tr>
            </thead>
            <tbody>
              {report.lowStock.map((item) => (
                <tr key={item.id}>
                  <td data-label="ნივთი">
                    <strong>{item.name}</strong>
                    <span className="ops__muted">{item.sku}</span>
                  </td>
                  <td data-label="თარო">{item.location}</td>
                  <td data-label="ნაშთი / მინ.">
                    {item.quantity} / {item.minQuantity}
                  </td>
                  <td data-label="შესაკვეთი">{item.minQuantity * 2 - item.quantity} ც.</td>
                  <td data-label="სტატუსი">
                    <StatusBadge item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default ReportsPage
