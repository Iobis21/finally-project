import { Route, Routes } from 'react-router'
import Layout from './components/Layout/Layout'
import DashboardPage from './pages/dashboard/DashboardPage'
import InventoryPage from './pages/inventory/InventoryPage'
import ComingSoonPage from './pages/errors/ComingSoonPage'
import NotFoundPage from './pages/errors/NotFoundPage'
import RoleRoute from './routes/RoleRoute'

const comingSoon = [
  { path: 'inbound', title: 'მიღება' },
  { path: 'outbound', title: 'გაცემა' },
  { path: 'orders', title: 'შეკვეთები' },
  { path: 'deliveries', title: 'მიწოდებები' },
  { path: 'map', title: 'საწყობის რუკა' },
  { path: 'users', title: 'თანამშრომლები' },
  { path: 'reports', title: 'ანგარიშები' },
]

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
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
    </Routes>
  )
}

export default App
