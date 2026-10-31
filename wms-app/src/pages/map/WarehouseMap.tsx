import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { warehouses, type Warehouse } from '../../config/warehouses'

interface WarehouseMapProps {
  counts: Record<string, number> // საწყობის id → ნივთების რაოდენობა
  onSelect: (warehouse: Warehouse) => void
}

// საკუთარი ნიშნული (Leaflet-ის სტანდარტული სურათის მაგივრად — Vite-ში სურათის გზა ირევა)
const pinIcon = divIcon({
  className: 'map__marker',
  html: '<span>🏭</span>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

// რეალური რუკა — OpenStreetMap (უფასო, API გასაღები არ სჭირდება)
function WarehouseMap({ counts, onSelect }: WarehouseMapProps) {
  return (
    <MapContainer center={[42.0, 43.3]} zoom={7} className="map__board" scrollWheelZoom={false}>
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
          <Tooltip direction="top" offset={[0, -18]} permanent>
            🔒 {warehouse.name} · {counts[warehouse.id] ?? 0} ნივთი
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default WarehouseMap
