const STATUS_TONE = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ClaimHistoryItem({ claim }) {
  return (
    <tr>
      <td>{claim.item?.item_name || '—'}</td>
      <td>{claim.item?.category || '—'}</td>
      <td className="claims-reason-cell">{claim.reason}</td>
      <td>
        {claim.proof_image_url ? (
          <img
            src={claim.proof_image_url}
            alt={`Proof for ${claim.item?.item_name || 'claim'}`}
            className="claims-table-thumb"
          />
        ) : (
          '—'
        )}
      </td>
      <td>
        <span className={`status-badge ${STATUS_TONE[claim.status] || ''}`}>{claim.status}</span>
      </td>
      <td>{formatDate(claim.created_at)}</td>
    </tr>
  )
}

export default ClaimHistoryItem
