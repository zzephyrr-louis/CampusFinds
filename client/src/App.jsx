import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/routing/ProtectedRoute'
import PublicOnlyRoute from './components/routing/PublicOnlyRoute'
import RoleRoute from './components/routing/RoleRoute'
import Account from './pages/Account'
import AdminPanel from './pages/AdminPanel'
import Dashboard from './pages/Dashboard'
import FeaturePlaceholder from './pages/FeaturePlaceholder'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import Register from './pages/Register'
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
          <Route
            path="/report-lost"
            element={
              <FeaturePlaceholder
                title="Report a Lost Item"
                description="Students will submit the item name, category, last-seen location, date, description, and optional photo here."
                owner="Member 2"
              />
            }
          />
          <Route
            path="/report-found"
            element={
              <FeaturePlaceholder
                title="Report a Found Item"
                description="Finders will record an item, where it was found, its current storage location, condition, and optional photo here."
                owner="Member 2"
              />
            }
          />
          <Route
            path="/search-items"
            element={
              <FeaturePlaceholder
                title="Search Items"
                description="Students will search and filter lost and found reports by keyword, category, location, date, and status here."
                owner="Member 2"
              />
            }
          />
          <Route
            path="/items/:itemId"
            element={
              <FeaturePlaceholder
                title="Item Details"
                description="This page will show one complete item report, its status history, and available claim actions."
                owner="Member 2"
              />
            }
          />
          <Route
            path="/claims"
            element={
              <FeaturePlaceholder
                title="My Claims"
                description="Students will submit proof of ownership and track pending, approved, rejected, and completed claims here."
                owner="Member 3"
              />
            }
          />
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
