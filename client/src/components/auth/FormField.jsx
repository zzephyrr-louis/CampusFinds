function FormField({ id, label, error, hint, ...inputProps }) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
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

export default FormField
