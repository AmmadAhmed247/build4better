const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

export function apiUrl(path) {
  return `${API_URL}${path}`
}
