import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default PublicOnlyRoute
