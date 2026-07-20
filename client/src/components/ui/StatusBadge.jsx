const toneByStatus = {
  open: 'blue',
  'possible match': 'purple',
  unclaimed: 'amber',
  pending: 'amber',
  matched: 'green',
  claimed: 'green',
  resolved: 'green',
  approved: 'green',
  active: 'green',
  stored: 'slate',
  rejected: 'red',
  suspended: 'red',
  'under review': 'amber',
}

function StatusBadge({ status }) {
  const tone = toneByStatus[String(status).toLowerCase()] || 'slate'

  return <span className={`status-badge status-${tone}`}>{status}</span>
}

export default StatusBadge
