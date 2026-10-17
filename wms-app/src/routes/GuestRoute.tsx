import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

// შესული მომხმარებელი /login და /register გვერდებზე აღარ გადის — მიდის მთავარზე
function GuestRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

export default GuestRoute
