function formatLogDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function MatchLogs({ logs }) {
  return (
    <section className="match-logs-container" aria-labelledby="activity-log-title">
      <div className="admin-section-heading">
        <div><h2 id="activity-log-title">Recent system activity</h2><p>Latest item, claim, and account updates recorded by CampusFind.</p></div>
      </div>

      {logs.length === 0 ? (
        <p className="admin-empty-state">No recent system activity is available.</p>
      ) : (
        <div className="logs-scroll">
          <table className="logs-table">
            <thead><tr><th scope="col">Date</th><th scope="col">Actor</th><th scope="col">Activity</th></tr></thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.activity_id ?? log.id ?? index}>
                  <td><time dateTime={log.occurred_at || log.created_at}>{formatLogDate(log.occurred_at || log.created_at)}</time></td>
                  <td><strong>{log.actor?.fullname || log.actor_name || log.admin_name || 'CampusFind'}</strong></td>
                  <td>{log.details || log.description || log.message || log.action || log.title || log.activity_type || 'System update'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default MatchLogs
