import { Link } from 'react-router-dom'
import { FaBoxOpen, FaCalendar, FaChevronRight, FaLocationDot } from 'react-icons/fa6'
import StatusBadge from '../ui/StatusBadge'

function formatReportedDate(value) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function SearchResultCard({ item }) {
  return (
    <Link className="search-result-card" to={`/items/${item.id}`}>
      <div className={`item-visual item-visual-${item.reportType}`} aria-hidden="true">
        <FaBoxOpen />
      </div>
      <div className="result-card-content">
        <div className="result-card-labels">
          <span className={`report-type report-type-${item.reportType}`}>
            {item.reportType === 'lost' ? 'Lost' : 'Found'}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <dl className="result-card-meta">
          <div>
            <dt><FaLocationDot aria-hidden="true" /><span className="sr-only">Location</span></dt>
            <dd>{item.location}</dd>
          </div>
          <div>
            <dt><FaCalendar aria-hidden="true" /><span className="sr-only">Reported</span></dt>
            <dd>{formatReportedDate(item.reportedAt)}</dd>
          </div>
        </dl>
        <span className="view-details">View details <FaChevronRight aria-hidden="true" /></span>
      </div>
    </Link>
  )
}

export default SearchResultCard
