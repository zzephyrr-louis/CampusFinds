import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa6'

function DashboardStatCard({ stat }) {
  return (
    <Link className={`stat-card stat-${stat.tone}`} to={stat.to}>
      <span>{stat.label}</span>
      <strong>{stat.value}</strong>
      <small>
        <FaArrowRight aria-hidden="true" />
        {stat.detail}
      </small>
    </Link>
  )
}

export default DashboardStatCard
