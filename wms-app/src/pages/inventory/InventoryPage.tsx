import { PackageSearch } from 'lucide-react'
import EmptyState from '../../components/EmptyState/EmptyState'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { useInventoryFilters } from '../../hooks/useInventoryFilters'
import { useItems } from '../../hooks/useItems'
import InventoryCards from './components/InventoryCards'
import InventoryFilters from './components/InventoryFilters'
import InventoryTable from './components/InventoryTable'
import './InventoryPage.css'

// გვერდი მხოლოდ აერთიანებს ნაწილებს: მონაცემები — useItems, ფილტრები — useInventoryFilters
function InventoryPage() {
  const { items, isLoading, error, reload } = useItems()
  const filters = useInventoryFilters(items)

  function renderContent() {
    if (isLoading) return <SkeletonGrid count={6} />
    if (error) return <ErrorState message={error} onRetry={reload} />
    if (filters.visibleItems.length === 0) {
      return (
        <EmptyState
          icon={PackageSearch}
          title="ნივთი ვერ მოიძებნა"
          text="სცადეთ სხვა სიტყვა ან გაასუფთავეთ ფილტრები."
          actionLabel="ფილტრების გასუფთავება"
          onAction={filters.resetFilters}
        />
      )
    }

    return (
      <>
        <InventoryTable
          items={filters.visibleItems}
          sortKey={filters.sortKey}
          sortAsc={filters.sortAsc}
          onSort={filters.toggleSort}
        />
        <InventoryCards items={filters.visibleItems} />
      </>
    )
  }

  return (
    <>
      <div className="inventory__header">
        <h1>მარაგები</h1>
        <p className="inventory__count">
          ნაჩვენებია {filters.visibleItems.length} / {items.length}
        </p>
      </div>

      <InventoryFilters
        search={filters.search}
        onSearchChange={filters.setSearch}
        category={filters.category}
        onCategoryChange={filters.setCategory}
        status={filters.status}
        onStatusChange={filters.setStatus}
        categories={filters.categories}
      />

      {renderContent()}
    </>
  )
}

export default InventoryPage
