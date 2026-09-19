export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://itx-frontend-test.onrender.com'

/** How long API responses are reused from the client-side cache. */
export const CACHE_TTL_MS = 60 * 60 * 1000
