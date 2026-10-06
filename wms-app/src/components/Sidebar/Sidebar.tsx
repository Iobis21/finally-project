import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Map,
  PackageCheck,
  PackageOpen,
  Truck,
  Users,
  X,
} from 'lucide-react'
import './Sidebar.css'

const menu = [
  { label: 'მთავარი', icon: LayoutDashboard, href: '/', active: true },
  { label: 'მარაგები', icon: Boxes, href: '/inventory' },
  { label: 'მიღება', icon: PackageCheck, href: '/inbound' },
  { label: 'გაცემა', icon: PackageOpen, href: '/outbound' },
  { label: 'შეკვეთები', icon: ClipboardList, href: '/orders' },
  { label: 'მიწოდებები', icon: Truck, href: '/deliveries' },
  { label: 'საწყობის რუკა', icon: Map, href: '/map' },
  { label: 'თანამშრომლები', icon: Users, href: '/users' },
  { label: 'ანგარიშები', icon: BarChart3, href: '/reports' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* მუქი ფონი მობილურზე, დაჭერით იხურება */}
      {isOpen && <div className="sidebar__overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <button className="sidebar__close" onClick={onClose} aria-label="მენიუს დახურვა">
          <X size={22} />
        </button>

        <nav>
          <ul className="sidebar__list">
            {menu.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`sidebar__link ${item.active ? 'sidebar__link--active' : ''}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
