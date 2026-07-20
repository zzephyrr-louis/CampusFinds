import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardHero from '../components/dashboard/DashboardHero'
import DashboardOverview from '../components/dashboard/DashboardOverview'
import FoundItemsSummary from '../components/dashboard/FoundItemsSummary'
import LostItemsSummary from '../components/dashboard/LostItemsSummary'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivitySummary from '../components/dashboard/RecentActivitySummary'
import RecentClaimsSummary from '../components/dashboard/RecentClaimsSummary'
import { useAuth } from '../context/useAuth'
import { quickActions } from '../data/dashboardConfig'
import api from '../services/api'
import { asArray, toClaimView, toItemView } from '../services/mappers'

function count(summary, ...keys) {
  const value = keys.map((key) => summary?.[key]).find((candidate) => candidate !== undefined)
  return Number(value) || 0
}

function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async ({ signal } = {}) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.get('/dashboard/summary', { signal })
      setSummary(response.data?.summary || response.data || {})
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.response?.data?.message || 'Unable to load the dashboard.')
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Dashboard | CampusFind'
    const controller = new AbortController()
    const loadTimer = window.setTimeout(() => loadSummary({ signal: controller.signal }), 0)
    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [loadSummary])

  const items = useMemo(
    () => asArray(summary?.recent_items).map(toItemView),
    [summary],
  )
  const claims = useMemo(
    () => asArray(summary?.recent_claims).map(toClaimView),
    [summary],
  )
  const activities = asArray(summary?.recent_activity || summary?.activity)

  const stats = [
    {
      id: 'lost', label: 'Lost items',
      value: count(summary, 'total_lost_items', 'lost_items'),
      detail: 'Open lost-item reports', tone: 'blue', to: '/search-items?type=lost',
    },
    {
      id: 'found', label: 'Found items',
      value: count(summary, 'total_found_items', 'found_items'),
      detail: 'Found-item reports', tone: 'purple', to: '/search-items?type=found',
    },
    {
      id: 'pending', label: 'Pending claims',
      value: count(summary, 'total_pending_claims', 'pending_claims'),
      detail: 'Awaiting review', tone: 'amber', to: '/claims',
    },
    {
      id: 'approved', label: 'Approved claims',
      value: count(summary, 'total_approved_claims', 'approved_claims'),
      detail: 'Ownership verified', tone: 'green', to: '/claims',
    },
    {
      id: 'rejected', label: 'Rejected claims',
      value: count(summary, 'total_rejected_claims', 'rejected_claims'),
      detail: 'Claims not verified', tone: 'red', to: '/claims',
    },
  ]

  return (
    <div className="dashboard-page">
      <DashboardHero name={user?.fullname} />

      {error && (
        <div className="page-error-state" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => loadSummary()}>Try again</button>
        </div>
      )}

      {isLoading ? (
        <div className="page-loading-state" role="status">Loading dashboard&hellip;</div>
      ) : !error && (
        <div className="dashboard-grid">
          <DashboardOverview stats={stats} />
          <LostItemsSummary items={items.filter((item) => item.reportType === 'lost').slice(0, 3)} />
          <FoundItemsSummary items={items.filter((item) => item.reportType === 'found').slice(0, 3)} />
          <RecentClaimsSummary claims={claims} />
          <QuickActions actions={quickActions} />
          <RecentActivitySummary activities={activities} />
        </div>
      )}
    </div>
  )
}

export default Dashboard
