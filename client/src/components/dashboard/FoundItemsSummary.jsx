import { Link } from 'react-router-dom'
import { FaArrowRight, FaClipboardCheck } from 'react-icons/fa6'
import SectionHeader from '../ui/SectionHeader'
import ItemSummaryList from './ItemSummaryList'

function FoundItemsSummary({ items }) {
  return (
    <section className="dashboard-card summary-card" aria-labelledby="found-summary-title">
      <SectionHeader
        eyebrow="Recent reports"
        title="Found items"
        titleId="found-summary-title"
        description="Latest items found and turned in on campus."
        icon={FaClipboardCheck}
        action={
          <Link className="text-link" to="/search-items?type=found">
            View all <FaArrowRight aria-hidden="true" />
          </Link>
        }
      />
      <div>
        <ItemSummaryList items={items} emptyMessage="No found items have been reported yet." />
      </div>
    </section>
  )
}

export default FoundItemsSummary
