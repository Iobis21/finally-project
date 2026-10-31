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
import { NavLink } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useInventory } from '../../store/inventory/useInventory'
import './Sidebar.css'

const menu = [
  { label: 'მთავარი', icon: LayoutDashboard, href: '/' },
  { label: 'მარაგები', icon: Boxes, href: '/inventory' },
  { label: 'მიღება', icon: PackageCheck, href: '/inbound' },
  { label: 'გაცემა', icon: PackageOpen, href: '/outbound' },
  { label: 'შეკვეთები', icon: ClipboardList, href: '/orders' },
  { label: 'მიწოდებები', icon: Truck, href: '/deliveries' },
  { label: 'საწყობის რუკა', icon: Map, href: '/map' },
  { label: 'თანამშრომლები', icon: Users, href: '/users' },
  { label: 'სტატისტიკა', icon: BarChart3, href: '/reports' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { canOpen } = useAuth()
  const { resetFilters } = useInventory()
  // მენიუში მხოლოდ ის გვერდები ჩანს, რაზეც როლს წვდომა აქვს
  const visibleMenu = menu.filter((item) => canOpen(item.href))

  return (
    <>
      {/* მუქი ფონი მობილურზე, დაჭერით იხურება */}
      {isOpen && <div className="sidebar__overlay" onClick={onClose} />}

      <aside id="sidebar" className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <button className="sidebar__close" onClick={onClose} aria-label="მენიუს დახურვა">
          <X size={22} />
        </button>

        <nav aria-label="მთავარი მენიუ">
          <ul className="sidebar__list">
            {visibleMenu.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  /* მენიუდან მარაგებში — ყოველთვის სრული სია, ძველი ფილტრი აღარ რჩება */
                  onClick={item.href === '/inventory' ? resetFilters : undefined}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <item.icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
