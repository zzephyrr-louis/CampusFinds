import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaCodeBranch } from 'react-icons/fa6'

function FeaturePlaceholder({ title, description, owner }) {
  const [searchParams] = useSearchParams()
  const { itemId } = useParams()
  const query = searchParams.get('q')
  const type = searchParams.get('type')

  useEffect(() => {
    document.title = `${title} | CampusFind`
  }, [title])

  return (
    <section className="feature-placeholder" aria-labelledby="feature-title">
      <div className="placeholder-icon" aria-hidden="true">
        <FaCodeBranch />
      </div>
      <p className="eyebrow">Route ready for integration</p>
      <h1 id="feature-title">{title}</h1>
      <p>{description}</p>
      {(query || type || itemId) && (
        <dl className="route-context">
          {query && (
            <div>
              <dt>Search query</dt>
              <dd>{query}</dd>
            </div>
          )}
          {type && (
            <div>
              <dt>Report filter</dt>
              <dd>{type}</dd>
            </div>
          )}
          {itemId && (
            <div>
              <dt>Item reference</dt>
              <dd>{itemId}</dd>
            </div>
          )}
        </dl>
      )}
      <div className="placeholder-owner">
        <strong>Assigned to {owner}</strong>
        <span>The shared layout and route are complete; this feature can be implemented independently.</span>
      </div>
      <Link className="secondary-button" to="/dashboard">
        <FaArrowLeft aria-hidden="true" />
        Back to dashboard
      </Link>
    </section>
  )
}

export default FeaturePlaceholder
