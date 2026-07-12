import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function RoleRoute({ allowedRoles }) {
  const { user } = useAuth()

  return allowedRoles.includes(user?.role) ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export default RoleRoute
