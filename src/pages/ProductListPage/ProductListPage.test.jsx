import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../../api/config.js'
import { mockProductListEndpoint } from '../../test/apiMocks.js'
import { rawProductList } from '../../test/fixtures/products.js'
import { renderApp } from '../../test/renderApp.jsx'
import { server } from '../../test/server.js'

const findProductList = () => screen.findByRole('list', { name: 'Productos' })

const getSearchBox = () =>
  screen.getByRole('searchbox', { name: 'Buscar por marca o modelo' })

const getVisibleModels = () =>
  within(screen.getByRole('list', { name: 'Productos' }))
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent)

describe('ProductListPage', () => {
  it('shows a loading message while the products are being fetched', async () => {
    mockProductListEndpoint()
    renderApp()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos')
    await findProductList()
    expect(screen.queryByText(/Cargando productos/)).not.toBeInTheDocument()
  })

  it('shows every product returned by the API', async () => {
    mockProductListEndpoint()
    renderApp()

    const list = await findProductList()

    expect(within(list).getAllByRole('listitem')).toHaveLength(
      rawProductList.length,
    )
  })

  it('shows the image, brand, model and price of each product', async () => {
    mockProductListEndpoint()
    renderApp()

    const card = await screen.findByRole('link', { name: /Iconia Talk S/ })

    expect(within(card).getByRole('presentation')).toHaveAttribute(
      'src',
      'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
    )
    expect(within(card).getByText('Acer')).toBeInTheDocument()
    expect(
      within(card).getByRole('heading', { name: 'Iconia Talk S' }),
    ).toBeInTheDocument()
    // Testing Library collapses whitespace (including the no-break space that
    // Intl puts before the currency symbol) into regular spaces.
    expect(within(card).getByText('170 €')).toBeInTheDocument()
  })

  it('tells when a product has no price', async () => {
    mockProductListEndpoint()
    renderApp()

    const card = await screen.findByRole('link', { name: /Liquid Jade 2/ })

    expect(within(card).getByText('Precio no disponible')).toBeInTheDocument()
  })

  it('links each product to its details page with a descriptive name', async () => {
    mockProductListEndpoint()
    renderApp()

    // Accessible names keep the no-break space before the currency symbol.
    const card = await screen.findByRole('link', {
      name: /^Acer Iconia Talk S 170\s€$/,
    })

    expect(card).toHaveAttribute('href', '/product/ZmGrkLRPXOTpxsU4jjAcv')
  })

  it('shows an error that can be retried when the products cannot be loaded', async () => {
    mockProductListEndpoint()
    server.use(
      http.get(
        `${API_BASE_URL}/api/product`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    )
    const { user } = renderApp()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se han podido cargar los productos',
    )

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await findProductList()).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('ProductListPage search', () => {
  it('filters the products by model as the user types', async () => {
    mockProductListEndpoint()
    const { user } = renderApp()
    await findProductList()

    await user.type(getSearchBox(), 'liquid')

    expect(getVisibleModels()).toEqual(['Liquid Z6 Plus', 'Liquid Jade 2'])
  })

  it('filters the products by brand', async () => {
    mockProductListEndpoint()
    const { user } = renderApp()
    await findProductList()

    await user.type(getSearchBox(), 'alcatel')

    expect(getVisibleModels()).toEqual(['Flash (2017)'])
  })

  it('announces how many products match the search', async () => {
    mockProductListEndpoint()
    const { user } = renderApp()
    await findProductList()

    expect(screen.getByRole('status')).toHaveTextContent('4 productos')

    await user.type(getSearchBox(), 'jade')

    expect(screen.getByRole('status')).toHaveTextContent('1 producto')
  })

  it('tells the user when no product matches the search', async () => {
    mockProductListEndpoint()
    const { user } = renderApp()
    await findProductList()

    await user.type(getSearchBox(), 'nokia')

    expect(screen.getByRole('status')).toHaveTextContent(
      'No hay productos que coincidan con «nokia»',
    )
    expect(
      screen.queryByRole('list', { name: 'Productos' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the search in the URL so it can be shared or restored', async () => {
    mockProductListEndpoint()
    const { user, getLocation } = renderApp()
    await findProductList()

    await user.type(getSearchBox(), 'jade')

    expect(getLocation().search).toBe('?search=jade')
  })

  it('applies the search found in the URL', async () => {
    mockProductListEndpoint()
    renderApp({ route: '/?search=jade' })
    await findProductList()

    expect(getSearchBox()).toHaveValue('jade')
    expect(getVisibleModels()).toEqual(['Liquid Jade 2'])
  })
})
