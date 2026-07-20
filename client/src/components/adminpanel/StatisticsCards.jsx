function StatisticsCards({ stats }) {
  return (
    <section className="statistics-cards" aria-label="Platform overview">
      {stats.map((stat) => (
        <article key={stat.id} className="admin-stat-card">
          <span className={`admin-stat-icon admin-stat-${stat.tone}`} aria-hidden="true">
            {stat.icon}
          </span>
          <div>
            <p className="admin-stat-title">{stat.title}</p>
            <strong className="admin-stat-value">{stat.value}</strong>
          </div>
        </article>
      ))}
    </section>
  )
}

export default StatisticsCards
