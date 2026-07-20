import { Link } from 'react-router-dom'
import { FaArrowRight, FaUserCheck } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'
import StatusBadge from '../ui/StatusBadge'

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date)
}

function RecentClaimsSummary({ claims }) {
  return (
    <section className="dashboard-card summary-card" aria-labelledby="recent-claims-title">
      <SectionHeader
        eyebrow="Ownership reviews"
        title="Recent claims"
        titleId="recent-claims-title"
        description="The latest ownership requests and their review status."
        icon={FaUserCheck}
        action={(
          <Link className="text-link" to="/claims">
            View all <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      />
      {claims.length === 0 ? (
        <p className="empty-state">No claims have been submitted yet.</p>
      ) : (
        <div className="dashboard-activity-list">
          {claims.slice(0, 5).map((claim) => (
            <Link
              className="dashboard-activity-row"
              key={claim.claim_id}
              to={`/claims?claimId=${claim.claim_id}`}
            >
              <span>
                <strong>{claim.item?.item_name || 'Unknown item'}</strong>
                <small>{formatDate(claim.created_at)}</small>
              </span>
              <StatusBadge status={claim.status} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecentClaimsSummary
