import { FaBolt } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'
import QuickActionCard from './QuickActionCard'

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
        {actions.map((action) => <QuickActionCard action={action} key={action.to} />)}
      </div>
    </section>
  )
}

export default QuickActions
