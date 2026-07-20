const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

function toSnakeCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function normalizeFieldErrors(errors) {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return errors

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [toSnakeCase(key), value]),
  )
}

function createApiError(message, status = 0, errors) {
  const error = new Error(message)
  error.response = {
    data: { message, errors: normalizeFieldErrors(errors) },
    status,
  }
  return error
}

function notifyUnauthorized(path) {
  if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) return
  window.dispatchEvent(new CustomEvent('campusfind:unauthorized'))
}

async function request(path, options = {}) {
  const token = localStorage.getItem('campusfind_token')
  const headers = { Accept: 'application/json', ...options.headers }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (options.body !== undefined && options.body !== null && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined || options.body === null || isFormData
          ? options.body
          : JSON.stringify(options.body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw createApiError('Unable to connect to CampusFind. Check that the backend is running.')
  }

  const data = response.status === 204
    ? null
    : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) notifyUnauthorized(path)
    throw createApiError(
      data?.message || `Request failed with status ${response.status}.`,
      response.status,
      data?.errors,
    )
  }

  return { data, status: response.status }
}

export function resolveAssetUrl(value) {
  if (!value || typeof value !== 'string') return ''
  if (/^(?:https?:|data:|blob:)/i.test(value)) return value

  try {
    const apiOrigin = new URL(baseURL).origin
    return new URL(value.startsWith('/') ? value : `/${value}`, apiOrigin).toString()
  } catch {
    return value
  }
}

const api = {
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: 'POST', body })
  },
  put(path, body, options = {}) {
    return request(path, { ...options, method: 'PUT', body })
  },
  patch(path, body, options = {}) {
    return request(path, { ...options, method: 'PATCH', body })
  },
  delete(path, options = {}) {
    return request(path, { ...options, method: 'DELETE' })
  },
  async uploadFile(file, directory, options = {}) {
    const payload = new FormData()
    payload.append('file', file)
    payload.append('directory', directory)
    return request('/files/upload', { ...options, method: 'POST', body: payload })
  },
}

export default api
