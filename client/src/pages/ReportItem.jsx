import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCircleCheck, FaImage, FaPaperPlane } from 'react-icons/fa6'
import api from '../services/api'
import { useAuth } from '../context/useAuth'
import './ReportItem.css'

const categories = ['Accessory', 'Bag', 'Book', 'Clothing', 'Container', 'Electronics', 'Identification', 'Keys', 'School supplies', 'Wallet', 'Other']

function initialValues(type) {
  return {
    item_name: '',
    category: '',
    event_date: new Date().toISOString().slice(0, 10),
    location: '',
    description: '',
    identifying_features: '',
    condition: '',
    storage_location: '',
    report_type: type,
  }
}

function ReportItem({ type }) {
  const isLost = type === 'lost'
  const { user } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(() => initialValues(type))
  const [errors, setErrors] = useState({})
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  const copy = useMemo(() => (
    isLost
      ? {
          title: 'Report a lost item',
          description: 'Share enough detail to help the campus community recognize what went missing.',
          locationLabel: 'Where was it last seen?',
          locationPlaceholder: 'e.g. Library, second floor',
          dateLabel: 'When did you last see it?',
          featuresHint: 'Include details that can help identify it, such as color, brand, markings, or what was inside.',
        }
      : {
          title: 'Report a found item',
          description: 'Record where you found the item and where its owner can safely collect it.',
          locationLabel: 'Where did you find it?',
          locationPlaceholder: 'e.g. Cafeteria, table near the window',
          dateLabel: 'When did you find it?',
          featuresHint: 'Avoid revealing all private identifying details. These can be used later to verify the owner.',
        }
  ), [isLost])

  useEffect(() => {
    document.title = `${isLost ? 'Report Lost Item' : 'Report Found Item'} | CampusFind`
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }
  }, [isLost, imagePreview])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    setImageError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file (JPG, PNG, or WEBP).')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be smaller than 5MB.')
      event.target.value = ''
      return
    }
    setImage(file)
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImage(null)
    setImagePreview('')
    setImageError('')
  }

  function validate() {
    const next = {}
    if (!values.item_name.trim()) next.item_name = 'Item name is required.'
    if (!values.category) next.category = 'Choose a category.'
    if (!values.event_date) next.event_date = 'Select the date.'
    if (!values.location.trim()) next.location = 'Location is required.'
    if (values.description.trim().length < 15) next.description = 'Add at least 15 characters so others can recognize the item.'
    if (!isLost && !values.condition) next.condition = 'Select the item condition.'
    if (!isLost && !values.storage_location.trim()) next.storage_location = 'Tell the owner where the item is being kept.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length) return

    try {
      setIsSubmitting(true)
      const payload = image ? new FormData() : { ...values }
      if (image) {
        Object.entries(values).forEach(([key, value]) => payload.append(key, value))
        payload.append('image', image)
      }
      const response = await api.post(`/items/${type}`, payload)
      const report = response.data?.item || response.data
      setSubmitted(report)
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Your report could not be submitted. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section className="report-success" aria-labelledby="report-success-title">
        <FaCircleCheck aria-hidden="true" />
        <p className="eyebrow">Report submitted</p>
        <h1 id="report-success-title">Thank you for helping CampusFind.</h1>
        <p>Your {isLost ? 'lost item' : 'found item'} report has been recorded. Its reference is <strong>{submitted.item_id || submitted.id}</strong>.</p>
        <div className="report-success-actions">
          <button className="primary-button" type="button" onClick={() => navigate('/search-items')}>
            Browse item reports
          </button>
          <button className="secondary-button" type="button" onClick={() => { setValues(initialValues(type)); setSubmitted(null) }}>
            Submit another report
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="report-page">
      <Link className="report-back-link" to="/dashboard"><FaArrowLeft aria-hidden="true" /> Back to dashboard</Link>
      <header className="report-heading">
        <div>
          <p className="eyebrow">Campus lost &amp; found</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className={`report-type-badge ${isLost ? 'lost' : 'found'}`}>{isLost ? 'Lost report' : 'Found report'}</div>
      </header>

      <form className="report-form-card" onSubmit={handleSubmit} noValidate>
        {submitError && <p className="form-alert" role="alert">{submitError}</p>}
        <div className="report-form-grid">
          <label className="report-field report-field-wide">
            <span>Item name <b aria-hidden="true">*</b></span>
            <input name="item_name" value={values.item_name} onChange={handleChange} placeholder="e.g. Black leather wallet" aria-invalid={Boolean(errors.item_name)} disabled={isSubmitting} />
            {errors.item_name && <small role="alert">{errors.item_name}</small>}
          </label>
          <label className="report-field">
            <span>Category <b aria-hidden="true">*</b></span>
            <select name="category" value={values.category} onChange={handleChange} aria-invalid={Boolean(errors.category)} disabled={isSubmitting}>
              <option value="">Select a category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errors.category && <small role="alert">{errors.category}</small>}
          </label>
          <label className="report-field">
            <span>{copy.dateLabel} <b aria-hidden="true">*</b></span>
            <input name="event_date" type="date" value={values.event_date} onChange={handleChange} aria-invalid={Boolean(errors.event_date)} disabled={isSubmitting} />
            {errors.event_date && <small role="alert">{errors.event_date}</small>}
          </label>
          <label className="report-field report-field-wide">
            <span>{copy.locationLabel} <b aria-hidden="true">*</b></span>
            <input name="location" value={values.location} onChange={handleChange} placeholder={copy.locationPlaceholder} aria-invalid={Boolean(errors.location)} disabled={isSubmitting} />
            {errors.location && <small role="alert">{errors.location}</small>}
          </label>
          {!isLost && <>
            <label className="report-field">
              <span>Item condition <b aria-hidden="true">*</b></span>
              <select name="condition" value={values.condition} onChange={handleChange} aria-invalid={Boolean(errors.condition)} disabled={isSubmitting}>
                <option value="">Select condition</option><option>Excellent</option><option>Good</option><option>Fair</option><option>Damaged</option>
              </select>
              {errors.condition && <small role="alert">{errors.condition}</small>}
            </label>
            <label className="report-field">
              <span>Where is it stored? <b aria-hidden="true">*</b></span>
              <input name="storage_location" value={values.storage_location} onChange={handleChange} placeholder="e.g. Student Affairs desk" aria-invalid={Boolean(errors.storage_location)} disabled={isSubmitting} />
              {errors.storage_location && <small role="alert">{errors.storage_location}</small>}
            </label>
          </>}
          <label className="report-field report-field-wide">
            <span>Description <b aria-hidden="true">*</b></span>
            <textarea name="description" rows="5" value={values.description} onChange={handleChange} placeholder="Describe the item, including its color, material, size, and any helpful context." aria-invalid={Boolean(errors.description)} disabled={isSubmitting} />
            {errors.description && <small role="alert">{errors.description}</small>}
          </label>
          <label className="report-field report-field-wide">
            <span>Identifying details {isLost ? '(optional)' : '(optional)'}</span>
            <textarea name="identifying_features" rows="3" value={values.identifying_features} onChange={handleChange} placeholder={copy.featuresHint} disabled={isSubmitting} />
          </label>
          <div className="report-field report-field-wide">
            <span>Photo (optional)</span>
            <label className="report-upload" htmlFor="report-image"><FaImage aria-hidden="true" /> Add a photo<input id="report-image" type="file" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} /></label>
            <p>JPG, PNG, or WEBP, up to 5MB.</p>
            {imageError && <small className="report-error" role="alert">{imageError}</small>}
            {image && <div className="report-image-preview"><img src={imagePreview} alt="Selected item preview" /><div><strong>{image.name}</strong><button type="button" onClick={removeImage}>Remove photo</button></div></div>}
          </div>
        </div>
        <footer className="report-form-footer">
          <p>Reporting as <strong>{user?.fullname || 'CampusFind member'}</strong>. Fields marked <b>*</b> are required.</p>
          <button className="primary-button" type="submit" disabled={isSubmitting}><FaPaperPlane aria-hidden="true" />{isSubmitting ? 'Submitting…' : `Submit ${isLost ? 'lost' : 'found'} report`}</button>
        </footer>
      </form>
    </div>
  )
}

export default ReportItem
