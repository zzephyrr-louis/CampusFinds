import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCalendar,
  FaCircleInfo,
  FaClock,
  FaLocationDot,
  FaPen,
  FaShieldHalved,
  FaTag,
  FaTrashCan,
  FaUser,
} from 'react-icons/fa6'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { toItemView } from '../services/mappers'

const categories = [
  'Accessory', 'Bag', 'Book', 'Clothing', 'Container', 'Electronics',
  'Identification', 'Keys', 'School supplies', 'Wallet', 'Other',
]

function formatDate(value, includeTime = true) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
    ...(includeTime ? { timeStyle: 'short' } : {}),
  }).format(date)
}

function editValuesFromItem(item) {
  return {
    item_name: item.name,
    category: item.category,
    event_date: item.eventDate,
    location: item.location,
    description: item.description,
    identifying_features:
      item.raw?.identifying_features ?? item.raw?.identifyingFeatures ?? '',
    condition: item.condition,
    storage_location: item.storageLocation,
    status: String(item.raw?.status || item.status).toUpperCase().replace(/[- ]/g, '_'),
  }
}

function ItemDetails() {
  const { itemId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionError, setActionError] = useState('')

  const loadItem = useCallback(async ({ signal } = {}) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.get(`/items/${encodeURIComponent(itemId)}`, { signal })
      setItem(toItemView(response.data?.item || response.data))
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setItem(null)
        setError(
          requestError.response?.status === 404
            ? 'This report does not exist or is no longer available.'
            : requestError.response?.data?.message || 'Unable to load this item report.',
        )
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    const controller = new AbortController()
    const loadTimer = window.setTimeout(() => loadItem({ signal: controller.signal }), 0)
    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [loadItem])

  useEffect(() => {
    document.title = item ? `${item.name} | CampusFind` : 'Item Details | CampusFind'
  }, [item])

  function startEditing() {
    setEditValues(editValuesFromItem(item))
    setActionError('')
    setIsEditing(true)
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditValues((current) => ({ ...current, [name]: value }))
    setActionError('')
  }

  async function saveChanges(event) {
    event.preventDefault()
    const isFoundItem = item.reportType === 'found'
    if (
      !editValues.item_name.trim() ||
      !editValues.category ||
      !editValues.event_date ||
      !editValues.location.trim() ||
      editValues.description.trim().length < 15 ||
      (isFoundItem && (!editValues.condition || !editValues.storage_location.trim()))
    ) {
      setActionError(
        isFoundItem
          ? 'Complete every required field, including condition and storage location.'
          : 'Complete every required field and provide a description of at least 15 characters.',
      )
      return
    }

    try {
      setIsSaving(true)
      setActionError('')
      const originalStatus = String(item.raw?.status || item.status).toUpperCase().replace(/[- ]/g, '_')
      const response = await api.put(`/items/${item.itemId}`, {
        item_name: editValues.item_name.trim(),
        category: editValues.category,
        event_date: editValues.event_date,
        location: editValues.location.trim(),
        description: editValues.description.trim(),
        identifying_features: editValues.identifying_features.trim() || null,
        condition: isFoundItem ? editValues.condition : null,
        storage_location: isFoundItem ? editValues.storage_location.trim() : null,
        report_type: item.reportType.toUpperCase(),
        related_item_id: item.relatedItemId || null,
        image_url: item.raw?.image_url || item.raw?.image || null,
      })
      let savedItem = response.data?.item || response.data
      if (editValues.status !== originalStatus) {
        const statusResponse = await api.put(`/items/${item.itemId}/status`, {
          status: editValues.status,
        })
        savedItem = statusResponse.data?.item || statusResponse.data
      }
      setItem(toItemView(savedItem))
      setIsEditing(false)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to update this report.')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteItem() {
    try {
      setIsDeleting(true)
      setActionError('')
      await api.delete(`/items/${item.itemId}`)
      navigate('/search-items', { replace: true })
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to delete this report.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return <div className="page-loading-state" role="status">Loading item report&hellip;</div>
  }

  if (!item) {
    return (
      <section className="item-not-found">
        <div className="placeholder-icon" aria-hidden="true"><FaBoxOpen /></div>
        <p className="eyebrow">Item unavailable</p>
        <h1>We could not find that report</h1>
        <p>{error || 'It may have been removed, resolved, or the link may be incorrect.'}</p>
        <div className="report-success-actions">
          {error && <button className="secondary-button" type="button" onClick={() => loadItem()}>Try again</button>}
          <Link className="primary-button" to="/search-items">
            <FaArrowLeft aria-hidden="true" /> Back to search
          </Link>
        </div>
      </section>
    )
  }

  const isFound = item.reportType === 'found'
  const isAdmin = String(user?.role).toLowerCase() === 'admin'
  const isOwner = item.reporterId !== null && String(item.reporterId) === String(user?.user_id)
  const canManage = Boolean(item.raw?.can_manage ?? item.raw?.can_edit ?? (isAdmin || isOwner))
  const isClaimable = isFound && ['unclaimed', 'possible match'].includes(item.status.toLowerCase())
  const statusOptions = isFound
    ? ['UNCLAIMED', 'POSSIBLE_MATCH', 'CLAIMED', 'RESOLVED']
    : ['OPEN', 'POSSIBLE_MATCH', 'RESOLVED']

  return (
    <div className="item-details-page">
      <div className="details-topbar">
        <Link className="details-back-link" to="/search-items">
          <FaArrowLeft aria-hidden="true" /> Back to search results
        </Link>
        {canManage && (
          <div className="details-owner-actions">
            <button className="secondary-button" type="button" onClick={startEditing} disabled={isEditing}>
              <FaPen aria-hidden="true" /> Edit report
            </button>
            <button className="danger-button" type="button" onClick={() => setShowDeleteConfirm(true)}>
              <FaTrashCan aria-hidden="true" /> Delete
            </button>
          </div>
        )}
      </div>

      {actionError && <p className="form-alert" role="alert">{actionError}</p>}

      {showDeleteConfirm && (
        <section className="details-delete-confirm" role="alertdialog" aria-labelledby="delete-report-title">
          <div>
            <h2 id="delete-report-title">Delete this report?</h2>
            <p>This permanently removes the report and cannot be undone.</p>
          </div>
          <div>
            <button className="secondary-button" type="button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</button>
            <button className="danger-button" type="button" onClick={deleteItem} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete report'}
            </button>
          </div>
        </section>
      )}

      {isEditing && editValues && (
        <form className="details-edit-card" onSubmit={saveChanges}>
          <header>
            <div>
              <p className="eyebrow">Report management</p>
              <h2>Edit item report</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
          </header>
          <div className="details-edit-grid">
            <label><span>Item name</span><input name="item_name" value={editValues.item_name} onChange={handleEditChange} required /></label>
            <label>
              <span>Category</span>
              <select name="category" value={editValues.category} onChange={handleEditChange}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label><span>Event date</span><input type="date" name="event_date" value={editValues.event_date || ''} onChange={handleEditChange} required /></label>
            <label><span>Location</span><input name="location" value={editValues.location} onChange={handleEditChange} required /></label>
            <label>
              <span>Status</span>
              <select name="status" value={editValues.status} onChange={handleEditChange}>
                {statusOptions.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            {isFound && <label><span>Condition</span><input name="condition" value={editValues.condition} onChange={handleEditChange} /></label>}
            {isFound && <label className="details-edit-wide"><span>Storage location</span><input name="storage_location" value={editValues.storage_location} onChange={handleEditChange} /></label>}
            <label className="details-edit-wide"><span>Description</span><textarea rows="4" name="description" value={editValues.description} onChange={handleEditChange} required /></label>
            <label className="details-edit-wide"><span>Identifying details</span><textarea rows="3" name="identifying_features" value={editValues.identifying_features} onChange={handleEditChange} /></label>
          </div>
          <footer><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button></footer>
        </form>
      )}

      <article className="item-details-card">
        <div className={`details-visual item-visual-${item.reportType}${item.imageUrl ? ' has-image' : ''}`}>
          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <FaBoxOpen />}
          <span>{isFound ? 'Found item' : 'Lost item'}</span>
        </div>

        <div className="details-summary">
          <div className="result-card-labels">
            <span className={`report-type report-type-${item.reportType}`}>{isFound ? 'Found' : 'Lost'}</span>
            <StatusBadge status={item.status} />
          </div>
          <p className="details-reference">Report #{String(item.id).toUpperCase()}</p>
          <h1>{item.name}</h1>
          <p className="details-description">{item.description}</p>

          <dl className="details-facts">
            <div><dt><FaTag aria-hidden="true" /> Category</dt><dd>{item.category}</dd></div>
            <div><dt><FaLocationDot aria-hidden="true" /> {isFound ? 'Found at' : 'Last seen at'}</dt><dd>{item.location}</dd></div>
            {item.eventDate && <div><dt><FaCalendar aria-hidden="true" /> {isFound ? 'Date found' : 'Date last seen'}</dt><dd>{formatDate(`${item.eventDate}T00:00:00`, false)}</dd></div>}
            {isFound && item.condition && <div><dt><FaCircleInfo aria-hidden="true" /> Condition</dt><dd>{item.condition}</dd></div>}
            <div><dt><FaCalendar aria-hidden="true" /> Date reported</dt><dd>{formatDate(item.reportedAt)}</dd></div>
            <div><dt><FaUser aria-hidden="true" /> Reported by</dt><dd>{item.reportedBy}</dd></div>
            {item.relatedItemId && <div><dt><FaTag aria-hidden="true" /> Related lost report</dt><dd><Link to={`/items/${item.relatedItemId}`}>{item.relatedItemId}</Link></dd></div>}
          </dl>
        </div>
      </article>

      <div className="details-lower-grid">
        <div className="details-main-column">
          <section className="details-section">
            <div className="details-section-heading"><FaCircleInfo aria-hidden="true" /><div><h2>Identifying details</h2><p>Use these details to decide whether this could be your item.</p></div></div>
            <p className="identifying-copy">{item.identifyingFeatures}</p>
            {item.storageLocation && <div className="storage-note"><strong>Current storage location</strong><span>{item.storageLocation}</span></div>}
          </section>

          <section className="details-section">
            <div className="details-section-heading"><FaClock aria-hidden="true" /><div><h2>Report activity</h2><p>The latest public update for this report.</p></div></div>
            <ol className="item-timeline">
              <li><span aria-hidden="true" /><div><strong>Report submitted</strong><time dateTime={item.reportedAt}>{formatDate(item.reportedAt)}</time><p>The item was added to the CampusFind directory.</p></div></li>
              <li><span aria-hidden="true" /><div><strong>Status: {item.status}</strong><p>This is the latest status saved for the report.</p></div></li>
            </ol>
          </section>
        </div>

        <aside className="claim-panel">
          <div className="claim-panel-icon" aria-hidden="true"><FaShieldHalved /></div>
          <h2>{isFound ? 'Is this your item?' : 'Have you found this item?'}</h2>
          <p>{isFound ? (isClaimable ? 'Submit a claim with details that only the owner is likely to know.' : 'This item is no longer accepting ownership claims.') : 'Create a found-item report and mention this report reference so staff can compare them.'}</p>
          {(!isFound || isClaimable) && (
            <Link className="primary-button" to={isFound ? `/claims?itemId=${item.id}` : `/report-found?relatedItem=${item.id}`}>
              {isFound ? 'Start a claim' : 'Report that I found it'}
            </Link>
          )}
          <div className="safety-note"><FaShieldHalved aria-hidden="true" /><span>Meet only at an official campus handover point. Never post private proof publicly.</span></div>
        </aside>
      </div>
    </div>
  )
}

export default ItemDetails
