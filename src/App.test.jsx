import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  mockProductDetailEndpoint,
  mockProductListEndpoint,
} from './test/apiMocks.js'
import { cartLines, seedCart } from './test/cart.js'
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
    seedCart([cartLines.iconiaTalkS, cartLines.liquidZ6Plus])

    renderApp()

    expect(
      within(screen.getByRole('banner')).getByText('3 productos en la cesta'),
    ).toBeInTheDocument()
  })
})

describe('App breadcrumbs', () => {
  const getBreadcrumbs = () =>
    within(screen.getByRole('navigation', { name: 'Migas de pan' }))

  it('shows the home page as the current page', () => {
    mockProductListEndpoint()
    renderApp({ route: '/' })

    expect(getBreadcrumbs().getByText('Inicio')).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(getBreadcrumbs().queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows the product as the current page and links to the home page on the details page', async () => {
    const endpoint = mockProductDetailEndpoint()
    renderApp({ route: '/product/ZmGrkLRPXOTpxsU4jjAcv' })

    expect(
      getBreadcrumbs().getByRole('link', { name: 'Inicio' }),
    ).toHaveAttribute('href', '/')
    expect(
      await getBreadcrumbs().findByText('Acer Iconia Talk S'),
    ).toHaveAttribute('aria-current', 'page')
    // The page and the breadcrumbs share a single request
    expect(endpoint).toHaveBeenCalledTimes(1)
  })

  it('shows the not found page as the current page for unknown routes', () => {
    renderApp({ route: '/does-not-exist' })

    expect(
      getBreadcrumbs().getByRole('link', { name: 'Inicio' }),
    ).toHaveAttribute('href', '/')
    expect(getBreadcrumbs().getByText('Página no encontrada')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('mentions the catalog only once on the home page', async () => {
    mockProductListEndpoint()
    renderApp({ route: '/' })
    await screen.findByRole('list', { name: 'Productos' })

    // Only in the main heading: no repeated eyebrow or breadcrumb
    expect(screen.getAllByText(/catálogo/i)).toHaveLength(1)
  })
})

describe('App document title', () => {
  it('names the catalog page', async () => {
    mockProductListEndpoint()
    renderApp({ route: '/' })

    await waitFor(() =>
      expect(document.title).toBe('Catálogo de móviles · Mobile Shop'),
    )
  })

  it('names the details page after the product', async () => {
    mockProductDetailEndpoint()
    renderApp({ route: '/product/ZmGrkLRPXOTpxsU4jjAcv' })

    await waitFor(() =>
      expect(document.title).toBe('Acer Iconia Talk S · Mobile Shop'),
    )
  })

  it('names the not found page', async () => {
    renderApp({ route: '/does-not-exist' })

    await waitFor(() =>
      expect(document.title).toBe('Página no encontrada · Mobile Shop'),
    )
  })
})

describe('App scroll position', () => {
  // jsdom does not implement scrolling, so the call itself is observed
  const spyOnScroll = () =>
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

  it('starts every newly opened page at the top', async () => {
    mockProductListEndpoint()
    mockProductDetailEndpoint()
    const scrollTo = spyOnScroll()
    const { user } = renderApp()

    await user.click(await screen.findByRole('link', { name: /Iconia Talk S/ }))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('keeps the scroll position while the search changes the URL', async () => {
    mockProductListEndpoint()
    const scrollTo = spyOnScroll()
    const { user } = renderApp()
    await screen.findByRole('list', { name: 'Productos' })

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar por marca o modelo' }),
      'liquid',
    )

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
