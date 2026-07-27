export async function apiFetch(endpoint) {
  try {
    const res = await fetch(endpoint)
    const json = await res.json()
    if (json.success) return json.data
    throw new Error(json.error || 'Unknown error')
  } catch (err) {
    console.error(`[API] ${endpoint}:`, err.message)
    throw err
  }
}

export async function apiPost(endpoint, data) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Operation failed')
  return json
}

export async function apiPut(endpoint, data) {
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Operation failed')
  return json
}

export async function apiDelete(endpoint) {
  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Operation failed')
  return json
}
