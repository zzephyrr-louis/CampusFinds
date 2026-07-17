import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCalendar,
  FaCircleInfo,
  FaClock,
  FaLocationDot,
  FaShieldHalved,
  FaTag,
  FaUser,
} from 'react-icons/fa6'
import StatusBadge from '../components/ui/StatusBadge'
import { mockItems } from '../data/dashboardData'

function formatDate(value) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ItemDetails() {
  const { itemId } = useParams()
  const item = mockItems.find((candidate) => candidate.id === itemId)

  useEffect(() => {
    document.title = item ? `${item.name} | CampusFind` : 'Item Not Found | CampusFind'
  }, [item])

  if (!item) {
    return (
      <section className="item-not-found">
        <div className="placeholder-icon" aria-hidden="true"><FaBoxOpen /></div>
        <p className="eyebrow">Item unavailable</p>
        <h1>We couldn’t find that report</h1>
        <p>It may have been removed, resolved, or the link may be incorrect.</p>
        <Link className="primary-button" to="/search-items">
          <FaArrowLeft aria-hidden="true" />
          Back to search
        </Link>
      </section>
    )
  }

  const isFound = item.reportType === 'found'

  return (
    <div className="item-details-page">
      <Link className="details-back-link" to="/search-items">
        <FaArrowLeft aria-hidden="true" />
        Back to search results
      </Link>

      <article className="item-details-card">
        <div className={`details-visual item-visual-${item.reportType}`} aria-hidden="true">
          <FaBoxOpen />
          <span>{isFound ? 'Found item' : 'Lost item'}</span>
        </div>

        <div className="details-summary">
          <div className="result-card-labels">
            <span className={`report-type report-type-${item.reportType}`}>
              {isFound ? 'Found' : 'Lost'}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <p className="details-reference">Report #{item.id.toUpperCase()}</p>
          <h1>{item.name}</h1>
          <p className="details-description">{item.description}</p>

          <dl className="details-facts">
            <div>
              <dt><FaTag aria-hidden="true" /> Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt><FaLocationDot aria-hidden="true" /> {isFound ? 'Found at' : 'Last seen at'}</dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt><FaCalendar aria-hidden="true" /> Date reported</dt>
              <dd>{formatDate(item.reportedAt)}</dd>
            </div>
            <div>
              <dt><FaUser aria-hidden="true" /> Reported by</dt>
              <dd>{item.reportedBy}</dd>
            </div>
          </dl>
        </div>
      </article>

      <div className="details-lower-grid">
        <div className="details-main-column">
          <section className="details-section">
            <div className="details-section-heading">
              <FaCircleInfo aria-hidden="true" />
              <div>
                <h2>Identifying details</h2>
                <p>Use these details to decide whether this could be your item.</p>
              </div>
            </div>
            <p className="identifying-copy">{item.identifyingFeatures}</p>
            {item.storageLocation && (
              <div className="storage-note">
                <strong>Current storage location</strong>
                <span>{item.storageLocation}</span>
              </div>
            )}
          </section>

          <section className="details-section">
            <div className="details-section-heading">
              <FaClock aria-hidden="true" />
              <div>
                <h2>Report activity</h2>
                <p>The latest public update for this report.</p>
              </div>
            </div>
            <ol className="item-timeline">
              <li>
                <span aria-hidden="true" />
                <div>
                  <strong>Report submitted</strong>
                  <time dateTime={item.reportedAt}>{formatDate(item.reportedAt)}</time>
                  <p>The item was added to the CampusFind directory.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true" />
                <div>
                  <strong>Status: {item.status}</strong>
                  <p>This report is still visible to the campus community.</p>
                </div>
              </li>
            </ol>
          </section>
        </div>

        <aside className="claim-panel">
          <div className="claim-panel-icon" aria-hidden="true"><FaShieldHalved /></div>
          <h2>{isFound ? 'Is this your item?' : 'Have you found this item?'}</h2>
          <p>
            {isFound
              ? 'Submit a claim with details that only the owner is likely to know.'
              : 'Create a found-item report and mention this report reference so staff can compare them.'}
          </p>
          <Link
            className="primary-button"
            to={isFound ? `/claims?itemId=${item.id}` : `/report-found?relatedItem=${item.id}`}
          >
            {isFound ? 'Start a claim' : 'Report that I found it'}
          </Link>
          <div className="safety-note">
            <FaShieldHalved aria-hidden="true" />
            <span>Meet only at an official campus handover point. Never post private proof publicly.</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ItemDetails
