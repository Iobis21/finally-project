import { divIcon, type LatLngBoundsExpression } from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Warehouse as WarehouseIcon } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { warehouses, type Warehouse } from '../../config/warehouses'

interface WarehouseMapProps {
  counts: Record<string, number> // საწყობის id → მარაგის ერთეულები
  onSelect: (warehouse: Warehouse) => void
}

// საკუთარი ნიშნული (Leaflet-ის სტანდარტული სურათის მაგივრად — Vite-ში სურათის გზა ირევა)
const pinIcon = divIcon({
  className: 'map__marker',
  html: renderToStaticMarkup(<WarehouseIcon size={22} />), // იგივე აიქონი, რაც მენიუში
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

// მხოლოდ საქართველოს ტერიტორია — რუკა ამაზე შორს არ გადაინაცვლებს
const georgia: LatLngBoundsExpression = [
  [41.0, 40.0],
  [43.6, 46.7],
]

// რეალური რუკა — OpenStreetMap (უფასო, API გასაღები არ სჭირდება)
function WarehouseMap({ counts, onSelect }: WarehouseMapProps) {
  return (
    <MapContainer
      bounds={georgia}
      maxBounds={georgia}
      minZoom={7}
      className="map__board"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {warehouses.map((warehouse) => (
        <Marker
          key={warehouse.id}
          position={[warehouse.lat, warehouse.lng]}
          icon={pinIcon}
          title={warehouse.name}
          eventHandlers={{ click: () => onSelect(warehouse) }}
        >
          <Tooltip
            direction={warehouse.id === 'batumi' ? 'bottom' : 'top'}
            offset={[0, warehouse.id === 'batumi' ? 18 : -18]}
            permanent
          >
            🔒 {warehouse.name} · {counts[warehouse.id] ?? 0} ც.
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default WarehouseMap
