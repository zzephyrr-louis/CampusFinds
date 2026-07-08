import { Navigate } from 'react-router-dom'
import { FaRightFromBracket, FaShieldHalved, FaUserGraduate } from 'react-icons/fa6'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import StudentID from '../components/StudentID'

function Account() {
  const { user, isAuthenticated, logout } = useAuth()
  const [displayIndex, setDisplayIndex] = useState(0)

  const studentList = useMemo(() => {
    if (!user) return []

    return [
      user,
      {
        student_id: '2009-00732',
        fullname: 'Von',
        email: 'von@campusfind.edu',
        role: 'student',
      },
      {
        student_id: '2009-00327',
        fullname: 'Alphonse',
        email: 'alphonse@campusfind.edu',
        role: 'student',
      },
      {
        student_id: '2009-00273',
        fullname: 'Godinez',
        email: 'godinez@campusfind.edu',
        role: 'student',
      },
    ]
  }, [user])

  const selectedStudent = studentList[displayIndex]
  const isFirstStudent = displayIndex === 0
  const isLastStudent = displayIndex === studentList.length - 1

  useEffect(() => {
    if (user) {
      document.title = `${user.fullname} | CampusFind`
    }
  }, [user])

  function showPreviousStudent() {
    setDisplayIndex((current) => Math.max(current - 1, 0))
  }

  function showNextStudent() {
    setDisplayIndex((current) => Math.min(current + 1, studentList.length - 1))
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <div className="account-icon">
          {user.role === 'admin' ? <FaShieldHalved aria-hidden="true" /> : <FaUserGraduate aria-hidden="true" />}
        </div>
        <p className="eyebrow">Signed in</p>
        <h1>{user.fullname}</h1>
        <StudentID student={selectedStudent} />
        <div className="student-controls" aria-label="Student preview controls">
          <button className="secondary-button" type="button" onClick={showPreviousStudent} disabled={isFirstStudent}>
            Prev
          </button>
          <span>
            {displayIndex + 1} / {studentList.length}
          </span>
          <button className="secondary-button" type="button" onClick={showNextStudent} disabled={isLastStudent}>
            Next
          </button>
        </div>
        <button className="secondary-button" type="button" onClick={logout}>
          <FaRightFromBracket aria-hidden="true" />
          Log out
        </button>
      </section>
    </main>
  )
}

export default Account
