export function readStoredJson(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

export function writeStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
