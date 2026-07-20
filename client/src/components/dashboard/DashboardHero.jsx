function DashboardHero({ name }) {
  const firstName = name?.trim().split(/\s+/)[0] || 'Student'

  return (
    <section className="dashboard-hero" aria-labelledby="dashboard-title">
      <div>
        <p className="eyebrow">Campus activity</p>
        <h1 id="dashboard-title">Welcome back, {firstName}.</h1>
        <p>Review recent reports, check possible matches, or quickly submit a new lost and found report.</p>
      </div>
    </section>
  )
}

export default DashboardHero
