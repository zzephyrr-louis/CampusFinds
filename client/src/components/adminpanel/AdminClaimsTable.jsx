import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'
import StatusBadge from '../ui/StatusBadge'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date)
}

function AdminClaimsTable({ claims, busyClaimId, onReview }) {
  const orderedClaims = [...claims].sort((first, second) => {
    const firstPending = first.status.toLowerCase() === 'pending' ? 0 : 1
    const secondPending = second.status.toLowerCase() === 'pending' ? 0 : 1
    return firstPending - secondPending || new Date(second.created_at) - new Date(first.created_at)
  })

  return (
    <section className="admin-table-container admin-claims-container" aria-labelledby="claim-review-title">
      <div className="admin-section-heading">
        <div><h2 id="claim-review-title">Claim review</h2><p>Verify proof of ownership before approving an item handover.</p></div>
        <span>{claims.filter((claim) => claim.status.toLowerCase() === 'pending').length} pending</span>
      </div>

      {claims.length === 0 ? (
        <p className="admin-empty-state">No ownership claims have been submitted.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table admin-claims-table">
            <thead><tr><th>Item</th><th>Claimant</th><th>Proof details</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
            <tbody>
              {orderedClaims.map((claim) => {
                const isPending = claim.status.toLowerCase() === 'pending'
                const isBusy = String(busyClaimId) === String(claim.claim_id)
                return (
                  <tr key={claim.claim_id}>
                    <td><strong>{claim.item?.item_name || 'Unknown item'}</strong><small>{claim.item?.category || ''}</small></td>
                    <td>{claim.claimant?.fullname || claim.claimant_name || 'CampusFind user'}</td>
                    <td className="admin-claim-reason">{claim.reason || '—'}{claim.proof_image_url && <a className="text-link" href={claim.proof_image_url} target="_blank" rel="noreferrer">View image proof</a>}</td>
                    <td><StatusBadge status={claim.status} /></td>
                    <td>{formatDate(claim.created_at)}</td>
                    <td>
                      {isPending ? (
                        <div className="admin-row-actions">
                          <button className="admin-action-button admin-approve-button" type="button" disabled={isBusy} onClick={() => onReview(claim, 'approve')}><FaCircleCheck aria-hidden="true" /> Approve</button>
                          <button className="admin-action-button admin-delete-button" type="button" disabled={isBusy} onClick={() => onReview(claim, 'reject')}><FaCircleXmark aria-hidden="true" /> Reject</button>
                        </div>
                      ) : 'Reviewed'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminClaimsTable
