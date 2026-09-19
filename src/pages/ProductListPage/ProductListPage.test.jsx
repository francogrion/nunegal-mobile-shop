import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../../api/config.js'
import { mockProductListEndpoint } from '../../test/apiMocks.js'
import { rawProductList } from '../../test/fixtures/products.js'
import { renderApp } from '../../test/renderApp.jsx'
import { server } from '../../test/server.js'

const findProductList = () => screen.findByRole('list', { name: 'Productos' })

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
