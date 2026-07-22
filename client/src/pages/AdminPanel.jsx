import { useCallback, useEffect, useState } from 'react'
import {
  FaBox,
  FaCircleCheck,
  FaClipboardCheck,
  FaRotate,
  FaTriangleExclamation,
  FaUsers,
  FaXmark,
} from 'react-icons/fa6'
import { useAuth } from '../context/useAuth'
import AdminClaimsTable from '../components/adminpanel/AdminClaimsTable'
import AdminTable from '../components/adminpanel/AdminTable'
import MatchLogs from '../components/adminpanel/MatchLogs'
import StatisticsCards from '../components/adminpanel/StatisticsCards'
import PageHeader from '../components/ui/PageHeader'
import api from '../services/api'
import { asArray, toClaimView, toUserView } from '../services/mappers'
import './AdminPanel.css'

function numericValue(object, ...keys) {
  const value = keys.map((key) => object?.[key]).find((candidate) => candidate !== undefined)
  return Number(value) || 0
}

function AdminPanel() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [claims, setClaims] = useState([])
  const [summary, setSummary] = useState({})
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [review, setReview] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  const [busyClaimId, setBusyClaimId] = useState(null)

  const loadAdminData = useCallback(async ({ signal } = {}) => {
    setIsLoading(true)
    setLoadError('')
    const [usersResult, summaryResult, claimsResult] = await Promise.allSettled([
      api.get('/users', { signal }),
      api.get('/dashboard/summary', { signal }),
      api.get('/claims', { signal }),
    ])
    if (signal?.aborted) return

    const errors = []
    if (usersResult.status === 'fulfilled') {
      setUsers(asArray(usersResult.value.data, 'users').map(toUserView))
    } else if (usersResult.reason.name !== 'AbortError') {
      errors.push(usersResult.reason.response?.data?.message || 'Unable to load users.')
    }

    if (summaryResult.status === 'fulfilled') {
      const nextSummary = summaryResult.value.data?.summary || summaryResult.value.data || {}
      setSummary(nextSummary)
      setLogs(asArray(nextSummary.recent_activity || nextSummary.activity))
    } else if (summaryResult.reason.name !== 'AbortError') {
      errors.push(summaryResult.reason.response?.data?.message || 'Unable to load dashboard totals.')
    }

    if (claimsResult.status === 'fulfilled') {
      setClaims(asArray(claimsResult.value.data, 'claims').map(toClaimView))
    } else if (claimsResult.reason.name !== 'AbortError') {
      errors.push(claimsResult.reason.response?.data?.message || 'Unable to load claims.')
    }

    setLoadError(errors.join(' '))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Admin panel | CampusFind'
    const controller = new AbortController()
    const loadTimer = window.setTimeout(() => loadAdminData({ signal: controller.signal }), 0)
    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [loadAdminData])

  useEffect(() => {
    if (!editingUser && !deleteCandidate && !review) return undefined
    function handleEscape(event) {
      if (event.key !== 'Escape') return
      setEditingUser(null)
      setDeleteCandidate(null)
      setReview(null)
      setActionError('')
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [deleteCandidate, editingUser, review])

  const stats = [
    { id: 'users', title: 'Total users', value: numericValue(summary, 'total_users') || users.length, icon: <FaUsers />, tone: 'blue' },
    { id: 'listings', title: 'Active listings', value: numericValue(summary, 'active_listings') || numericValue(summary, 'total_lost_items') + numericValue(summary, 'total_found_items'), icon: <FaBox />, tone: 'purple' },
    { id: 'pending', title: 'Pending claims', value: numericValue(summary, 'total_pending_claims', 'pending_claims') || claims.filter((claim) => claim.status.toLowerCase() === 'pending').length, icon: <FaClipboardCheck />, tone: 'amber' },
    { id: 'approved', title: 'Approved claims', value: numericValue(summary, 'total_approved_claims', 'approved_claims'), icon: <FaCircleCheck />, tone: 'green' },
  ]

  function openEditModal(userId) {
    const selectedUser = users.find((entry) => String(entry.id) === String(userId))
    if (!selectedUser) return
    setFeedback('')
    setActionError('')
    setEditingUser({ ...selectedUser })
  }

  async function saveUser(event) {
    event.preventDefault()
    if (!editingUser) return
    try {
      setIsSavingUser(true)
      setActionError('')
      const response = await api.put(`/users/${editingUser.id}`, {
        student_id: editingUser.student_id.trim(),
        fullname: editingUser.name.trim(),
        email: editingUser.email.trim().toLowerCase(),
        role: editingUser.role,
        status: editingUser.status.toUpperCase(),
      })
      const updated = toUserView(response.data?.user || response.data || editingUser)
      setUsers((current) => current.map((entry) => String(entry.id) === String(updated.id) ? updated : entry))
      setFeedback(`${updated.name}'s account was updated.`)
      setEditingUser(null)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to update this account.')
    } finally {
      setIsSavingUser(false)
    }
  }

  async function confirmDelete() {
    if (!deleteCandidate) return
    try {
      setIsDeletingUser(true)
      setActionError('')
      await api.delete(`/users/${deleteCandidate.id}`)
      setUsers((current) => current.filter((entry) => String(entry.id) !== String(deleteCandidate.id)))
      setFeedback(`${deleteCandidate.name}'s account was deleted.`)
      setDeleteCandidate(null)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to delete this account.')
    } finally {
      setIsDeletingUser(false)
    }
  }

  function openClaimReview(claim, decision) {
    setFeedback('')
    setActionError('')
    setReview({ claim, decision, remarks: '' })
  }

  async function submitClaimReview(event) {
    event.preventDefault()
    if (!review) return
    if (review.decision === 'reject' && !review.remarks.trim()) {
      setActionError('Add a short reason before rejecting this claim.')
      return
    }

    const claimId = review.claim.claim_id
    try {
      setBusyClaimId(claimId)
      setActionError('')
      await api.put(`/claims/${claimId}/${review.decision}`, {
        moderator_remarks: review.remarks.trim() || null,
      })
      setReview(null)
      await loadAdminData()
      setFeedback(`The claim was ${review.decision === 'approve' ? 'approved' : 'rejected'}.`)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || `Unable to ${review.decision} this claim.`)
    } finally {
      setBusyClaimId(null)
    }
  }

  return (
    <section className="admin-panel-page" aria-labelledby="admin-panel-title">
      <PageHeader
        eyebrow="CampusFind operations"
        title="Admin panel"
        titleId="admin-panel-title"
        description="Review account access, ownership claims, and current platform activity."
        aside={<button className="secondary-button" type="button" onClick={() => loadAdminData()} disabled={isLoading}><FaRotate aria-hidden="true" /> Refresh</button>}
      />

      {feedback && <p className="admin-feedback" role="status">{feedback}</p>}
      {loadError && <div className="page-error-state" role="alert"><p>{loadError}</p><button className="secondary-button" type="button" onClick={() => loadAdminData()}>Try again</button></div>}

      {isLoading ? (
        <div className="page-loading-state" role="status">Loading admin records&hellip;</div>
      ) : (
        <>
          <StatisticsCards stats={stats} />
          <div className="admin-panel-tables">
            <div className="admin-main-column">
              <AdminClaimsTable claims={claims} busyClaimId={busyClaimId} onReview={openClaimReview} />
              <AdminTable
                users={users}
                currentUserId={currentUser?.user_id}
                onEdit={openEditModal}
                onDelete={(userId) => setDeleteCandidate(users.find((entry) => String(entry.id) === String(userId)) || null)}
              />
            </div>
            <MatchLogs logs={logs} />
          </div>
        </>
      )}

      {editingUser && (
        <div className="admin-modal-overlay" onMouseDown={() => setEditingUser(null)}>
          <form className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title" onSubmit={saveUser} onMouseDown={(event) => event.stopPropagation()}>
            <header className="admin-modal-header">
              <div><p className="eyebrow">Account access</p><h2 id="edit-user-title">Edit user</h2></div>
              <button className="admin-modal-close" type="button" onClick={() => setEditingUser(null)} aria-label="Close edit user dialog"><FaXmark aria-hidden="true" /></button>
            </header>
            {actionError && <p className="form-alert" role="alert">{actionError}</p>}
            <div className="admin-modal-body">
              <label className="admin-field"><span>Student ID</span><input value={editingUser.student_id} readOnly /></label>
              <label className="admin-field"><span>Name</span><input type="text" value={editingUser.name} onChange={(event) => setEditingUser({ ...editingUser, name: event.target.value })} required /></label>
              <label className="admin-field"><span>Email</span><input type="email" value={editingUser.email} onChange={(event) => setEditingUser({ ...editingUser, email: event.target.value })} required /></label>
              <label className="admin-field"><span>Role</span><select value={editingUser.role} onChange={(event) => setEditingUser({ ...editingUser, role: event.target.value })}><option value="student">Student</option><option value="admin">Admin</option></select></label>
              <label className="admin-field"><span>Status</span><select value={editingUser.status} onChange={(event) => setEditingUser({ ...editingUser, status: event.target.value })}><option value="Active">Active</option><option value="Suspended">Suspended</option></select></label>
            </div>
            <footer className="admin-modal-footer"><button className="secondary-button" type="button" onClick={() => setEditingUser(null)}>Cancel</button><button className="primary-button" type="submit" disabled={isSavingUser}>{isSavingUser ? 'Saving…' : 'Save changes'}</button></footer>
          </form>
        </div>
      )}

      {deleteCandidate && (
        <div className="admin-modal-overlay" onMouseDown={() => setDeleteCandidate(null)}>
          <section className="admin-modal admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="admin-confirm-icon" aria-hidden="true"><FaTriangleExclamation /></div>
            <h2 id="delete-user-title">Delete this account?</h2>
            <p>{deleteCandidate.name} will be permanently removed. Reports or claims linked to the account may prevent deletion.</p>
            {actionError && <p className="form-alert" role="alert">{actionError}</p>}
            <footer className="admin-modal-footer"><button className="secondary-button" type="button" onClick={() => setDeleteCandidate(null)} disabled={isDeletingUser}>Cancel</button><button className="danger-button" type="button" onClick={confirmDelete} disabled={isDeletingUser}>{isDeletingUser ? 'Deleting…' : 'Delete account'}</button></footer>
          </section>
        </div>
      )}

      {review && (
        <div className="admin-modal-overlay" onMouseDown={() => setReview(null)}>
          <form className="admin-modal admin-review-modal" role="dialog" aria-modal="true" aria-labelledby="review-claim-title" onSubmit={submitClaimReview} onMouseDown={(event) => event.stopPropagation()}>
            <header className="admin-modal-header"><div><p className="eyebrow">Ownership verification</p><h2 id="review-claim-title">{review.decision === 'approve' ? 'Approve' : 'Reject'} claim</h2></div><button className="admin-modal-close" type="button" onClick={() => setReview(null)} aria-label="Close claim review"><FaXmark aria-hidden="true" /></button></header>
            {actionError && <p className="form-alert" role="alert">{actionError}</p>}
            <div className="admin-review-summary"><strong>{review.claim.item?.item_name || 'Unknown item'}</strong><p>{review.claim.reason || 'No ownership details provided.'}</p>{review.claim.proof_image_url && <a className="text-link" href={review.claim.proof_image_url} target="_blank" rel="noreferrer">Open image proof</a>}</div>
            <div className="admin-modal-body"><label className="admin-field admin-field-wide"><span>Moderator remarks {review.decision === 'reject' && '(required)'}</span><textarea rows="4" value={review.remarks} onChange={(event) => setReview({ ...review, remarks: event.target.value })} required={review.decision === 'reject'} /></label></div>
            <footer className="admin-modal-footer"><button className="secondary-button" type="button" onClick={() => setReview(null)}>Cancel</button><button className={review.decision === 'approve' ? 'primary-button' : 'danger-button'} type="submit" disabled={Boolean(busyClaimId)}>{busyClaimId ? 'Saving…' : review.decision === 'approve' ? 'Approve claim' : 'Reject claim'}</button></footer>
          </form>
        </div>
      )}
    </section>
  )
}

export default AdminPanel
