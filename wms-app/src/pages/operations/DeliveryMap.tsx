import { useEffect, useRef, useState } from 'react'
import { divIcon, type LatLngBoundsExpression, type LatLngExpression } from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { CheckCircle2, Clock, MapPin, Truck, Warehouse as WarehouseIcon } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { deliveryStatuses } from '../../config/statuses'
import { warehouses } from '../../config/warehouses'
import type { Delivery, Item } from '../../types'
import './DeliveryMap.css'

// რუკა მხოლოდ საქართველოს ტერიტორიაზე
const georgia: LatLngBoundsExpression = [
  [41.0, 40.0],
  [43.6, 46.7],
]

// ქალაქების კოორდინატები — მისამართის პირველი სიტყვით ვპოულობთ
const cities: Record<string, [number, number]> = {
  თბილისი: [41.7151, 44.8271],
  ქუთაისი: [42.2679, 42.6946],
  ბათუმი: [41.6168, 41.6367],
  რუსთავი: [41.5495, 44.9932],
  გორი: [41.9842, 44.1158],
}

// ქუჩის მიხედვით პატარა გადახრა, რომ ერთ ქალაქში ყველა წერტილი ერთმანეთზე არ დაჯდეს
function hash(text: string) {
  return [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
}

function destination(address: string): [number, number] {
  const [lat, lng] = cities[address.split(',')[0].trim()] ?? cities['თბილისი']
  const h = hash(address)
  return [lat + ((h % 100) - 50) / 2500, lng + (((h >> 8) % 100) - 50) / 2000]
}

// საიდან გავიდა: ნივთის საწყობი (თაროს პირველი ასოთი), თუ არ ვიცით — თბილისის საწყობი
function origin(delivery: Delivery, items: Item[]): [number, number] {
  const item = items.find((i) => i.id === delivery.itemId)
  const w = warehouses.find((x) => item && x.zones.includes(item.location[0])) ?? warehouses[0]
  return [w.lat, w.lng]
}

const icon = (Icon: typeof Truck, className: string) =>
  divIcon({
    className: `delivery-map__marker ${className}`,
    html: renderToStaticMarkup(<Icon size={18} />),
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })

const icons = {
  courier: icon(Truck, 'delivery-map__marker--courier'),
  delivered: icon(CheckCircle2, 'delivery-map__marker--done'),
  failed: icon(MapPin, 'delivery-map__marker--failed'),
  waiting: icon(Clock, 'delivery-map__marker--waiting'),
  warehouse: icon(WarehouseIcon, 'delivery-map__marker--warehouse'),
}

// არჩეულ მიწოდებაზე რუკა თვითონ გადადის
// (მხოლოდ არჩევისას — არა კურიერის ყოველ გადაადგილებაზე)
function FlyTo({ id, target }: { id: number | null; target: LatLngExpression | null }) {
  const map = useMap()
  const targetRef = useRef(target)
  targetRef.current = target
  useEffect(() => {
    if (id !== null && targetRef.current) map.flyTo(targetRef.current, 12, { duration: 0.8 })
  }, [map, id])
  return null
}

interface DeliveryMapProps {
  deliveries: Delivery[]
  items: Item[]
  selectedId: number | null
}

// მიწოდებების რუკა: სად არის კურიერი (გზაში), სად მიიტანა (მიტანილი), რა ელოდება საწყობში
function DeliveryMap({ deliveries, items, selectedId }: DeliveryMapProps) {
  // კურიერის „მოძრაობა" — ყოველ 2 წამში ოდნავ წინ მიიწევს (დემო სიმულაცია, რეალური GPS არ გვაქვს)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(timer)
  }, [])

  // რუკაზე: ყველა აქტიური + ბოლო 15 მიტანილი/ჩაუბარებელი (ძველები რომ რუკას არ გადატვირთონ)
  const active = deliveries.filter((d) => d.status === 'waiting' || d.status === 'in_transit')
  const done = deliveries
    .filter((d) => d.status === 'delivered' || d.status === 'failed')
    .sort((a, b) => b.id - a.id)
    .slice(0, 15)
  const shown = [...active, ...done]

  const position = (d: Delivery): [number, number] => {
    const from = origin(d, items)
    const to = destination(d.address)
    if (d.status === 'waiting') return from
    if (d.status !== 'in_transit') return to
    // გზაში: 15%-დან 95%-მდე, თითო კურიერი თავისი სიჩქარით
    const progress = 0.15 + (((hash(d.orderNumber) % 40) + tick * 4) % 80) / 100
    return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress]
  }

  const selected = shown.find((d) => d.id === selectedId)

  return (
    <section className="delivery-map ops__card">
      <MapContainer
        bounds={georgia}
        maxBounds={georgia}
        minZoom={7}
        className="delivery-map__map"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo id={selected?.id ?? null} target={selected ? position(selected) : null} />

        {warehouses.map((w) => (
          <Marker key={w.id} position={[w.lat, w.lng]} icon={icons.warehouse}>
            <Popup>{w.name}</Popup>
          </Marker>
        ))}

        {active
          .filter((d) => d.status === 'in_transit')
          .map((d) => (
            <Polyline
              key={`route-${d.id}`}
              positions={[origin(d, items), destination(d.address)]}
              pathOptions={{
                color: '#f97316',
                weight: 3,
                dashArray: '6 8',
                opacity: d.id === selectedId ? 1 : 0.6,
              }}
            />
          ))}

        {shown.map((d) => {
          const marker =
            d.status === 'in_transit'
              ? icons.courier
              : d.status === 'delivered'
                ? icons.delivered
                : d.status === 'failed'
                  ? icons.failed
                  : icons.waiting
          const item = items.find((i) => i.id === d.itemId)
          return (
            <Marker
              key={d.id}
              position={position(d)}
              icon={marker}
              zIndexOffset={d.status === 'in_transit' ? 1000 : 0}
            >
              <Popup>
                <strong>{d.orderNumber}</strong> — {deliveryStatuses[d.status].label}
                <br />
                {d.courier}
                {item && (
                  <>
                    <br />
                    {item.name} × {d.quantity}
                  </>
                )}
                <br />
                {d.address}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <ul className="delivery-map__legend">
        <li>
          <span className="delivery-map__dot delivery-map__marker--courier" /> კურიერი გზაში
        </li>
        <li>
          <span className="delivery-map__dot delivery-map__marker--waiting" /> ელოდება საწყობში
        </li>
        <li>
          <span className="delivery-map__dot delivery-map__marker--done" /> მიტანილია
        </li>
        <li>
          <span className="delivery-map__dot delivery-map__marker--failed" /> ვერ ჩაბარდა
        </li>
        <li>
          <span className="delivery-map__dot delivery-map__marker--warehouse" /> საწყობი
        </li>
      </ul>
    </section>
  )
}

export default DeliveryMap
