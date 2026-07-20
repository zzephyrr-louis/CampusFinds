import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { claimableItems as mockClaimableItems, claimHistory as mockClaimHistory } from '../data/claimData'
import SubmitClaimCard from '../components/claims/SubmitClaimCard'
import ClaimHistoryCard from '../components/claims/ClaimHistoryCard'
import './Claims.css'

function Claims() {
  useAuth()

  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const [formData, setFormData] = useState({ item_id: '', reason: '' })
  const [formErrors, setFormErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [proofImage, setProofImage] = useState(null)
  const [proofImagePreview, setProofImagePreview] = useState('')
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    document.title = 'My Claims | CampusFind'
    loadClaimableItems()
    loadClaimHistory()

    // Clean up the object URL when the component unmounts.
    return () => {
      if (proofImagePreview) URL.revokeObjectURL(proofImagePreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadClaimableItems() {
    try {
      setIsLoadingItems(true)
      const response = await api.get('/items/claimable')
      const data = Array.isArray(response.data) ? response.data : []
      setItems(data.length > 0 ? data : mockClaimableItems)
    } catch (error) {
      // Fall back to local mock data so the form/page still works
      // (useful for local dev/testing before the backend route is live).
      setItems(mockClaimableItems)
      setLoadError(error.response?.data?.message || 'Unable to load claimable items — showing sample data.')
    } finally {
      setIsLoadingItems(false)
    }
  }

  async function loadClaimHistory() {
    try {
      setIsLoadingClaims(true)
      const response = await api.get('/claims/mine')
      const data = Array.isArray(response.data) ? response.data : []
      setClaims(data.length > 0 ? data : mockClaimHistory)
    } catch (error) {
      // Same fallback strategy for claim history.
      setClaims(mockClaimHistory)
      setLoadError(error.response?.data?.message || 'Unable to load your claim history — showing sample data.')
    } finally {
      setIsLoadingClaims(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
    setServerMessage('')
    setSuccessMessage('')
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    setImageError('')

    if (!file) {
      setProofImage(null)
      setProofImagePreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPG, PNG, or WEBP).')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be smaller than 5MB.')
      event.target.value = ''
      return
    }

    setProofImage(file)
    setProofImagePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  function handleRemoveImage() {
    if (proofImagePreview) URL.revokeObjectURL(proofImagePreview)
    setProofImage(null)
    setProofImagePreview('')
    setImageError('')
  }

  function validate() {
    const nextErrors = {}
    if (!formData.item_id) nextErrors.item_id = 'Select which item you\u2019re claiming.'
    if (!formData.reason.trim() || formData.reason.trim().length < 10) {
      nextErrors.reason = 'Give a bit more detail (at least 10 characters) so admins can verify your claim.'
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setFormErrors(nextErrors)
    setServerMessage('')
    setSuccessMessage('')

    if (Object.keys(nextErrors).length > 0) return

    const claimedItem = items.find((item) => String(item.item_id) === String(formData.item_id))

    try {
      setIsSubmitting(true)

      let response
      if (proofImage) {
        const payload = new FormData()
        payload.append('item_id', Number(formData.item_id))
        payload.append('reason', formData.reason.trim())
        payload.append('proof_image', proofImage)
        response = await api.post('/claims', payload)
    } else {
        response = await api.post('/claims', {
            item_id: Number(formData.item_id),
            reason: formData.reason.trim(),
        })
    }

      // Use whatever the server sends back if it looks like a claim record;
      // otherwise build one locally so the UI updates immediately either way.
      const returned = response?.data?.claim || response?.data
      const newClaim =
        returned && returned.claim_id
          ? returned
          : {
              claim_id: `local-${Date.now()}`,
              item: claimedItem
                ? { item_id: claimedItem.item_id, item_name: claimedItem.item_name, category: claimedItem.category }
                : null,
              reason: formData.reason.trim(),
              status: 'Pending',
              created_at: new Date().toISOString(),
              proof_image_url: proofImagePreview || null,
            }

      // Real-time update: prepend the new claim and drop the item from the
      // claimable list right away, without waiting on a refetch.
      setClaims((current) => [newClaim, ...current])
      setItems((current) => current.filter((item) => String(item.item_id) !== String(formData.item_id)))

      setSuccessMessage('Your claim was submitted. An admin will review it soon.')
      setFormData({ item_id: '', reason: '' })
      setProofImage(null)
      setProofImagePreview('')
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to submit your claim. Please try again.')
      setFormErrors(error.response?.data?.errors || {})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="claims-page">
      <header className="claims-header">
        <h1>My Claims</h1>
      </header>

      {loadError && (
        <p className="form-alert claims-page-alert" role="alert">
          {loadError}
        </p>
      )}

      <div className="claims-body">
        {showHistory ? (
          <ClaimHistoryCard
            claims={claims}
            isLoadingClaims={isLoadingClaims}
            onBack={() => setShowHistory(false)}
          />
        ) : (
          <SubmitClaimCard
            items={items}
            isLoadingItems={isLoadingItems}
            formData={formData}
            formErrors={formErrors}
            serverMessage={serverMessage}
            successMessage={successMessage}
            isSubmitting={isSubmitting}
            proofImage={proofImage}
            proofImagePreview={proofImagePreview}
            imageError={imageError}
            onChange={handleChange}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
            onSubmit={handleSubmit}
            onShowHistory={() => setShowHistory(true)}
          />
        )}
      </div>
    </div>
  )
}

export default Claims
