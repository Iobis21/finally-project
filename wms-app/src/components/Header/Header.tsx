import { Link } from 'react-router'
import { Bell, Menu, Warehouse } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { roles, useRole } from '../../context/RoleContext'
import type { Role } from '../../types'
import './Header.css'

interface HeaderProps {
  isMenuOpen: boolean
  onMenuClick: () => void
}

function Header({ isMenuOpen, onMenuClick }: HeaderProps) {
  const { role, setRole } = useRole()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const current = roles[role]
  const profileRef = useRef<HTMLDivElement>(null)

  // პროფილის მენიუ იხურება Esc-ით ან გარეთ დაჭერით
  useEffect(() => {
    if (!isProfileOpen) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsProfileOpen(false)
    }
    function handleClickOutside(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setIsProfileOpen(false)
    }

    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  function changeRole(newRole: Role) {
    setRole(newRole)
    setIsProfileOpen(false)
  }

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__burger"
          onClick={onMenuClick}
          aria-label="მენიუს გახსნა"
          aria-expanded={isMenuOpen}
          aria-controls="sidebar"
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="header__logo">
          <Warehouse size={26} aria-hidden="true" />
          <span>WMS</span>
        </Link>
      </div>

      <div className="header__right">
        <button className="header__icon-btn" aria-label="შეტყობინებები, 3 წაუკითხავი">
          <Bell size={20} />
          <span className="header__dot" />
        </button>
        <div className="header__profile-wrap" ref={profileRef}>
          <button
            className="header__profile"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            aria-label={`პროფილი: ${current.user}, როლის შეცვლა`}
          >
            <span className="header__avatar">{current.initials}</span>
            <span className="header__user">
              <strong>{current.user}</strong>
              <small>{current.label}</small>
            </span>
          </button>

          {/* როლის გადართვა */}
          {isProfileOpen && (
            <ul className="header__dropdown">
              {(Object.keys(roles) as Role[]).map((r) => (
                <li key={r}>
                  <button
                    className={`header__dropdown-item ${r === role ? 'header__dropdown-item--active' : ''}`}
                    onClick={() => changeRole(r)}
                  >
                    {roles[r].label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
