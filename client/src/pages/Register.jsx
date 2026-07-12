import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaUserPlus } from 'react-icons/fa6'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import MockModeNotice from '../components/auth/MockModeNotice'
import PasswordField from '../components/auth/PasswordField'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { validateRegistration } from '../utils/validation'

const initialForm = {
  student_id: '',
  fullname: '',
  email: '',
  password: '',
  confirm_password: '',
}

function Register() {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Create account | CampusFind'
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setServerMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateRegistration(formData)
    setErrors(nextErrors)
    setServerMessage('')

    if (Object.keys(nextErrors).length > 0) return

    try {
      setIsSubmitting(true)
      const response = await api.post('/auth/register', {
        student_id: formData.student_id.trim(),
        fullname: formData.fullname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
      login(response.data)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to create your account. Please try again.')
      setErrors(error.response?.data?.errors || {})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Student registration"
      title="Create your CampusFind account"
      description="Use test information while the app is running in frontend preview mode."
    >
      <MockModeNotice />

      {serverMessage && (
        <p className="form-alert" role="alert">
          {serverMessage}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <FormField
            id="register-student-id"
            label="Student ID"
            type="text"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            autoComplete="username"
            placeholder="2026-00001"
            required
            error={errors.student_id}
            disabled={isSubmitting}
          />
          <FormField
            id="register-fullname"
            label="Full name"
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Juan Dela Cruz"
            required
            error={errors.fullname}
            disabled={isSubmitting}
          />
        </div>

        <FormField
          id="register-email"
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="name@example.com"
          required
          error={errors.email}
          disabled={isSubmitting}
        />

        <div className="form-row">
          <PasswordField
            id="register-password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
            error={errors.password}
            hint="Use at least 8 characters."
            disabled={isSubmitting}
          />
          <PasswordField
            id="register-confirm-password"
            label="Confirm password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            error={errors.confirm_password}
            disabled={isSubmitting}
          />
        </div>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <FaUserPlus aria-hidden="true" />
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?
        <Link to="/login">
          Log in <FaArrowRight aria-hidden="true" />
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register
