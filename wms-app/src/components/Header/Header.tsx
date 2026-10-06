import { Bell, Menu, Warehouse } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__left">
        <button className="header__burger" onClick={onMenuClick} aria-label="მენიუს გახსნა">
          <Menu size={22} />
        </button>
        <a href="/" className="header__logo">
          <Warehouse size={26} />
          <span>WMS</span>
        </a>
      </div>

      <div className="header__right">
        <button className="header__icon-btn" aria-label="შეტყობინებები">
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
