import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY } from './store/cartStore.js'
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

describe('App header cart', () => {
  beforeEach(() => {
    mockProductListEndpoint()
  })

  it('shows an empty cart on the first visit', () => {
    renderApp()

    expect(
      within(screen.getByRole('banner')).getByText('0 productos en la cesta'),
    ).toBeInTheDocument()
  })

  it('shows the cart count saved on a previous visit', () => {
    localStorage.setItem(CART_STORAGE_KEY, '3')

    renderApp()

    expect(
      within(screen.getByRole('banner')).getByText('3 productos en la cesta'),
    ).toBeInTheDocument()
  })
})
