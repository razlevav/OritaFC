const BASE = '/api'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `שגיאת שרת (${res.status})`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getState: () => request('/state'),

  list: (collection) => request(`/${collection}`),
  get: (collection, id) => request(`/${collection}/${id}`),
  create: (collection, data) =>
    request(`/${collection}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (collection, id, data) =>
    request(`/${collection}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (collection, id) => request(`/${collection}/${id}`, { method: 'DELETE' }),
}
