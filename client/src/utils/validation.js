const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin(values) {
  const errors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

export function validateRegistration(values) {
  const errors = {}
  const studentId = values.student_id.trim()
  const fullname = values.fullname.trim()
  const email = values.email.trim()

  if (!studentId) {
    errors.student_id = 'Student ID is required.'
  } else if (studentId.length < 3) {
    errors.student_id = 'Student ID must contain at least 3 characters.'
  }

  if (!fullname) {
    errors.fullname = 'Full name is required.'
  } else if (fullname.length < 2) {
    errors.fullname = 'Enter your complete name.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!values.confirm_password) {
    errors.confirm_password = 'Confirm your password.'
  } else if (values.confirm_password !== values.password) {
    errors.confirm_password = 'Passwords do not match.'
  }

  return errors
}
