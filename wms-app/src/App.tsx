import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
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
const ItemDetailPage = lazy(() => import('./pages/inventory/ItemDetailPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const OrderDetailPage = lazy(() => import('./pages/operations/OrderDetailPage'))
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'))

// საწყობის ოპერაციები — გვერდი და მისამართი (წვდომას RoleRoute ამოწმებს roles.ts-დან)
const operations = [
  { path: 'orders', Page: lazy(() => import('./pages/operations/OrdersPage')) },
  { path: 'inbound', Page: lazy(() => import('./pages/operations/InboundPage')) },
  { path: 'outbound', Page: lazy(() => import('./pages/operations/OutboundPage')) },
  { path: 'deliveries', Page: lazy(() => import('./pages/operations/DeliveriesPage')) },
  { path: 'map', Page: lazy(() => import('./pages/map/MapPage')) },
  { path: 'reports', Page: lazy(() => import('./pages/operations/ReportsPage')) },
  { path: 'messages', Page: lazy(() => import('./pages/messages/MessagesPage')) },
]

function App() {
  return (
    <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
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
            <Route path="inventory/:id" element={<ItemDetailPage />} />
            <Route
              path="users"
              element={
                <RoleRoute path="/users">
                  <UsersPage />
                </RoleRoute>
              }
            />
            {operations.map(({ path, Page }) => (
              <Route
                key={path}
                path={path}
                element={
                  <RoleRoute path={`/${path}`}>
                    <Page />
                  </RoleRoute>
                }
              />
            ))}
            <Route
              path="orders/:id"
              element={
                <RoleRoute path="/orders">
                  <OrderDetailPage />
                </RoleRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
