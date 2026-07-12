function SectionHeader({ eyebrow, title, titleId, description, icon: Icon, action }) {
  return (
    <div className="section-header">
      <div className="section-heading">
        {Icon && (
          <span className="section-icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={titleId}>{title}</h2>
          {description && <p className="section-description">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export default SectionHeader
