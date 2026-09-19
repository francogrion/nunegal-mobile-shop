import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App.jsx'

/**
 * Renders the whole app at the given route, as a user would load it, and
 * returns a user-event instance to interact with it.
 */
export function renderApp({ route = '/' } = {}) {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
  return { user }
}
