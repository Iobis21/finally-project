import { useState } from 'react'
import './Charts.css'

export interface ChartRow {
  label: string
  value: number
}

// დიაგრამების ფერები — ერთნაირი ყველა დიაგრამაზე
export const chartColors = [
  '#f97316',
  '#fbbf24',
  '#10b981',
  '#38bdf8',
  '#f43f5e',
  '#06b6d4',
  '#64748b',
]

const colorAt = (i: number) => chartColors[i % chartColors.length]

// ფერის გამუქება 3D-ის გვერდითი კედლისთვის
function darken(hex: string, amount = 0.3) {
  const n = parseInt(hex.slice(1), 16)
  const c = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount))
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`
}

interface ChartProps {
  data: ChartRow[]
  format?: (value: number) => string
}

/* ───────── 2D სვეტოვანი დიაგრამა ───────── */
export function ColumnChart({ data, format = String }: ChartProps) {
  const width = 640
  const height = 260
  const pad = { top: 24, bottom: 42, left: 8, right: 8 }
  const max = Math.max(1, ...data.map((d) => d.value))
  const slot = (width - pad.left - pad.right) / Math.max(1, data.length)
  const barWidth = Math.min(36, slot * 0.6)
  const innerHeight = height - pad.top - pad.bottom
  // თუ სვეტი ბევრია, ქვედა წარწერას ყოველ მეორეზე ვწერთ
  const labelEvery = data.length > 16 ? 2 : 1

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        <linearGradient id="column-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          className="chart__grid"
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + innerHeight * (1 - p)}
          y2={pad.top + innerHeight * (1 - p)}
        />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * innerHeight
        const x = pad.left + slot * i + (slot - barWidth) / 2
        const y = pad.top + innerHeight - h
        return (
          <g key={d.label} className="chart__column">
            <title>{`${d.label}: ${format(d.value)}`}</title>
            <rect
              x={pad.left + slot * i}
              y={pad.top}
              width={slot}
              height={innerHeight}
              fill="transparent"
            />
            <rect
              className="chart__bar"
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(h, 1)}
              rx={5}
              fill="url(#column-fill)"
            />
            <text className="chart__value" x={x + barWidth / 2} y={y - 6} textAnchor="middle">
              {format(d.value)}
            </text>
            {i % labelEvery === 0 && (
              <text
                className="chart__label"
                x={x + barWidth / 2}
                y={height - pad.bottom + 18}
                textAnchor="middle"
              >
                {d.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ───────── ჰორიზონტალური სვეტები (TOP სიებისთვის) ───────── */
export function BarChart({ data, format = String }: ChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="chart-bars">
      {data.map((d, i) => (
        <li key={d.label} className="chart-bars__row" title={`${d.label}: ${format(d.value)}`}>
          <span className="chart-bars__rank">{i + 1}</span>
          <span className="chart-bars__label">{d.label}</span>
          <span className="chart-bars__track">
            <span
              className="chart-bars__bar"
              style={{ width: `${(d.value / max) * 100}%`, background: colorAt(i) }}
            />
          </span>
          <span className="chart-bars__value">{format(d.value)}</span>
        </li>
      ))}
    </ul>
  )
}

/* ───────── ლეგენდა (წრიული დიაგრამებისთვის) ───────── */
function Legend({
  data,
  format,
  active,
  onHover,
}: ChartProps & { active: number | null; onHover: (i: number | null) => void }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  return (
    <ul className="chart-legend">
      {data.map((d, i) => (
        <li
          key={d.label}
          className={
            active === i ? 'chart-legend__item chart-legend__item--active' : 'chart-legend__item'
          }
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
        >
          <span className="chart-legend__dot" style={{ background: colorAt(i) }} />
          <span className="chart-legend__label">{d.label}</span>
          <span className="chart-legend__value">
            {format ? format(d.value) : d.value} · {Math.round((d.value / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  )
}

// წერტილი ელიფსზე (კუთხე რადიანებში, 0 = მარჯვნივ, საათის ისრის მიმართულებით)
const point = (cx: number, cy: number, rx: number, ry: number, a: number) =>
  [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const

function slices(data: ChartRow[]) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let start = -Math.PI / 2
  return data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2
    const slice = { ...d, i, start, end: start + angle }
    start += angle
    return slice
  })
}

/* ───────── 2D წრიული (დონატი) ───────── */
export function PieChart({ data, format, center }: ChartProps & { center?: string }) {
  const [active, setActive] = useState<number | null>(null)
  const size = 220
  const c = size / 2
  const r = 95
  const inner = 58

  return (
    <div className="chart-pie">
      <svg className="chart chart-pie__svg" viewBox={`0 0 ${size} ${size}`} role="img">
        {slices(data).map((s) => {
          const large = s.end - s.start > Math.PI ? 1 : 0
          const [x1, y1] = point(c, c, r, r, s.start)
          const [x2, y2] = point(c, c, r, r, s.end - 0.0001)
          const [x3, y3] = point(c, c, inner, inner, s.end - 0.0001)
          const [x4, y4] = point(c, c, inner, inner, s.start)
          const mid = (s.start + s.end) / 2
          const lift = active === s.i ? 6 : 0
          return (
            <path
              key={s.label}
              className="chart-pie__slice"
              d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${large} 0 ${x4},${y4} Z`}
              fill={colorAt(s.i)}
              transform={`translate(${Math.cos(mid) * lift} ${Math.sin(mid) * lift})`}
              onMouseEnter={() => setActive(s.i)}
              onMouseLeave={() => setActive(null)}
            >
              <title>{`${s.label}: ${format ? format(s.value) : s.value}`}</title>
            </path>
          )
        })}
        {center && (
          <text className="chart-pie__center" x={c} y={c + 5} textAnchor="middle">
            {active !== null ? data[active].label : center}
          </text>
        )}
      </svg>
      <Legend data={data} format={format} active={active} onHover={setActive} />
    </div>
  )
}

