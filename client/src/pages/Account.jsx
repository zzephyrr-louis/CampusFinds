import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaShieldHalved, FaUserGraduate } from 'react-icons/fa6'
import StudentID from '../components/StudentID'
import { useAuth } from '../context/useAuth'

function Account() {
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'My account | CampusFind'
  }, [])

  return (
    <section className="account-page" aria-labelledby="account-title">
      <div className="account-card">
        <div className="account-icon" aria-hidden="true">
          {user?.role === 'admin' ? <FaShieldHalved /> : <FaUserGraduate />}
        </div>
        <p className="eyebrow">Account profile</p>
        <h1 id="account-title">{user?.fullname}</h1>
        <p className="account-intro">These details are used to identify your reports and claims.</p>
        <StudentID student={user} />
        <Link className="secondary-button account-back" to="/dashboard">
          <FaArrowLeft aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>
    </section>
  )
}

export default Account
