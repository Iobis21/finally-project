import { Link } from 'react-router'
import { Bell, Menu, Warehouse } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  isMenuOpen: boolean
  onMenuClick: () => void
}

function Header({ isMenuOpen, onMenuClick }: HeaderProps) {
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
        <button className="header__profile">
          <span className="header__avatar">გბ</span>
          <span className="header__user">
            <strong>გიორგი ბერიძე</strong>
            <small>საწყობის მენეჯერი</small>
          </span>
        </button>
      </div>
    </header>
  )
}

export default Header
