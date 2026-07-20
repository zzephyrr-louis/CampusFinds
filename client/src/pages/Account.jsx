import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaShieldHalved, FaUserGraduate } from 'react-icons/fa6'
import StudentID from '../components/StudentID'
import { useAuth } from '../context/useAuth'

function Account() {
  const { user, refreshUser } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadProfile = useCallback(async () => {
    setIsRefreshing(true)
    setError('')
    try {
      await refreshUser()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to refresh your account details.')
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshUser])

  useEffect(() => {
    document.title = 'My account | CampusFind'
    const loadTimer = window.setTimeout(loadProfile, 0)
    return () => window.clearTimeout(loadTimer)
  }, [loadProfile])

  return (
    <section className="account-page" aria-labelledby="account-title">
      <div className="account-card">
        <div className="account-icon" aria-hidden="true">
          {user?.role === 'admin' ? <FaShieldHalved /> : <FaUserGraduate />}
        </div>
        <p className="eyebrow">Account profile</p>
        <h1 id="account-title">{user?.fullname}</h1>
        <p className="account-intro">These details are used to identify your reports and claims.</p>
        {isRefreshing && <p className="account-status" role="status">Refreshing account details&hellip;</p>}
        {error && (
          <div className="page-error-state" role="alert">
            <p>{error}</p>
            <button className="secondary-button" type="button" onClick={loadProfile}>Try again</button>
          </div>
        )}
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
