import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

function QuickActionCard({ action }) {
  const Icon = action.icon

  return (
    <Link className={`quick-action quick-action-${action.tone}`} to={action.to}>
      <span className="quick-action-icon" aria-hidden="true">
        <Icon />
      </span>
      <span>
        <strong>{action.label}</strong>
        <small>{action.description}</small>
      </span>
      <FaArrowRight className="quick-action-arrow" aria-hidden="true" />
    </Link>
  )
}

export default QuickActionCard
