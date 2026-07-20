import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

function PasswordField({ id, label, error, hint, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false)
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          disabled={inputProps.disabled}
        >
          {isVisible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <span className="field-message field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field-message" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

export default PasswordField
