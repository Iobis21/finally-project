import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { SkeletonGrid } from './components/Loader/Loader'
import Layout from './components/Layout/Layout'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import { InventoryProvider } from './store/inventory/InventoryContext'

// Lazy Loading: თითო გვერდი ცალკე ფაილად (chunk) იტვირთება მხოლოდ მაშინ, როცა მომხმარებელი მასზე გადავა.
// მაგ. ოპერატორს „თანამშრომლების" გვერდის კოდი საერთოდ არ ჩამოეტვირთება.
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const ComingSoonPage = lazy(() => import('./pages/errors/ComingSoonPage'))
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'))

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
    <Suspense fallback={<SkeletonGrid count={4} />}>
      <Routes>
        {/* საჯარო — მხოლოდ შეუსვლელისთვის */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* დაცული — საჭიროა შესვლა */}
        <Route element={<ProtectedRoute />}>
          {/* InventoryProvider — მარაგების გლობალური Store ყველა დაცული გვერდისთვის */}
          <Route
            element={
              <InventoryProvider>
                <Layout />
              </InventoryProvider>
            }
          >
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
    </Suspense>
  )
}

export default App
