import { FaBoxArchive, FaCheck } from 'react-icons/fa6'

const benefits = [
  'Report lost and found items in one place',
  'Track possible matches and claim updates',
  'Keep item handovers organized and verified',
]

function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <main className="auth-page">
      <section className="auth-panel brand-panel" aria-label="About CampusFind">
        <div className="brand-mark" aria-hidden="true">
          <FaBoxArchive />
        </div>
        <p className="eyebrow">CampusFind</p>
        <h1>Lost something? Let the campus help you find it.</h1>
        <p className="auth-copy">
          A clear and secure place for students to report items, discover possible matches, and follow claims.
        </p>
        <ul className="auth-benefits">
          {benefits.map((benefit) => (
            <li key={benefit}>
              <FaCheck aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="auth-panel form-panel" aria-labelledby="auth-title">
        <div className="auth-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="auth-title">{title}</h2>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
