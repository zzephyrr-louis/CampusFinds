import { FaClockRotateLeft, FaPaperPlane } from 'react-icons/fa6'

function SubmitClaimCard({
  items,
  isLoadingItems,
  formData,
  formErrors,
  serverMessage,
  successMessage,
  isSubmitting,
  proofImage,
  proofImagePreview,
  imageError,
  onChange,
  onImageChange,
  onRemoveImage,
  onSubmit,
  onShowHistory,
}) {
  return (
    <section className="claims-card" aria-labelledby="submit-claim-title">
      <div className="claims-card-header">
        <h2 id="submit-claim-title">
          <FaPaperPlane aria-hidden="true" /> Submit a Claim
        </h2>
        <button type="button" className="claims-history-button" onClick={onShowHistory}>
          <FaClockRotateLeft aria-hidden="true" /> History
        </button>
      </div>

      <div className="claims-card-content">
        {successMessage && (
          <p className="form-success" role="status">
            {successMessage}
          </p>
        )}
        {serverMessage && (
          <p className="form-alert" role="alert">
            {serverMessage}
          </p>
        )}

        <form className="claims-form" onSubmit={onSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="claim-item">Item</label>
            <select
              id="claim-item"
              name="item_id"
              value={formData.item_id}
              onChange={onChange}
              disabled={isSubmitting || isLoadingItems}
              aria-invalid={Boolean(formErrors.item_id)}
            >
              <option value="">
                {isLoadingItems ? 'Loading items…' : 'Select an item'}
              </option>
              {items.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_name} — {item.category} ({item.status})
                </option>
              ))}
            </select>
            {!isLoadingItems && items.length === 0 && (
              <span className="field-message">
                No claimable items are available right now — check back once someone reports a match.
              </span>
            )}
            {formErrors.item_id && (
              <span className="field-message field-error" role="alert">
                {formErrors.item_id}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="claim-reason">Why is this yours?</label>
            <textarea
              id="claim-reason"
              name="reason"
              rows={4}
              placeholder="Describe identifying details only the real owner would know (e.g. a scratch, a sticker, what's inside)."
              value={formData.reason}
              onChange={onChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(formErrors.reason)}
            />
            {formErrors.reason && (
              <span className="field-message field-error" role="alert">
                {formErrors.reason}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="claim-image">Upload Proof of Ownership (optional)</label>
            <span className="field-message">
              Attach a photo that shows an identifying detail (e.g. a scratch, sticker, or the item's contents) — JPG, PNG, or WEBP, up to 5MB.
            </span>

            <input
              id="claim-image"
              name="proof_image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              disabled={isSubmitting}
              className="claims-file-input"
            />

            {imageError && (
              <span className="field-message field-error" role="alert">
                {imageError}
              </span>
            )}

            {proofImage && (
              <div className="image-preview">
                <img src={proofImagePreview} alt="Proof preview" />
                <div className="image-preview-info">
                  <span className="image-file-name">{proofImage.name}</span>
                  <button type="button" className="image-remove-button" onClick={onRemoveImage}>
                    Remove image
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <FaPaperPlane aria-hidden="true" />
            {isSubmitting ? 'Submitting…' : 'Submit claim'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default SubmitClaimCard
