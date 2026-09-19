import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockProductListEndpoint } from './test/apiMocks.js'
import { renderApp } from './test/renderApp.jsx'

describe('App', () => {
  beforeEach(() => {
    mockProductListEndpoint()
  })

  it('renders a brand link to the home page', () => {
    renderApp({ route: '/does-not-exist' })

    expect(screen.getByRole('link', { name: 'Mobile Shop' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('shows the product catalog on the home page', () => {
    renderApp({ route: '/' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Catálogo de móviles' }),
    ).toBeInTheDocument()
  })

  it('shows a not found page with a link back to the catalog for unknown routes', () => {
    renderApp({ route: '/does-not-exist' })

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver al catálogo' }),
    ).toHaveAttribute('href', '/')
  })
})
