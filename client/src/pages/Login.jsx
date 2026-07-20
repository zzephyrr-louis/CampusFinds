import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaLock } from 'react-icons/fa6'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import MockModeNotice from '../components/auth/MockModeNotice'
import PasswordField from '../components/auth/PasswordField'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import { validateLogin } from '../utils/validation'

const initialForm = {
  email: '',
  password: '',
}

function Login() {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Log in | CampusFind'
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setServerMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateLogin(formData)
    setErrors(nextErrors)
    setServerMessage('')

    if (Object.keys(nextErrors).length > 0) return

    try {
      setIsSubmitting(true)
      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
      login(response.data)
      const destination = location.state?.from?.startsWith('/') ? location.state.from : '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to log in. Please try again.')
      setErrors(error.response?.data?.errors || {})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to your account"
      description="Enter your CampusFind account details to continue."
    >
      <MockModeNotice />

      {import.meta.env.VITE_API_MODE === 'mock' && (
        <p className="demo-credentials">
          Student: <strong>student@campusfind.local</strong> or admin:{' '}
          <strong>admin@campusfind.local</strong>. Use any test password.
        </p>
      )}

      {serverMessage && (
        <p className="form-alert" role="alert">
          {serverMessage}
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-email"
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="student@campusfind.local"
          required
          error={errors.email}
          disabled={isSubmitting}
        />

        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
          error={errors.password}
          disabled={isSubmitting}
        />

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <FaLock aria-hidden="true" />
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-switch">
        New to CampusFind?
        <Link to="/register">
          Create an account <FaArrowRight aria-hidden="true" />
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
