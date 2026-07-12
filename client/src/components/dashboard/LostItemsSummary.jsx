import { Link } from 'react-router-dom'
import { FaArrowRight, FaTag } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'
import ItemSummaryList from './ItemSummaryList'

function LostItemsSummary({ items }) {
  return (
    <section className="dashboard-card summary-card" aria-labelledby="lost-summary-title">
      <SectionHeader
        eyebrow="Recent reports"
        title="Lost items"
        titleId="lost-summary-title"
        description="Newest items reported missing around campus."
        icon={FaTag}
        action={
          <Link className="text-link" to="/search-items?type=lost">
            View all <FaArrowRight aria-hidden="true" />
          </Link>
        }
      />
      <div>
        <ItemSummaryList items={items} emptyMessage="No lost items have been reported yet." />
      </div>
    </section>
  )
}

export default LostItemsSummary
