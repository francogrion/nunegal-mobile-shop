import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import App from '../App.jsx'

/**
 * Renders the whole app at the given route, as a user would load it.
 * Returns a user-event instance to interact with it and a `getLocation`
 * helper to inspect the current URL (the address bar in a real browser).
 */
export function renderApp({ route = '/' } = {}) {
  let location
  function LocationSpy() {
    location = useLocation()
    return null
  }

  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[route]} useTransitions={false}>
      <App />
      <LocationSpy />
    </MemoryRouter>,
  )
  return { user, getLocation: () => location }
}
