const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://itx-frontend-test.onrender.com'
const WARM_UP_TIMEOUT_MS = 120_000
const RETRY_DELAY_MS = 5_000

/**
 * Wakes up the API before the tests start. It sleeps when idle and its first
 * answer can take about a minute, which would otherwise make the first tests
 * time out.
 */
export default async function globalSetup() {
  const deadline = Date.now() + WARM_UP_TIMEOUT_MS
  let lastError

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/product`, {
        signal: AbortSignal.timeout(deadline - Date.now()),
      })
      if (response.ok) return
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
  }

  throw new Error(`The API at ${API_BASE_URL} did not answer: ${lastError}`)
}
