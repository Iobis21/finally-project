import { useMemo, useState } from 'react'
import {
  CalendarCheck,
  Monitor,
  PackageCheck,
  Printer,
  ShoppingCart,
  Smartphone,
  Tablet,
  Wallet,
} from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import {
  BarChart,
  ColumnChart,
  PieChart,
  Pie3D,
  type ChartRow,
} from '../../components/Charts/Charts'
import { SkeletonGrid } from '../../components/Loader/Loader'
import { roles } from '../../config/roles'
import { warehouses } from '../../config/warehouses'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { useItems } from '../../hooks/useItems'
import { getLogins } from '../../services/loginService'
import { getDeliveries } from '../../services/warehouseService'
import type { Delivery, LoginRecord } from '../../types'
import { formatPrice } from '../../utils/stock'
import './Operations.css'
import './ReportsPage.css'

const periods = [7, 14, 30]
const weekdays = ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ']
const deviceIcons = { კომპიუტერი: Monitor, მობილური: Smartphone, პლანშეტი: Tablet }

const money = (v: number) => formatPrice(Math.round(v))
const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString('ka-GE', { day: '2-digit', month: '2-digit' })

// ჯგუფება: ერთნაირი გასაღების მქონე მნიშვნელობების ჯამი → დიაგრამის რიგები
function groupBy<T>(list: T[], key: (x: T) => string, value: (x: T) => number): ChartRow[] {
  const map = new Map<string, number>()
  list.forEach((x) => map.set(key(x), (map.get(key(x)) ?? 0) + value(x)))
  return [...map].map(([label, v]) => ({ label, value: v }))
}

