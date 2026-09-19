import { API_BASE_URL } from './config.js'

/**
 * Error raised for any failed API request. `status` holds the HTTP status
 * code, or null when no response was received (e.g. network failure).
 */
export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson(path, { method = 'GET', body } = {}) {
  const hasBody = body !== undefined
  let response
  try {
    response = await fetch(new URL(path, API_BASE_URL), {
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : {},
      body: hasBody ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    throw new ApiError(`Network error requesting ${method} ${path}`, {
      cause: error,
    })
  }

  if (!response.ok) {
    throw new ApiError(
      `Request ${method} ${path} failed with status ${response.status}`,
      { status: response.status },
    )
  }
  return response.json()
}
