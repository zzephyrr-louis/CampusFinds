import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FaBoxOpen,
  FaCalendar,
  FaChevronRight,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRotateLeft,
} from 'react-icons/fa6'
import StatusBadge from '../components/ui/StatusBadge'
import { mockItems } from '../data/dashboardData'

const defaultFilters = {
  q: '',
  type: 'all',
  category: 'all',
  status: 'all',
  timeframe: 'all',
  sort: 'newest',
}

function filtersFromParams(searchParams) {
  return {
    q: searchParams.get('q') || defaultFilters.q,
    type: searchParams.get('type') || defaultFilters.type,
    category: searchParams.get('category') || defaultFilters.category,
    status: searchParams.get('status') || defaultFilters.status,
    timeframe: searchParams.get('timeframe') || defaultFilters.timeframe,
    sort: searchParams.get('sort') || defaultFilters.sort,
  }
}

function formatReportedDate(value) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function SearchItems() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = filtersFromParams(searchParams)

  useEffect(() => {
    document.title = 'Search Items | CampusFind'
  }, [])

  const categories = useMemo(
    () => [...new Set(mockItems.map((item) => item.category))].sort(),
    [],
  )
  const statuses = useMemo(
    () => [...new Set(mockItems.map((item) => item.status))].sort(),
    [],
  )

  const filteredItems = useMemo(() => {
    const query = filters.q.trim().toLowerCase()
    const now = new Date()

    return mockItems
      .filter((item) => {
        const searchableText = [
          item.name,
          item.category,
          item.location,
          item.description,
        ].join(' ').toLowerCase()
        const daysOld = (now - new Date(item.reportedAt)) / 86400000

        return (
          (!query || searchableText.includes(query)) &&
          (filters.type === 'all' || item.reportType === filters.type) &&
          (filters.category === 'all' || item.category === filters.category) &&
          (filters.status === 'all' || item.status === filters.status) &&
          (filters.timeframe === 'all' || daysOld <= Number(filters.timeframe))
        )
      })
      .sort((first, second) => {
        const difference = new Date(second.reportedAt) - new Date(first.reportedAt)
        return filters.sort === 'oldest' ? -difference : difference
      })
  }, [filters])

  function updateFilter(event) {
    const { name, value } = event.target
    const nextFilters = { ...filters, [name]: value }
    const nextParams = {}

    Object.entries(nextFilters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue !== defaultFilters[key]) nextParams[key] = filterValue
    })

    setSearchParams(nextParams, { replace: true })
  }

  function applyFilters(event) {
    event.preventDefault()
  }

  function clearFilters() {
    setSearchParams({})
  }

  return (
    <div className="search-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Campus lost &amp; found</p>
          <h1>Search items</h1>
          <p>Browse recent reports and narrow the list using any details you remember.</p>
        </div>
        <div className="search-total" aria-label={`${filteredItems.length} reports found`}>
          <strong>{filteredItems.length}</strong>
          <span>{filteredItems.length === 1 ? 'report found' : 'reports found'}</span>
        </div>
      </header>

      <form className="search-filter-card" role="search" onSubmit={applyFilters}>
        <div className="search-keyword-field">
          <label htmlFor="item-search">What are you looking for?</label>
          <div>
            <FaMagnifyingGlass aria-hidden="true" />
            <input
              id="item-search"
              name="q"
              type="search"
              value={filters.q}
              onChange={updateFilter}
              placeholder="Item name, description, or location"
            />
          </div>
        </div>

        <div className="filter-grid">
          <label>
            Report type
            <select name="type" value={filters.type} onChange={updateFilter}>
              <option value="all">All reports</option>
              <option value="lost">Lost items</option>
              <option value="found">Found items</option>
            </select>
          </label>
          <label>
            Category
            <select name="category" value={filters.category} onChange={updateFilter}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={filters.status} onChange={updateFilter}>
              <option value="all">All statuses</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Date reported
            <select name="timeframe" value={filters.timeframe} onChange={updateFilter}>
              <option value="all">Any time</option>
              <option value="7">Past 7 days</option>
              <option value="30">Past 30 days</option>
            </select>
          </label>
          <label>
            Sort by
            <select name="sort" value={filters.sort} onChange={updateFilter}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        <div className="filter-actions">
          <button className="primary-button" type="submit">
            <FaMagnifyingGlass aria-hidden="true" />
            Search reports
          </button>
          <button className="filter-reset" type="button" onClick={clearFilters}>
            <FaRotateLeft aria-hidden="true" />
            Clear filters
          </button>
        </div>
      </form>

      <section className="search-results" aria-live="polite" aria-labelledby="results-title">
        <div className="results-heading">
          <div>
            <h2 id="results-title">Item reports</h2>
            <p>{filters.q ? `Results matching “${filters.q}”` : 'All lost and found reports'}</p>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="search-results-grid">
            {filteredItems.map((item) => (
              <Link className="search-result-card" to={`/items/${item.id}`} key={item.id}>
                <div className={`item-visual item-visual-${item.reportType}`} aria-hidden="true">
                  <FaBoxOpen />
                </div>
                <div className="result-card-content">
                  <div className="result-card-labels">
                    <span className={`report-type report-type-${item.reportType}`}>
                      {item.reportType === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <dl className="result-card-meta">
                    <div>
                      <dt><FaLocationDot aria-hidden="true" /><span className="sr-only">Location</span></dt>
                      <dd>{item.location}</dd>
                    </div>
                    <div>
                      <dt><FaCalendar aria-hidden="true" /><span className="sr-only">Reported</span></dt>
                      <dd>{formatReportedDate(item.reportedAt)}</dd>
                    </div>
                  </dl>
                  <span className="view-details">View details <FaChevronRight aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="search-empty-state">
            <FaMagnifyingGlass aria-hidden="true" />
            <h3>No matching reports</h3>
            <p>Try a broader keyword or remove one or more filters.</p>
            <button className="secondary-button" type="button" onClick={clearFilters}>Clear all filters</button>
          </div>
        )}
      </section>
    </div>
  )
}

export default SearchItems
