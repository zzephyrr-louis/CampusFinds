import { useEffect } from 'react'
import DashboardHero from '../components/dashboard/DashboardHero'
import DashboardOverview from '../components/dashboard/DashboardOverview'
import FoundItemsSummary from '../components/dashboard/FoundItemsSummary'
import LostItemsSummary from '../components/dashboard/LostItemsSummary'
import QuickActions from '../components/dashboard/QuickActions'
import { useAuth } from '../context/useAuth'
import {
  dashboardStats,
  quickActions,
  recentFoundItems,
  recentLostItems,
} from '../data/dashboardData'

function Dashboard() {
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'Dashboard | CampusFind'
  }, [])

  return (
    <div className="dashboard-page">
      <DashboardHero name={user?.fullname} />
      <div className="dashboard-grid">
        <DashboardOverview stats={dashboardStats} />
        <LostItemsSummary items={recentLostItems} />
        <FoundItemsSummary items={recentFoundItems} />
        <QuickActions actions={quickActions} />
      </div>
    </div>
  )
}

export default Dashboard
