import { Link } from 'react-router-dom'
import { FaLocationDot } from 'react-icons/fa6'
import StatusBadge from '../ui/StatusBadge'

function ItemSummaryList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <div className="item-summary-list">
      {items.map((item) => (
        <Link className="item-summary-row" to={`/items/${item.id}`} key={item.id}>
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
            <time dateTime={item.reportedAt}>{item.displayDate}</time>
          </span>
        </Link>
      ))}
    </div>
  )
}

export default ItemSummaryList
