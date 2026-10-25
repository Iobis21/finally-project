import { AlertTriangle, Boxes, PackageCheck, Truck } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard'
import ProductCard from '../../components/ProductCard/ProductCard'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { useItems } from '../../hooks/useItems'
import { maybeCrash } from '../../utils/crashTest'
import './DashboardPage.css'

function DashboardPage() {
  maybeCrash('DashboardPage')
  const { items, isLoading, error, reload } = useItems()

  if (isLoading) return <SkeletonGrid count={8} />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const lowStock = items.filter((item) => item.quantity < item.minQuantity).length

  return (
    <>
      <h1 className="dashboard__title">მთავარი გვერდი</h1>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          სტატისტიკა
        </h2>
        <div className="dashboard__stats">
          <StatCard
            title="მარაგი სულ"
            value={totalQuantity.toString()}
            change={`${items.length} სახეობის ნივთი`}
            icon={Boxes}
            color="blue"
          />
          <StatCard
            title="დღეს მიღებული"
            value="128"
            change="+12% გუშინდელთან"
            icon={PackageCheck}
            color="green"
          />
          <StatCard
            title="გზაშია"
            value="14"
            change="3 მიწოდება დაგვიანებულია"
            icon={Truck}
            color="orange"
          />
          <StatCard
            title="კრიტიკული მარაგი"
            value={lowStock.toString()}
            change="საჭიროა შეკვეთა"
            icon={AlertTriangle}
            color="red"
          />
        </div>
      </section>

      <section aria-labelledby="products-title" className="dashboard__products">
        <h2 id="products-title">პროდუქტები</h2>
        <div className="dashboard__grid">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  )
}

export default DashboardPage
