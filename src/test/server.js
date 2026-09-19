import { setupServer } from 'msw/node'

// Mock API server shared by all tests. Each test declares the responses it
// needs with `server.use(...)`, so the expected API behaviour is explicit.
export const server = setupServer()
