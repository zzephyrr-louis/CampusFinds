function PageHeader({ eyebrow, title, description, aside, titleId, className = '' }) {
  const headerClassName = ['page-heading', className].filter(Boolean).join(' ')

  return (
    <header className={headerClassName}>
      <div className="page-heading-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 id={titleId}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {aside}
    </header>
  )
}

export default PageHeader