// სტატისტიკა: გაყიდვები (რა, რამდენი, როდის), მარაგი და თანამშრომლების შესვლები
function ReportsPage() {
  const { can } = useAuth()
  const { items, isLoading } = useItems()
  const deliveries = useFetch<Delivery>(getDeliveries, 'გაყიდვები ვერ ჩაიტვირთა.')
  const logins = useFetch<LoginRecord>(getLogins, 'შესვლები ვერ ჩაიტვირთა.')
  const [days, setDays] = useState(30)
  const showLogins = can('manage:users') // შესვლების ჟურნალი — მხოლოდ მენეჯერს

  const sales = useMemo(() => {
    // „ახლა" — ბოლო გაყიდვის დღე (დემო მონაცემებისთვის), მის მიხედვით ვითვლით პერიოდს
    const all = deliveries.data.filter((d) => d.itemId && d.createdAt && d.status !== 'failed')
    const last = Math.max(Date.now(), ...all.map((d) => +new Date(d.createdAt!)))
    const from = last - days * 86_400_000
    const list = all
      .filter((d) => +new Date(d.createdAt!) > from)
      .map((d) => {
        const item = items.find((i) => i.id === d.itemId)
        const qty = d.quantity ?? 0
        return { ...d, item, qty, revenue: qty * (item?.price ?? 0), date: new Date(d.createdAt!) }
      })
      .filter((s) => s.item)

    // ყოველი დღე პერიოდში — ცარიელი დღეებიც (0), რომ გრაფიკი არ „ხტებოდეს"
    const perDay = new Map<string, number>()
    for (let t = from + 86_400_000; t <= last; t += 86_400_000)
      perDay.set(dayKey(new Date(t).toISOString()), 0)
    list.forEach((s) =>
      perDay.set(dayKey(s.createdAt!), (perDay.get(dayKey(s.createdAt!)) ?? 0) + s.revenue),
    )
    const byDay = [...perDay].map(([label, value]) => ({ label, value }))
    const best = byDay.reduce((a, b) => (b.value > a.value ? b : a), { label: '—', value: 0 })

    const byWeekday = weekdays.map((label, i) => ({
      label,
      value: list.filter((s) => s.date.getDay() === i).reduce((sum, s) => sum + s.qty, 0),
    }))
    // სამუშაო კვირა ორშაბათიდან
    byWeekday.push(byWeekday.shift()!)

    return {
      count: list.length,
      units: list.reduce((s, x) => s + x.qty, 0),
      revenue: list.reduce((s, x) => s + x.revenue, 0),
      best,
      byDay,
      byWeekday,
      byHour: groupBy(
        [...list].sort((a, b) => a.date.getHours() - b.date.getHours()),
        (s) => `${String(s.date.getHours()).padStart(2, '0')}:00`,
        (s) => s.qty,
      ),
      topUnits: groupBy(
        list,
        (s) => s.item!.name,
        (s) => s.qty,
      )
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
      topRevenue: groupBy(
        list,
        (s) => s.item!.name,
        (s) => s.revenue,
      )
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
      byCategory: groupBy(
        list,
        (s) => s.item!.category,
        (s) => s.revenue,
      ).sort((a, b) => b.value - a.value),
      byWarehouse: warehouses.map((w) => ({
        label: w.name,
        value: list
          .filter((s) => w.zones.includes(s.item!.location[0]))
          .reduce((sum, s) => sum + s.revenue, 0),
      })),
      byCourier: groupBy(
        list,
        (s) => s.courier,
        () => 1,
      ).sort((a, b) => b.value - a.value),
    }
  }, [deliveries.data, items, days])

  const stock = useMemo(
    () => ({
      byWarehouse: warehouses.map((w) => ({
        label: w.name,
        value: items
          .filter((i) => w.zones.includes(i.location[0]))
          .reduce((sum, i) => sum + i.quantity * i.price, 0),
      })),
      lowStock: items.filter((i) => i.quantity < i.minQuantity),
    }),
    [items],
  )

  const loginStats = useMemo(() => {
    const list = [...logins.data].sort((a, b) => +new Date(b.at) - +new Date(a.at))
    return {
      recent: list.slice(0, 15),
      byUser: groupBy(
        list,
        (l) => l.name,
        () => 1,
      ).sort((a, b) => b.value - a.value),
      byDevice: groupBy(
        list,
        (l) => l.device,
        () => 1,
      ),
      byBrowser: groupBy(
        list,
        (l) => l.browser,
        () => 1,
      ).sort((a, b) => b.value - a.value),
    }
  }, [logins.data])

  if (isLoading || deliveries.isLoading) return <SkeletonGrid count={4} />

  return (
    <>
      <div className="ops__header">
        <div>
          <h1>სტატისტიკა</h1>
          <p className="ops__hint">გაყიდვები, მარაგი და თანამშრომლების აქტივობა</p>
        </div>
        <div className="report__toolbar">
          <div className="ops__tabs report__periods" role="group" aria-label="პერიოდი">
            {periods.map((p) => (
              <button
                key={p}
                className="btn-secondary ops__tab"
                aria-pressed={days === p}
                onClick={() => setDays(p)}
              >
                {p} დღე
              </button>
            ))}
          </div>
          <button className="btn-secondary ops__btn report__print" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> ბეჭდვა / PDF
          </button>
        </div>
      </div>

      <div className="report__stats">
        <StatCard
          title="შემოსავალი"
          value={money(sales.revenue)}
          change={`ბოლო ${days} დღე`}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="გაყიდული ერთეული"
          value={sales.units.toLocaleString('ka-GE')}
          change={`${sales.count} გაყიდვა`}
          icon={PackageCheck}
          color="green"
        />
        <StatCard
          title="საშუალო ჩეკი"
          value={money(sales.count ? sales.revenue / sales.count : 0)}
          change="ერთ გაყიდვაზე"
          icon={ShoppingCart}
          color="orange"
        />
        <StatCard
          title="საუკეთესო დღე"
          value={sales.best.label}
          change={money(sales.best.value)}
          icon={CalendarCheck}
          color="red"
        />
      </div>

      <section className="ops__card report__wide">
        <h2 className="ops__section-title">შემოსავალი დღეების მიხედვით</h2>
        <ColumnChart data={sales.byDay} format={money} />
      </section>

      <div className="report__grid">
        <section className="ops__card">
          <h2 className="ops__section-title">ყველაზე გაყიდვადი (ცალი)</h2>
          <BarChart data={sales.topUnits} format={(v) => `${v} ც.`} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">ყველაზე შემოსავლიანი</h2>
          <BarChart data={sales.topRevenue} format={money} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">გაყიდვები კატეგორიებით — 2D</h2>
          <PieChart data={sales.byCategory} format={money} center="კატეგორია" />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">გაყიდვები საწყობებით — 3D</h2>
          <Pie3D data={sales.byWarehouse} format={money} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">როდის იყიდება — კვირის დღეები (ც.)</h2>
          <ColumnChart data={sales.byWeekday} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">როდის იყიდება — საათები (ც.)</h2>
          <ColumnChart data={sales.byHour} />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">კურიერები — 2D</h2>
          <PieChart data={sales.byCourier} format={(v) => `${v} მიწ.`} center="კურიერი" />
        </section>
        <section className="ops__card">
          <h2 className="ops__section-title">მარაგის ღირებულება — 3D</h2>
          <Pie3D data={stock.byWarehouse} format={money} />
        </section>
      </div>

      {showLogins && (
        <section className="ops__section">
          <h2 className="ops__section-title">თანამშრომლების შესვლები</h2>
          <div className="report__grid">
            <section className="ops__card">
              <h3 className="ops__section-title">ვინ რამდენჯერ შევიდა</h3>
              <BarChart data={loginStats.byUser} format={(v) => `${v}-ჯერ`} />
            </section>
            <section className="ops__card">
              <h3 className="ops__section-title">მოწყობილობები — 3D</h3>
              <Pie3D data={loginStats.byDevice} format={(v) => `${v}-ჯერ`} />
            </section>
            <section className="ops__card">
              <h3 className="ops__section-title">ბრაუზერები — 2D</h3>
              <PieChart data={loginStats.byBrowser} format={(v) => `${v}-ჯერ`} center="ბრაუზერი" />
            </section>
          </div>

          <h3 className="ops__section-title report__subtitle">ბოლო შესვლები</h3>
          <div className="ops__table-wrap">
            <table className="ops__table">
              <thead>
                <tr>
                  <th scope="col">თანამშრომელი</th>
                  <th scope="col">თარიღი და დრო</th>
                  <th scope="col">მოწყობილობა</th>
                  <th scope="col">სისტემა / ბრაუზერი</th>
                </tr>
              </thead>
              <tbody>
                {loginStats.recent.map((l) => {
                  const Icon = deviceIcons[l.device as keyof typeof deviceIcons] ?? Monitor
                  return (
                    <tr key={l.id}>
                      <td data-label="თანამშრომელი">
                        <strong>{l.name}</strong>
                        <span className="ops__muted">{roles[l.role]?.label}</span>
                      </td>
                      <td data-label="თარიღი და დრო">
                        {new Date(l.at).toLocaleString('ka-GE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td data-label="მოწყობილობა">
                        <span className="report__device">
                          <Icon size={16} aria-hidden="true" /> {l.device}
                        </span>
                      </td>
                      <td data-label="სისტემა / ბრაუზერი">
                        {l.os} · {l.browser}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="ops__section">
        <h2 className="ops__section-title">შესაკვეთი ნივთები ({stock.lowStock.length})</h2>
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
              {stock.lowStock.map((item) => (
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
