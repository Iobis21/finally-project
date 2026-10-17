import { useState } from 'react'
import { PackageSearch, Plus } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import EmptyState from '../../components/EmptyState/EmptyState'
import ItemForm from '../../components/ItemForm/ItemForm'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import Button from '../../components/ui/Button/Button'
import Modal from '../../components/ui/Modal/Modal'
import { useInventoryFilters } from '../../hooks/useInventoryFilters'
import { useItems } from '../../hooks/useItems'
import type { ItemForm as ItemFormValues } from '../../schemas/item.schema'
import type { Item } from '../../types'
import InventoryCards from './components/InventoryCards'
import InventoryFilters from './components/InventoryFilters'
import InventoryTable from './components/InventoryTable'
import './InventoryPage.css'

// რომელი მოდალია ღია: დამატება, რედაქტირება ან წაშლის დადასტურება
type ModalState = { mode: 'add' } | { mode: 'edit'; item: Item } | { mode: 'delete'; item: Item } | null

// გვერდი მხოლოდ აერთიანებს ნაწილებს: მონაცემები — useItems, ფილტრები — useInventoryFilters
function InventoryPage() {
  const { items, isLoading, error, reload, addItem, editItem, removeItem } = useItems()
  const filters = useInventoryFilters(items)
  const [modal, setModal] = useState<ModalState>(null)

  const closeModal = () => setModal(null)

  // ცხრილიდან / ბარათებიდან მოსული მოქმედება (Event Delegation)
  function handleAction(action: string, id: number) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    if (action === 'edit') setModal({ mode: 'edit', item })
    if (action === 'delete') setModal({ mode: 'delete', item })
  }

  async function handleSave(values: ItemFormValues) {
    if (modal?.mode === 'edit') {
      await editItem(modal.item.id, values)
    } else {
      await addItem(values)
    }
    closeModal()
  }

  async function handleDelete() {
    if (modal?.mode !== 'delete') return
    await removeItem(modal.item.id)
    closeModal()
  }

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
          onAction={handleAction}
        />
        <InventoryCards items={filters.visibleItems} onAction={handleAction} />
      </>
    )
  }

  return (
    <>
      <div className="inventory__header">
        <div>
          <h1>მარაგები</h1>
          <p className="inventory__count">
            ნაჩვენებია {filters.visibleItems.length} / {items.length}
          </p>
        </div>
        <Button onClick={() => setModal({ mode: 'add' })}>
          <Plus size={18} aria-hidden="true" />
          ახალი ნივთი
        </Button>
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

      <Modal
        isOpen={modal?.mode === 'add' || modal?.mode === 'edit'}
        title={modal?.mode === 'edit' ? 'ნივთის რედაქტირება' : 'ახალი ნივთი'}
        onClose={closeModal}
      >
        <ItemForm
          key={modal?.mode === 'edit' ? modal.item.id : 'new'}
          initialValues={modal?.mode === 'edit' ? modal.item : undefined}
          onSubmit={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <Modal isOpen={modal?.mode === 'delete'} title="ნივთის წაშლა" onClose={closeModal}>
        {modal?.mode === 'delete' && (
          <ConfirmDialog
            message={`ნამდვილად გსურთ „${modal.item.name}"-ის წაშლა? ამ მოქმედების გაუქმება შეუძლებელია.`}
            onConfirm={handleDelete}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </>
  )
}

export default InventoryPage
