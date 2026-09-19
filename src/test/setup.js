import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { resetProductService } from '../api/products.js'
import { server } from './server.js'

// Any request without a matching handler fails the test, so tests can never
// hit the real API by accident.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Vitest runs without globals, so Testing Library cannot register its
// automatic cleanup; unmount rendered trees after every test here instead.
// Browser storage, requests in flight, mock handlers and fake timers are also
// reset so no state leaks between tests, even when a test fails halfway.
afterEach(() => {
  cleanup()
  localStorage.clear()
  resetProductService()
  server.resetHandlers()
  vi.useRealTimers()
})

afterAll(() => {
  server.close()
})
