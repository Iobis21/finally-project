import { Link, useNavigate } from 'react-router'
import { Bell, Boxes, LogOut, Menu, Moon, Sun, UserRound, Warehouse } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { roles } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { useInventory, useInventoryCounts } from '../../store/inventory/useInventory'
import './Header.css'

interface HeaderProps {
  isMenuOpen: boolean
  onMenuClick: () => void
}

function Header({ isMenuOpen, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  // გლობალური Store-იდან — Header ავტომატურად განახლდება, როცა მოდალში ნივთს დაამატებენ ან წაშლიან
  const { total, critical } = useInventoryCounts()
  const { setStatus } = useInventory()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
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

  function handleLogout() {
    setIsProfileOpen(false)
    logout()
    navigate('/login')
  }

  if (!user) return null
  const fullName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName[0]}${user.lastName[0]}`

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
        <Link to="/inventory" className="header__counter" title="ნივთები საწყობში">
          <Boxes size={18} aria-hidden="true" />
          <span>
            <strong>{total}</strong>
            <span className="header__counter-label"> ნივთი</span>
          </span>
        </Link>

        {/* თემის გადამრთველი: მზე ↔ მთვარე */}
        <button
          className="header__icon-btn header__theme"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'ღია თემაზე გადართვა' : 'მუქ თემაზე გადართვა'}
          title={theme === 'dark' ? 'ღია თემა' : 'მუქი თემა'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* ზარი: კრიტიკული მარაგის რაოდენობა. დაჭერით — მარაგები „კრიტიკული" ფილტრით */}
        <button
          className="header__icon-btn"
          aria-label={`კრიტიკული მარაგი: ${critical}`}
          title="კრიტიკული მარაგი"
          onClick={() => {
            setStatus('low_stock')
            navigate('/inventory')
          }}
        >
          <Bell size={20} />
          {critical > 0 && <span className="header__badge">{critical}</span>}
        </button>
        <div className="header__profile-wrap" ref={profileRef}>
          <button
            className="header__profile"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <span className="header__avatar">{initials}</span>
            <span className="header__user">
              <strong>{fullName}</strong>
              <small>{roles[user.role].label}</small>
            </span>
          </button>

          {isProfileOpen && (
            <div className="header__dropdown">
              <p className="header__dropdown-info">
                <UserRound size={16} aria-hidden="true" />
                {user.email}
              </p>
              <button className="header__dropdown-item" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" />
                გასვლა
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
