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
 
function mockSubmitClaim(body) {
  if (!body.item_id) throw createApiError("Select which item you're claiming.", 400)
  if (!body.reason || body.reason.trim().length < 10) {
    throw createApiError('Give a bit more detail (at least 10 characters) so admins can verify your claim.', 400)
  }
 
  return {
    data: {
      claim_id: `mock-claim-${Date.now()}`,
      reason: body.reason.trim(),
      status: 'Pending',
      created_at: new Date().toISOString(),
      item: { item_id: body.item_id, item_name: 'Mock item', category: 'General', status: 'Found' },
      // Mock mode has no filesystem to store an upload in, so we just echo
      // back that a file was attached (using the browser object URL if the
      // caller passed one along) rather than silently dropping it.
      proof_image_url: body.__mockProofImagePreview || null,
    },
  }
}
 
async function mockRequest(path, options = {}) {
  const method = options.method || 'GET'
 
  // FormData bodies (image uploads) can't be JSON.parsed — mock mode can't
  // actually store a file, so pull out the plain fields it needs instead.
  let body = {}
  if (options.isFormData && options.body instanceof FormData) {
    body = Object.fromEntries(
      [...options.body.entries()].filter(([, value]) => !(value instanceof File)),
    )
  } else if (options.body) {
    body = JSON.parse(options.body)
  }
 
  if (method === 'POST' && path === '/auth/login') return mockLogin(body)
  if (method === 'POST' && path === '/auth/register') return mockRegister(body)
  if (method === 'GET' && path === '/items/claimable') return { data: [] }
  if (method === 'POST' && path === '/claims') return mockSubmitClaim(body)
  if (method === 'GET' && path === '/claims/mine') return { data: [] }
 
  throw createApiError(`No mock response is configured for ${path}.`, 404)
}
 
async function serverRequest(path, options = {}) {
  const token = localStorage.getItem('campusfind_token')
  const headers = { ...options.headers }
 
  // Only set Content-Type for JSON bodies. For FormData, the browser must
  // generate its own Content-Type (with the multipart boundary) — setting
  // it manually breaks the request.
  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json'
  }
 
  if (token) headers.Authorization = `Bearer ${token}`
 
  const response = await fetch(`${baseURL}${path}`, {
    method: options.method,
    body: options.body,
    headers,
  })
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
  get(path) {
    return request(path, { method: 'GET' })
  },
  post(path, body) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
 
    return request(path, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      isFormData,
    })
  },
}
 
export default api