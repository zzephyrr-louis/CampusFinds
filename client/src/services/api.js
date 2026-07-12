import { readStoredJson, writeStoredJson } from '../utils/storage'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const apiMode = import.meta.env.VITE_API_MODE || 'mock'
const mockUsersKey = 'campusfind_mock_users'

const demoUsers = [
  {
    user_id: 'demo-student',
    student_id: 'DEMO-001',
    fullname: 'Demo Student',
    email: 'student@campusfind.local',
    role: 'student',
  },
  {
    user_id: 'demo-admin',
    student_id: 'ADMIN-001',
    fullname: 'Demo Administrator',
    email: 'admin@campusfind.local',
    role: 'admin',
  },
]

function getMockUsers() {
  const storedUsers = readStoredJson(mockUsersKey, [])
  return Array.isArray(storedUsers) ? [...demoUsers, ...storedUsers] : demoUsers
}

function createApiError(message, status, errors) {
  const error = new Error(message)
  error.response = { data: { message, errors }, status }
  return error
}

function createMockSession(user, message) {
  return {
    data: {
      message,
      token: `campusfind-mock-token-${user.user_id}`,
      user,
    },
  }
}

function mockLogin(body) {
  const email = body.email?.trim().toLowerCase()
  const user = getMockUsers().find((candidate) => candidate.email === email)

  if (!user) {
    throw createApiError('No mock account was found for that email.', 401)
  }

  return createMockSession(user, 'Mock login successful.')
}

function mockRegister(body) {
  const email = body.email?.trim().toLowerCase()
  const studentId = body.student_id?.trim()
  const users = getMockUsers()
  const duplicate = users.find((user) => user.email === email || user.student_id === studentId)

  if (duplicate) {
    throw createApiError('An account with that email or student ID already exists.', 409)
  }

  const user = {
    user_id: `mock-${Date.now()}`,
    student_id: studentId,
    fullname: body.fullname.trim(),
    email,
    role: 'student',
  }
  const storedUsers = readStoredJson(mockUsersKey, [])
  writeStoredJson(mockUsersKey, [...(Array.isArray(storedUsers) ? storedUsers : []), user])

  return createMockSession(user, 'Mock registration successful.')
}

async function mockRequest(path, options = {}) {
  const body = JSON.parse(options.body || '{}')

  if (path === '/auth/login') return mockLogin(body)
  if (path === '/auth/register') return mockRegister(body)

  throw createApiError(`No mock response is configured for ${path}.`, 404)
}

async function serverRequest(path, options = {}) {
  const token = localStorage.getItem('campusfind_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${baseURL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createApiError(data.message || 'Request failed.', response.status, data.errors)
  }

  return { data }
}

async function request(path, options = {}) {
  return apiMode === 'mock' ? mockRequest(path, options) : serverRequest(path, options)
}

const api = {
  post(path, body) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}

export default api
