import type { ReactNode } from 'react'
import { Warehouse } from 'lucide-react'
import './Auth.css'

// შესვლის / რეგისტრაციის გვერდების ჩარჩო — ცენტრში ბარათი
function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth">
      <section className="auth__card">
        <div className="auth__logo">
          <Warehouse size={30} aria-hidden="true" />
          <span>WMS</span>
        </div>
        <h1 className="auth__title">{title}</h1>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
