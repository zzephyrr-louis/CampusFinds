import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/routing/ProtectedRoute'
import PublicOnlyRoute from './components/routing/PublicOnlyRoute'
import RoleRoute from './components/routing/RoleRoute'
import Account from './pages/Account'
import AdminPanel from './pages/AdminPanel'
import Claims from './pages/Claims'
import Dashboard from './pages/Dashboard'
import ItemDetails from './pages/ItemDetails'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import Register from './pages/Register'
import SearchItems from './pages/SearchItems'
import ReportItem from './pages/ReportItem'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/report-lost" element={<ReportItem type="lost" />} />
          <Route path="/report-found" element={<ReportItem type="found" />} />
          <Route path="/search-items" element={<SearchItems />} />
          <Route path="/items/:itemId" element={<ItemDetails />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
