import { FaChartSimple } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'
import DashboardStatCard from './DashboardStatCard'

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
        {stats.map((stat) => <DashboardStatCard key={stat.id} stat={stat} />)}
      </div>
    </section>
  )
}

export default DashboardOverview
