import { Link } from 'react-router-dom'
import { FaArrowRight, FaBolt } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'

function QuickActions({ actions }) {
  return (
    <section className="dashboard-card quick-actions-card" aria-labelledby="quick-actions-title">
      <SectionHeader
        eyebrow="Shortcuts"
        title="Quick actions"
        titleId="quick-actions-title"
        description="Start the most common CampusFind tasks."
        icon={FaBolt}
      />
      <div className="quick-action-grid">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link className={`quick-action quick-action-${action.tone}`} to={action.to} key={action.to}>
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
        })}
      </div>
    </section>
  )
}

export default QuickActions
