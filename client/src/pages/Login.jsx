import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaLock, FaUniversity } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../context/useAuth'

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
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validateForm() {
    const nextErrors = {}

    if (!formData.email.trim()) nextErrors.email = 'Email is required.'
    if (!formData.password) nextErrors.password = 'Password is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerMessage('')

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const response = await api.post('/auth/login', formData)
      login(response.data)
      navigate('/account')
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to log in. Please try again.')
      setErrors(error.response?.data?.errors || {})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel brand-panel">
        <div className="brand-mark">
          <FaUniversity aria-hidden="true" />
        </div>
        <p className="eyebrow">CampusFind</p>
        <h1>Lost and found reports for campus life.</h1>
        <p className="auth-copy">
          Sign in to report items, track claims, and stay updated when the admin reviews your requests.
        </p>
      </section>

      <section className="auth-panel form-panel" aria-labelledby="login-title">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2 id="login-title">Log in</h2>
        </div>

        {serverMessage && <p className="form-alert">{serverMessage}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span>{errors.email}</span>}
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && <span>{errors.password}</span>}
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <FaLock aria-hidden="true" />
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New student? <Link to="/register">Create an account <FaArrowRight aria-hidden="true" /></Link>
        </p>
      </section>
    </main>
  )
}

export default Login
