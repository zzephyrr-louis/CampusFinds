import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaMagnifyingGlass, FaRotateLeft } from 'react-icons/fa6'
import SearchResultCard from '../components/search/SearchResultCard'
import PageHeader from '../components/ui/PageHeader'
import api from '../services/api'
import { asArray, toItemView } from '../services/mappers'

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

function SearchItems() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = filtersFromParams(searchParams)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadItems = useCallback(async ({ signal } = {}) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.get('/items', { signal })
      setItems(asArray(response.data, 'items').map(toItemView))
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.response?.data?.message || 'Unable to load item reports.')
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Search Items | CampusFind'
    const controller = new AbortController()
    const loadTimer = window.setTimeout(() => loadItems({ signal: controller.signal }), 0)
    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [loadItems])

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))].sort(),
    [items],
  )
  const statuses = useMemo(
    () => [...new Set(items.map((item) => item.status).filter(Boolean))].sort(),
    [items],
  )

  const filteredItems = useMemo(() => {
    const query = filters.q.trim().toLowerCase()
    const now = new Date()

    return items
      .filter((item) => {
        const searchableText = [item.name, item.category, item.location, item.description]
          .join(' ')
          .toLowerCase()
        const reportedDate = new Date(item.reportedAt)
        const daysOld = Number.isNaN(reportedDate.getTime())
          ? Number.POSITIVE_INFINITY
          : (now - reportedDate) / 86400000

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
  }, [filters, items])

  function updateFilter(event) {
    const { name, value } = event.target
    const nextFilters = { ...filters, [name]: value }
    const nextParams = {}

    Object.entries(nextFilters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue !== defaultFilters[key]) nextParams[key] = filterValue
    })

    setSearchParams(nextParams, { replace: name === 'q' })
  }

  function clearFilters() {
    setSearchParams({})
  }

  return (
    <div className="search-page">
      <PageHeader
        eyebrow="Campus lost & found"
        title="Search items"
        description="Browse recent reports and narrow the list using any details you remember."
        aside={(
          <div className="page-metric" aria-label={`${filteredItems.length} reports found`}>
            <strong>{filteredItems.length}</strong>
            <span>{filteredItems.length === 1 ? 'report found' : 'reports found'}</span>
          </div>
        )}
      />

      <form className="search-filter-card" role="search" onSubmit={(event) => event.preventDefault()}>
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
            <FaMagnifyingGlass aria-hidden="true" /> Search reports
          </button>
          <button className="filter-reset" type="button" onClick={clearFilters}>
            <FaRotateLeft aria-hidden="true" /> Clear filters
          </button>
        </div>
      </form>

      <section className="search-results" aria-live="polite" aria-labelledby="results-title">
        <div className="results-heading">
          <div>
            <h2 id="results-title">Item reports</h2>
            <p>{filters.q ? `Results matching "${filters.q}"` : 'All lost and found reports'}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="page-loading-state" role="status">Loading item reports&hellip;</div>
        ) : error ? (
          <div className="page-error-state" role="alert">
            <p>{error}</p>
            <button className="secondary-button" type="button" onClick={() => loadItems()}>Try again</button>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="search-results-grid">
            {filteredItems.map((item) => <SearchResultCard item={item} key={item.id} />)}
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
