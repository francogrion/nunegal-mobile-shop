import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest runs without globals, so Testing Library cannot register its
// automatic cleanup; unmount rendered trees after every test here instead.
// Browser storage is also reset so cached data never leaks between tests.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