/* ───────── 3D წრიული ───────── */
export function Pie3D({ data, format }: ChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const w = 300
  const cx = w / 2
  const cy = 90
  const rx = 130
  const ry = 72 // ელიფსი — „დახრილი" წრე
  const depth = 26 // სისქე
  const list = slices(data)

  // გვერდითი კედელი ჩანს მხოლოდ წინა ნახევარზე (კუთხე 0…π)
  const wall = (start: number, end: number) => {
    const a1 = Math.max(start, 0)
    const a2 = Math.min(end, Math.PI)
    if (a2 <= a1) return null
    const [x1, y1] = point(cx, cy, rx, ry, a1)
    const [x2, y2] = point(cx, cy, rx, ry, a2)
    return `M${x1},${y1} A${rx},${ry} 0 0 1 ${x2},${y2} L${x2},${y2 + depth} A${rx},${ry} 0 0 0 ${x1},${y1 + depth} Z`
  }

  // კუთხეები 0…2π შუალედში, რომ წინა კედელი სწორად დაიხატოს
  const norm = list.map((s) => {
    const shift = s.start < 0 ? Math.PI * 2 : 0
    return { ...s, start: s.start + shift, end: s.end + shift }
  })

  return (
    <div className="chart-pie">
      <svg className="chart chart-pie3d" viewBox={`0 0 ${w} ${cy * 2 + depth + 6}`} role="img">
        {norm.map((s) => {
          const mid = (s.start + s.end) / 2
          const lift = active === s.i ? 10 : 0
          const offset = `translate(${Math.cos(mid) * lift} ${Math.sin(mid) * lift * 0.6})`
          // ნაჭერი შეიძლება 2π-ს გადასცდეს — კედელს ორ ნაწილად ვხატავთ
          const walls = [
            wall(s.start, s.end),
            wall(s.start - Math.PI * 2, s.end - Math.PI * 2),
          ].filter(Boolean)
          return (
            <g key={`w-${s.label}`} transform={offset}>
              {walls.map((d, k) => (
                <path key={k} d={d!} fill={darken(colorAt(s.i))} />
              ))}
            </g>
          )
        })}
        {norm.map((s) => {
          const large = s.end - s.start > Math.PI ? 1 : 0
          const [x1, y1] = point(cx, cy, rx, ry, s.start)
          const [x2, y2] = point(cx, cy, rx, ry, s.end - 0.0001)
          const mid = (s.start + s.end) / 2
          const lift = active === s.i ? 10 : 0
          return (
            <path
              key={s.label}
              className="chart-pie__slice"
              d={`M${cx},${cy} L${x1},${y1} A${rx},${ry} 0 ${large} 1 ${x2},${y2} Z`}
              fill={colorAt(s.i)}
              stroke="rgb(255 255 255 / 0.35)"
              transform={`translate(${Math.cos(mid) * lift} ${Math.sin(mid) * lift * 0.6})`}
              onMouseEnter={() => setActive(s.i)}
              onMouseLeave={() => setActive(null)}
            >
              <title>{`${s.label}: ${format ? format(s.value) : s.value}`}</title>
            </path>
          )
        })}
      </svg>
      <Legend data={data} format={format} active={active} onHover={setActive} />
    </div>
  )
}
