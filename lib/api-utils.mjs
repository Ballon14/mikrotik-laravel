import { auth } from "@/lib/auth.mjs"

export function success(data) {
  return Response.json({ success: true, data })
}

export function error(message, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

// Convert hyphenated keys to camelCase
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

// Recursively convert object keys from hyphenated to camelCase
export function camelCaseKeys(obj) {
  if (Array.isArray(obj)) return obj.map(camelCaseKeys)
  if (obj && typeof obj === 'object') {
    const result = {}
    for (const [key, val] of Object.entries(obj)) {
      result[camelCase(key)] = val && typeof val === 'object' ? camelCaseKeys(val) : val
    }
    return result
  }
  return obj
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

export function withAuth(handler) {
  return async (req, ...args) => {
    try {
      const session = await requireAuth()
      req.userId = parseInt(session.user.id)
      req.user = session.user
      return await handler(req, ...args)
    } catch (e) {
      if (e.message === 'Unauthorized') {
        return error('Unauthorized', 401)
      }
      return error(e.message, 500)
    }
  }
}

export function getBody(req) {
  return req.json()
}
