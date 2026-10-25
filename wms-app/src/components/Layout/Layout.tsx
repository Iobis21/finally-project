import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'
import './Layout.css'

function Layout() {
  // მობილურზე Sidebar-ის გახსნა/დახურვა
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // გვერდის შეცვლისას მენიუ იხურება
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // ღია მენიუ: Esc ხურავს, უკანა გვერდი არ სქროლდება
  useEffect(() => {
    if (!isMenuOpen) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <div className="layout">
      <Header isMenuOpen={isMenuOpen} onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <main className="layout__main">
        {/* თუ გვერდი „გატყდება", Header და მენიუ მაინც მუშაობს */}
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
