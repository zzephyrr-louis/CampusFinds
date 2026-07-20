import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <div className="route-loading" role="status">Loading CampusFind&hellip;</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default PublicOnlyRoute
