const toneByStatus = {
  Open: 'blue',
  'Possible match': 'purple',
  Unclaimed: 'amber',
  Matched: 'green',
  Stored: 'slate',
}

function StatusBadge({ status }) {
  const tone = toneByStatus[status] || 'slate'

  return <span className={`status-badge status-${tone}`}>{status}</span>
}

export default StatusBadge
