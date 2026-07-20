function StudentID({ student }) {
  if (!student) {
    return <p className="student-empty">No student selected.</p>
  }

  return (
    <article className="student-id-card" aria-label={`${student.fullname} student ID`}>
      <div className="student-avatar" aria-hidden="true">
        {student.fullname.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="student-name">{student.fullname}</p>
        <dl>
          <div>
            <dt>Student ID</dt>
            <dd>{student.student_id}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{student.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{student.role}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default StudentID
