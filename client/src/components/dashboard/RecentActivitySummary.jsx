import { Link } from 'react-router-dom'
import { FaClockRotateLeft } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function activityLink(activity) {
  const itemId = activity.item_id ?? activity.itemId
  const claimId = activity.claim_id ?? activity.claimId
  if (itemId) return `/items/${itemId}`
  if (claimId) return `/claims?claimId=${claimId}`
  return ''
}

function RecentActivitySummary({ activities }) {
  if (activities.length === 0) return null

  return (
    <section className="dashboard-card overview-card" aria-labelledby="recent-activity-title">
      <SectionHeader
        eyebrow="System timeline"
        title="Recent activity"
        titleId="recent-activity-title"
        description="The latest updates recorded by CampusFind."
        icon={FaClockRotateLeft}
      />
      <div className="dashboard-activity-list dashboard-system-activity">
        {activities.slice(0, 6).map((activity, index) => {
          const to = activityLink(activity)
          const content = (
            <>
              <span>
                <strong>{activity.title || activity.action || activity.activity_type || 'CampusFind update'}</strong>
                <small>{activity.details || activity.description || activity.message || ''}</small>
              </span>
              <time dateTime={activity.occurred_at || activity.created_at}>
                {formatDate(activity.occurred_at || activity.created_at)}
              </time>
            </>
          )

          return to ? (
            <Link className="dashboard-activity-row" key={activity.activity_id ?? activity.id ?? index} to={to}>
              {content}
            </Link>
          ) : (
            <div className="dashboard-activity-row" key={activity.activity_id ?? activity.id ?? index}>
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default RecentActivitySummary
