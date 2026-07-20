import { FaArrowLeft, FaClockRotateLeft } from 'react-icons/fa6'
import ClaimHistoryItem from './ClaimHistoryItem'

function ClaimHistoryCard({ claims, isLoadingClaims, highlightedClaimId, onBack }) {
  return (
    <section className="claims-card" aria-labelledby="claim-history-title">
      <div className="claims-card-header">
        <h2 id="claim-history-title"><FaClockRotateLeft aria-hidden="true" /> Claim history</h2>
        <button type="button" className="claims-history-button" onClick={onBack}>
          <FaArrowLeft aria-hidden="true" /> Back
        </button>
      </div>

      <div className="claims-card-content">
        {isLoadingClaims ? (
          <p className="claims-empty">Loading your claims…</p>
        ) : claims.length === 0 ? (
          <p className="claims-empty">You have not submitted any claims yet.</p>
        ) : (
          <div className="claims-table-wrapper">
            <table className="claims-table">
              <thead><tr><th>Item</th><th>Category</th><th>Reason</th><th>Proof</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                {claims.map((claim) => (
                  <ClaimHistoryItem
                    key={claim.claim_id}
                    claim={claim}
                    isHighlighted={String(claim.claim_id) === String(highlightedClaimId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default ClaimHistoryCard
