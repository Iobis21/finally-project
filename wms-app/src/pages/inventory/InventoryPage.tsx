import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { PackageSearch, Plus } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import EmptyState from '../../components/EmptyState/EmptyState'
import ItemForm from '../../components/ItemForm/ItemForm'
import WriteOffForm from '../../components/WriteOffForm/WriteOffForm'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import OfflineBanner from '../../components/OfflineBanner/OfflineBanner'
import Button from '../../components/ui/Button/Button'
import Modal from '../../components/ui/Modal/Modal'
import { useAuth } from '../../context/AuthContext'
import { useInventoryFilters } from '../../hooks/useInventoryFilters'
import { useItems } from '../../hooks/useItems'
import type { ItemForm as ItemFormValues } from '../../schemas/item.schema'
import type { WriteOffForm as WriteOffValues } from '../../schemas/writeOff.schema'
import type { Item } from '../../types'
import InventoryCards from './components/InventoryCards'
import InventoryFilters from './components/InventoryFilters'
import InventoryTable from './components/InventoryTable'
import './InventoryPage.css'

// რომელი მოდალია ღია: დამატება, რედაქტირება ან წაშლის დადასტურება
type ModalState =
  | { mode: 'add' }
  | { mode: 'edit'; item: Item }
  | { mode: 'delete'; item: Item }
  | { mode: 'writeoff'; item: Item }
  | null

// გვერდი მხოლოდ აერთიანებს ნაწილებს: მონაცემები — useItems, ფილტრები — useInventoryFilters
function InventoryPage() {
  const {
    items,
    isLoading,
    error,
    reload,
    source,
    isOffline,
    addItem,
    editItem,
    writeOffItem,
    removeItem,
  } = useItems()
  const filters = useInventoryFilters(items)
  // დამატება / რედაქტირება / წაშლა — მხოლოდ იმ როლს, ვისაც manage:items უფლება აქვს (მენეჯერი)
  // ოფლაინ რეჟიმში ცვლილებები არ ინახება — ამიტომ ღილაკებიც იმალება
  const { can } = useAuth()
  const canManage = can('manage:items') && !isOffline
  // ჩამოწერა — მენეჯერი და ოპერატორი (adjust:stock)
  const canWriteOff = can('adjust:stock') && !isOffline
  const [modal, setModal] = useState<ModalState>(null)

  const navigate = useNavigate()
  const closeModal = () => setModal(null)

  // ცხრილიდან / ბარათებიდან მოსული მოქმედება (Event Delegation)
  // useCallback — ცხრილს (React.memo) ყოველ რენდერზე ახალი ფუნქცია არ გადაეცემა
  const handleAction = useCallback(
    (action: string, id: number) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      if (action === 'open') navigate(`/inventory/${id}`) // რიგზე დაჭერა — ნივთის გვერდი
      if (action === 'writeoff' && canWriteOff) setModal({ mode: 'writeoff', item })
      if (action === 'edit' && canManage) setModal({ mode: 'edit', item })
      if (action === 'delete' && canManage) setModal({ mode: 'delete', item })
    },
    [items, canManage, canWriteOff, navigate],
  )

  async function handleSave(values: ItemFormValues) {
    if (modal?.mode === 'edit') {
      await editItem(modal.item.id, values)
    } else {
      await addItem(values)
    }
    closeModal()
  }

  async function handleWriteOff({ amount }: WriteOffValues) {
    if (modal?.mode !== 'writeoff') return
    await writeOffItem(modal.item.id, amount)
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
          canEdit={canManage}
          canWriteOff={canWriteOff}
        />
        <InventoryCards
          items={filters.visibleItems}
          onAction={handleAction}
          canEdit={canManage}
          canWriteOff={canWriteOff}
        />
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
            {filters.hasFilters && (
              <button className="inventory__reset" onClick={filters.resetFilters}>
                ✕ ფილტრის გასუფთავება
              </button>
            )}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setModal({ mode: 'add' })}>
            <Plus size={18} aria-hidden="true" />
            ახალი ნივთი
          </Button>
        )}
      </div>

      <OfflineBanner source={source} onRetry={reload} />

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

      <Modal isOpen={modal?.mode === 'writeoff'} title="საქონლის ჩამოწერა" onClose={closeModal}>
        {modal?.mode === 'writeoff' && (
          <WriteOffForm item={modal.item} onSubmit={handleWriteOff} onCancel={closeModal} />
        )}
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
