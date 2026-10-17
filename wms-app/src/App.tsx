import { Route, Routes } from 'react-router'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import InventoryPage from './pages/inventory/InventoryPage'
import UsersPage from './pages/users/UsersPage'
import ComingSoonPage from './pages/errors/ComingSoonPage'
import NotFoundPage from './pages/errors/NotFoundPage'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'

const comingSoon = [
  { path: 'inbound', title: 'მიღება' },
  { path: 'outbound', title: 'გაცემა' },
  { path: 'orders', title: 'შეკვეთები' },
  { path: 'deliveries', title: 'მიწოდებები' },
  { path: 'map', title: 'საწყობის რუკა' },
  { path: 'reports', title: 'ანგარიშები' },
]

function App() {
  return (
    <Routes>
      {/* საჯარო — მხოლოდ შეუსვლელისთვის */}
      <Route element={<GuestRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* დაცული — საჭიროა შესვლა */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route
            path="users"
            element={
              <RoleRoute path="/users">
                <UsersPage />
              </RoleRoute>
            }
          />
          {comingSoon.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={
                <RoleRoute path={`/${page.path}`}>
                  <ComingSoonPage title={page.title} />
                </RoleRoute>
              }
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
