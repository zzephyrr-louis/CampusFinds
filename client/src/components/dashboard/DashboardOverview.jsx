import { Link } from 'react-router-dom'
import { FaArrowTrendUp, FaChartSimple } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'

function DashboardOverview({ stats }) {
  return (
    <section className="dashboard-card overview-card" aria-labelledby="overview-title">
      <SectionHeader
        eyebrow="Overview"
        title="Dashboard overview"
        titleId="overview-title"
        description="A quick count of reports and claims that still need attention."
        icon={FaChartSimple}
      />
      <div className="stats-grid">
        {stats.map((stat) => (
          <Link className={`stat-card stat-${stat.tone}`} to={stat.to} key={stat.id}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>
              <FaArrowTrendUp aria-hidden="true" />
              {stat.detail}
            </small>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default DashboardOverview
