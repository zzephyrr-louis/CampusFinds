import { Link } from 'react-router-dom'
import { FaLocationDot } from 'react-icons/fa6'
import StatusBadge from '../ui/StatusBadge'

function ItemSummaryRow({ item }) {
  const reportedDate = item.reportedAt
    ? new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date(item.reportedAt))
    : 'Date unavailable'

  return (
    <Link className="item-summary-row" to={`/items/${item.id}`}>
      <span className="item-summary-main">
        <strong>{item.name}</strong>
        <small>{item.category}</small>
      </span>
      <span className="item-location">
        <FaLocationDot aria-hidden="true" />
        {item.location}
      </span>
      <span className="item-summary-meta">
        <StatusBadge status={item.status} />
        <time dateTime={item.reportedAt}>{reportedDate}</time>
      </span>
    </Link>
  )
}

export default ItemSummaryRow
