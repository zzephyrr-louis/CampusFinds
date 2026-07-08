import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight, FaUserPlus } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../context/useAuth'

const initialForm = {
  student_id: '',
  fullname: '',
  email: '',
  password: '',
}

function Register() {
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

    if (!formData.student_id.trim()) nextErrors.student_id = 'Student ID is required.'
    if (!formData.fullname.trim()) nextErrors.fullname = 'Full name is required.'
    if (!formData.email.trim()) nextErrors.email = 'Email is required.'
    if (!formData.password) nextErrors.password = 'Password is required.'
    if (formData.password && formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerMessage('')

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const response = await api.post('/auth/register', formData)
      login(response.data)
      navigate('/dashboard')
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to register. Please try again.')
      setErrors(error.response?.data?.errors || {})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page compact-auth">
      <section className="auth-panel form-panel" aria-labelledby="register-title">
        <div>
          <p className="eyebrow">Student registration</p>
          <h1 id="register-title">Create your CampusFind account</h1>
        </div>

        {serverMessage && <p className="form-alert">{serverMessage}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Student ID
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.student_id && <span>{errors.student_id}</span>}
          </label>

          <label>
            Full name
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.fullname && <span>{errors.fullname}</span>}
          </label>

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
              autoComplete="new-password"
            />
            {errors.password && <span>{errors.password}</span>}
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <FaUserPlus aria-hidden="true" />
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in <FaArrowRight aria-hidden="true" /></Link>
        </p>
      </section>
    </main>
  )
}

export default Register
