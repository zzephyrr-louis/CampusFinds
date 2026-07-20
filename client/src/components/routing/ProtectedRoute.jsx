import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="route-loading" role="status">Loading CampusFind&hellip;</div>
  }

  if (!isAuthenticated) {
    const destination = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from: destination }} />
  }

  return <Outlet />
}

export default ProtectedRoute
