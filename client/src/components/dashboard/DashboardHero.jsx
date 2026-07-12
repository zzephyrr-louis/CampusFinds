import { FaCircleInfo } from 'react-icons/fa6'

function DashboardHero({ name }) {
  const firstName = name?.trim().split(/\s+/)[0] || 'Student'

  return (
    <section className="dashboard-hero" aria-labelledby="dashboard-title">
      <div>
        <p className="eyebrow">Campus activity</p>
        <h1 id="dashboard-title">Welcome back, {firstName}.</h1>
        <p>Review recent reports, check possible matches, or quickly submit a new lost and found report.</p>
      </div>
      <div className="preview-notice" role="status">
        <FaCircleInfo aria-hidden="true" />
        <div>
          <strong>Frontend preview mode</strong>
          <span>Dashboard information is sample data while the backend is paused.</span>
        </div>
      </div>
    </section>
  )
}

export default DashboardHero
