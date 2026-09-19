import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../../api/config.js'
import { mockProductDetailEndpoint } from '../../test/apiMocks.js'
import { rawProductDetail } from '../../test/fixtures/products.js'
import { renderApp } from '../../test/renderApp.jsx'
import { server } from '../../test/server.js'

const PRODUCT_ID = 'ZmGrkLRPXOTpxsU4jjAcv'
const PRODUCT_ROUTE = `/product/${PRODUCT_ID}`

const findProductHeading = () =>
  screen.findByRole('heading', { level: 1, name: 'Acer Iconia Talk S' })

const findSpecValue = async (label) => {
  const table = await screen.findByRole('table', { name: 'Especificaciones' })
  const rowHeader = within(table).getByRole('rowheader', { name: label })
  return within(rowHeader.closest('tr')).getByRole('cell')
}

describe('ProductDetailPage', () => {
  it('shows a loading message while the product is being fetched', async () => {
    mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    expect(screen.getByRole('status')).toHaveTextContent('Cargando producto')
    await findProductHeading()
    expect(screen.queryByText(/Cargando producto/)).not.toBeInTheDocument()
  })

  it('requests the product identified in the URL', async () => {
    const endpoint = mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    await findProductHeading()

    const [{ params }] = endpoint.mock.calls[0]
    expect(params.id).toBe(PRODUCT_ID)
  })

  it('shows the product name, image and price', async () => {
    mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    expect(await findProductHeading()).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Acer Iconia Talk S' }),
    ).toHaveAttribute(
      'src',
      'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
    )
    expect(screen.getAllByText('170 €').length).toBeGreaterThan(0)
  })

  it('shows a link back to the product list', async () => {
    mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    await findProductHeading()

    expect(
      screen.getByRole('link', { name: 'Volver al listado' }),
    ).toHaveAttribute('href', '/')
  })

  it('shows an error that can be retried when the product cannot be loaded', async () => {
    mockProductDetailEndpoint()
    // The API answers unknown ids and server failures alike, with a 500.
    server.use(
      http.get(
        `${API_BASE_URL}/api/product/:id`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    )
    const { user } = renderApp({ route: PRODUCT_ROUTE })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el producto',
    )
    expect(
      screen.getByRole('link', { name: 'Volver al listado' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await findProductHeading()).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('ProductDetailPage specifications', () => {
  it.each([
    ['Marca', 'Acer'],
    ['Modelo', 'Iconia Talk S'],
    ['Precio', '170 €'],
    ['CPU', 'Quad-core 1.3 GHz Cortex-A53'],
    ['RAM', '2 GB RAM'],
    ['Sistema operativo', 'Android 6.0 (Marshmallow)'],
    ['Resolución de pantalla', '720 x 1280 pixels (~210 ppi pixel density)'],
    ['Tamaño de pantalla', '7.0 inches (~69.8% screen-to-body ratio)'],
    ['Batería', 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)'],
    ['Cámara principal', '13 MP, autofocus'],
    ['Cámara frontal', '2 MP, 720p'],
    ['Dimensiones', '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)'],
    ['Peso', '260 g'],
  ])('shows the %s', async (label, value) => {
    mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    expect(await findSpecValue(label)).toHaveTextContent(value)
  })

  it.each(['CPU', 'Cámara principal', 'Peso'])(
    'shows the %s as not available when the API does not provide it',
    async (label) => {
      mockProductDetailEndpoint({
        ...rawProductDetail,
        cpu: '',
        primaryCamera: '',
        weight: '',
      })
      renderApp({ route: PRODUCT_ROUTE })

      expect(await findSpecValue(label)).toHaveTextContent('No disponible')
    },
  )
})
