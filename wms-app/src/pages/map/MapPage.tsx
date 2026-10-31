import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Lock, MapPin, Warehouse as WarehouseIcon } from 'lucide-react'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import FormField from '../../components/FormField/FormField'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import { ErrorState, SkeletonGrid } from '../../components/Loader/Loader'
import { warehouses, type Warehouse } from '../../config/warehouses'
import { useItems } from '../../hooks/useItems'
import { formatPrice } from '../../utils/stock'
import './MapPage.css'

// საწყობის რუკა: საწყობზე დაჭერისას ითხოვს პაროლს და აჩვენებს მხოლოდ იმ საწყობის მარაგს
function MapPage() {
  const { items, isLoading, error, reload } = useItems()
  const [selected, setSelected] = useState<Warehouse | null>(null) // პაროლის ფანჯარა რომელზეა გახსნილი
  const [opened, setOpened] = useState<Warehouse | null>(null) // რომელ საწყობში უკვე შევედით
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // მხოლოდ ამ საწყობის ზონების ნივთები (თაროს პირველი ასოთი)
  const warehouseItems = useMemo(
    () => (opened ? items.filter((item) => opened.zones.includes(item.location[0])) : []),
    [items, opened],
  )

  function openDialog(warehouse: Warehouse) {
    setSelected(warehouse)
    setPassword('')
    setPasswordError('')
  }

  function checkPassword(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    if (password !== selected.password) {
      setPasswordError('პაროლი არასწორია')
      return
    }
    setOpened(selected)
    setSelected(null)
  }

  if (isLoading) return <SkeletonGrid count={3} />
  if (error) return <ErrorState message={error} onRetry={reload} />

  if (opened) {
    const total = warehouseItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <>
        <button className="btn-secondary map__back" onClick={() => setOpened(null)}>
          <ArrowLeft size={16} aria-hidden="true" /> რუკაზე დაბრუნება
        </button>
        <h1 className="map__title">{opened.name}</h1>
        <p className="map__subtitle">
          <MapPin size={14} aria-hidden="true" /> {opened.address} · ზონა{' '}
          {opened.zones.join(', ')} · {warehouseItems.length} სახეობა, სულ {total} ერთეული
        </p>

        <ul className="map__items">
          {warehouseItems.map((item) => (
            <li key={item.id} className="map__item lift">
              <div className="map__item-top">
                <strong>{item.name}</strong>
                <StatusBadge item={item} />
              </div>
              <p className="map__item-meta">
                {item.sku} · თარო {item.location}
              </p>
              <p>
                {item.quantity} ც. · {formatPrice(item.price)}
              </p>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <h1 className="map__title">საწყობის რუკა</h1>
      <p className="map__subtitle">აირჩიე საწყობი — შესასვლელად საჭიროა პაროლი</p>

      <ul className="map__board">
        {warehouses.map((warehouse) => (
          <li
            key={warehouse.id}
            className="map__point"
            style={{ left: `${warehouse.x}%`, top: `${warehouse.y}%` }}
          >
            <button className="map__pin" onClick={() => openDialog(warehouse)}>
              <WarehouseIcon size={28} aria-hidden="true" />
              <span className="map__pin-name">{warehouse.name}</span>
              <Lock size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <Modal isOpen={!!selected} title={selected?.name ?? ''} onClose={() => setSelected(null)}>
        <form className="map__form" onSubmit={checkPassword} noValidate>
          <FormField label="საწყობის პაროლი" error={passwordError}>
            <input
              className="input"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          <Button type="submit">შესვლა</Button>
        </form>
      </Modal>
    </>
  )
}

export default MapPage
