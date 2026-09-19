import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server.js'

// Any request without a matching handler fails the test, so tests can never
// hit the real API by accident.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Vitest runs without globals, so Testing Library cannot register its
// automatic cleanup; unmount rendered trees after every test here instead.
// Browser storage is also reset so cached data never leaks between tests.
afterEach(() => {
  cleanup()
  localStorage.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
