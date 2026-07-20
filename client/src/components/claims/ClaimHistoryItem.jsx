import StatusBadge from '../ui/StatusBadge'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function ClaimHistoryItem({ claim, isHighlighted = false }) {
  return (
    <tr className={isHighlighted ? 'is-highlighted' : ''}>
      <td>{claim.item?.item_name || '—'}</td>
      <td>{claim.item?.category || '—'}</td>
      <td className="claims-reason-cell">{claim.reason || '—'}</td>
      <td>
        {claim.proof_image_url ? (
          <a href={claim.proof_image_url} target="_blank" rel="noreferrer">
            <img src={claim.proof_image_url} alt={`Proof for ${claim.item?.item_name || 'claim'}`} className="claims-table-thumb" />
          </a>
        ) : '—'}
      </td>
      <td><StatusBadge status={claim.status} /></td>
      <td>{formatDate(claim.created_at)}</td>
    </tr>
  )
}

export default ClaimHistoryItem
