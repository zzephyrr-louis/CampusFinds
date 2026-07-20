import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { asArray, toClaimView, toItemView } from '../services/mappers'
import SubmitClaimCard from '../components/claims/SubmitClaimCard'
import ClaimHistoryCard from '../components/claims/ClaimHistoryCard'
import PageHeader from '../components/ui/PageHeader'
import './Claims.css'

function toClaimableItem(item) {
  const view = toItemView(item)
  return {
    item_id: view.itemId,
    item_name: view.name,
    category: view.category,
    status: view.status,
    reporter_id: view.reporterId,
  }
}

function Claims() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedItemId = searchParams.get('itemId') || ''
  const requestedClaimId = searchParams.get('claimId') || ''
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showHistory, setShowHistory] = useState(Boolean(requestedClaimId))
  const [formData, setFormData] = useState({ item_id: '', reason: '' })
  const [formErrors, setFormErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proofImage, setProofImage] = useState(null)
  const [proofImagePreview, setProofImagePreview] = useState('')
  const [proofInputKey, setProofInputKey] = useState(0)
  const [imageError, setImageError] = useState('')

  const loadClaimsData = useCallback(async ({ signal } = {}) => {
    setIsLoadingItems(true)
    setIsLoadingClaims(true)
    setLoadError('')

    const [itemsResult, claimsResult] = await Promise.allSettled([
      api.get('/items/claimable', { signal }),
      api.get('/claims/mine', { signal }),
    ])

    if (signal?.aborted) return
    const messages = []

    let availableItems = []
    let claimRecords = []

    if (itemsResult.status === 'fulfilled') {
      availableItems = asArray(itemsResult.value.data, 'items').map(toClaimableItem)
    } else if (itemsResult.reason.name !== 'AbortError') {
      messages.push(itemsResult.reason.response?.data?.message || 'Unable to load claimable items.')
    }

    if (claimsResult.status === 'fulfilled') {
      claimRecords = asArray(claimsResult.value.data, 'claims').map(toClaimView)
    } else if (claimsResult.reason.name !== 'AbortError') {
      messages.push(claimsResult.reason.response?.data?.message || 'Unable to load your claim history.')
    }

    const claimedItemIds = new Set(claimRecords.map((claim) => String(claim.item?.item_id)))
    availableItems = availableItems.filter((item) =>
      String(item.reporter_id) !== String(user?.user_id) &&
      !claimedItemIds.has(String(item.item_id)),
    )
    setItems(availableItems)
    setClaims(claimRecords)

    if (requestedItemId) {
      const requestedItem = availableItems.find(
        (item) => String(item.item_id) === String(requestedItemId),
      )
      if (requestedItem) {
        setFormData((current) => ({ ...current, item_id: String(requestedItem.item_id) }))
      }
    }

    setLoadError(messages.join(' '))
    setIsLoadingItems(false)
    setIsLoadingClaims(false)
  }, [requestedItemId, user?.user_id])

  useEffect(() => {
    document.title = 'My Claims | CampusFind'
    const controller = new AbortController()
    const loadTimer = window.setTimeout(() => loadClaimsData({ signal: controller.signal }), 0)
    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [loadClaimsData])

  useEffect(() => {
    return () => {
      if (proofImagePreview) URL.revokeObjectURL(proofImagePreview)
    }
  }, [proofImagePreview])

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
    if (proofImagePreview) URL.revokeObjectURL(proofImagePreview)

    if (!file) {
      setProofImage(null)
      setProofImagePreview('')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Please upload a JPG, PNG, or WEBP image.')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be 5MB or smaller.')
      event.target.value = ''
      return
    }

    setProofImage(file)
    setProofImagePreview(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    if (proofImagePreview) URL.revokeObjectURL(proofImagePreview)
    setProofImage(null)
    setProofImagePreview('')
    setImageError('')
    setProofInputKey((current) => current + 1)
  }

  function validate() {
    const nextErrors = {}
    if (!formData.item_id) nextErrors.item_id = 'Select which item you are claiming.'
    if (formData.reason.trim().length < 10) {
      nextErrors.reason = 'Give at least 10 characters of identifying detail so admins can verify your claim.'
    }
    return nextErrors
  }

  function closeHistory() {
    setShowHistory(false)
    if (requestedClaimId) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('claimId')
      setSearchParams(nextParams, { replace: true })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setFormErrors(nextErrors)
    setServerMessage('')
    setSuccessMessage('')
    if (Object.keys(nextErrors).length > 0) return

    try {
      setIsSubmitting(true)
      let proofImageUrl = null
      if (proofImage) {
        const uploadResponse = await api.uploadFile(proofImage, 'claim-proofs')
        proofImageUrl = uploadResponse.data?.url || uploadResponse.data?.file_url || null
        if (!proofImageUrl) throw new Error('The proof upload did not return a file URL.')
      }

      const response = await api.post('/claims', {
        item_id: Number.isNaN(Number(formData.item_id)) ? formData.item_id : Number(formData.item_id),
        reason: formData.reason.trim(),
        proof_image_url: proofImageUrl,
      })
      const newClaim = toClaimView(response.data?.claim || response.data)

      setClaims((current) => [newClaim, ...current.filter(
        (claim) => String(claim.claim_id) !== String(newClaim.claim_id),
      )])
      setItems((current) => current.filter(
        (item) => String(item.item_id) !== String(formData.item_id),
      ))
      setSuccessMessage('Your claim was submitted. An admin will review it soon.')
      setFormData({ item_id: '', reason: '' })
      handleRemoveImage()
    } catch (requestError) {
      setServerMessage(requestError.response?.data?.message || 'Unable to submit your claim. Please try again.')
      setFormErrors(requestError.response?.data?.errors || {})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="claims-page">
      <PageHeader
        eyebrow="Ownership verification"
        title="My claims"
        description="Submit proof for an item you recognize, then follow its review status in your claim history."
      />

      {loadError && (
        <div className="page-error-state claims-page-alert" role="alert">
          <p>{loadError}</p>
          <button className="secondary-button" type="button" onClick={() => loadClaimsData()}>Try again</button>
        </div>
      )}

      <div className="claims-body">
        {showHistory || Boolean(requestedClaimId) ? (
          <ClaimHistoryCard
            claims={claims}
            isLoadingClaims={isLoadingClaims}
            highlightedClaimId={requestedClaimId}
            onBack={closeHistory}
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
            proofInputKey={proofInputKey}
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
