import { useState, type ReactNode } from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  // მობილურზე Sidebar-ის გახსნა/დახურვა
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="layout">
      <Header onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
