import { act, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../../api/config.js'
import { SLOW_LOADING_DELAY_MS } from '../../hooks/useIsSlow.js'
import {
  mockCartEndpoint,
  mockProductDetailEndpoint,
  mockProductListEndpoint,
} from '../../test/apiMocks.js'
import { rawProductDetail } from '../../test/fixtures/products.js'
import { renderApp } from '../../test/renderApp.jsx'
import { server } from '../../test/server.js'

const PRODUCT_ID = 'ZmGrkLRPXOTpxsU4jjAcv'
const PRODUCT_ROUTE = `/product/${PRODUCT_ID}`

const findProductHeading = () =>
  screen.findByRole('heading', { level: 1, name: 'Acer Iconia Talk S' })

const findOptionGroup = (name) => screen.findByRole('group', { name })

const withOptions = (options) => ({ ...rawProductDetail, options })

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

  it('warns that the first load may take up to a minute when the API is slow', async () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
      shouldAdvanceTime: true,
    })
    const response = Promise.withResolvers()
    server.use(
      http.get(`${API_BASE_URL}/api/product/:id`, async () => {
        await response.promise
        return HttpResponse.json(rawProductDetail)
      }),
    )
    renderApp({ route: PRODUCT_ROUTE })

    await act(() => vi.advanceTimersByTimeAsync(SLOW_LOADING_DELAY_MS))
    expect(screen.getByRole('status')).toHaveTextContent(
      'la primera carga puede tardar hasta un minuto',
    )

    response.resolve()
    await findProductHeading()
    expect(screen.queryByText(/puede tardar/)).not.toBeInTheDocument()
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

  it('goes back to the product list keeping the search the user came from', async () => {
    mockProductListEndpoint()
    mockProductDetailEndpoint()
    const { user, getLocation } = renderApp({ route: '/?search=iconia' })

    await user.click(await screen.findByRole('link', { name: /Iconia Talk S/ }))
    await findProductHeading()
    await user.click(screen.getByRole('link', { name: 'Volver al listado' }))

    expect(getLocation().search).toBe('?search=iconia')
    expect(
      await screen.findByRole('searchbox', {
        name: 'Buscar por marca o modelo',
      }),
    ).toHaveValue('iconia')
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

  it('highlights the key figures of the product', async () => {
    mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    const highlights = await screen.findByRole('list', {
      name: 'Especificaciones destacadas',
    })
    const items = within(highlights).getAllByRole('listitem')

    expect(items.map((item) => item.textContent)).toEqual([
      '7.0″ Pantalla',
      '3400 mAh Batería',
      '13 MP Cámara',
      '2 GB RAM',
    ])
  })

  it('shows no highlights when none of the key figures can be read', async () => {
    mockProductDetailEndpoint({
      ...rawProductDetail,
      displayResolution: '',
      battery: '',
      primaryCamera: '',
      ram: '',
    })
    renderApp({ route: PRODUCT_ROUTE })

    await findProductHeading()

    expect(
      screen.queryByRole('list', { name: 'Especificaciones destacadas' }),
    ).not.toBeInTheDocument()
  })
})

describe('ProductDetailPage options', () => {
  it('shows every storage option without preselecting any when there are several', async () => {
    mockProductDetailEndpoint()
    renderApp({ route: PRODUCT_ROUTE })

    const storage = await findOptionGroup('Almacenamiento')

    expect(
      within(storage).getByRole('radio', { name: '16 GB' }),
    ).not.toBeChecked()
    expect(
      within(storage).getByRole('radio', { name: '32 GB' }),
    ).not.toBeChecked()
  })

  it('shows every color option without preselecting any when there are several', async () => {
    mockProductDetailEndpoint(
      withOptions({
        colors: [
          { code: 1000, name: 'Black' },
          { code: 1001, name: 'White' },
        ],
        storages: [{ code: 2000, name: '16 GB' }],
      }),
    )
    renderApp({ route: PRODUCT_ROUTE })

    const colors = await findOptionGroup('Color')

    expect(
      within(colors).getByRole('radio', { name: 'Black' }),
    ).not.toBeChecked()
    expect(
      within(colors).getByRole('radio', { name: 'White' }),
    ).not.toBeChecked()
  })

  it.each([
    ['Color', 'Black'],
    ['Almacenamiento', '16 GB'],
  ])(
    'preselects the %s option when it is the only one available',
    async (group, option) => {
      mockProductDetailEndpoint(
        withOptions({
          colors: [{ code: 1000, name: 'Black' }],
          storages: [{ code: 2000, name: '16 GB' }],
        }),
      )
      renderApp({ route: PRODUCT_ROUTE })

      const options = await findOptionGroup(group)

      expect(within(options).getByRole('radio', { name: option })).toBeChecked()
    },
  )

  it('lets the user choose and change the selected options', async () => {
    mockProductDetailEndpoint()
    const { user } = renderApp({ route: PRODUCT_ROUTE })
    const storage = await findOptionGroup('Almacenamiento')

    await user.click(within(storage).getByRole('radio', { name: '16 GB' }))
    await user.click(within(storage).getByRole('radio', { name: '32 GB' }))

    expect(within(storage).getByRole('radio', { name: '32 GB' })).toBeChecked()
    expect(
      within(storage).getByRole('radio', { name: '16 GB' }),
    ).not.toBeChecked()
  })
})

describe('ProductDetailPage add to cart', () => {
  const getAddButton = () =>
    screen.getByRole('button', { name: 'Añadir a la cesta' })

  const getHeader = () => within(screen.getByRole('banner'))

  // The fixture has a single color (preselected) and two storage options.
  const renderProductAndChooseStorage = async () => {
    const view = renderApp({ route: PRODUCT_ROUTE })
    const storage = await findOptionGroup('Almacenamiento')
    await view.user.click(within(storage).getByRole('radio', { name: '32 GB' }))
    return view
  }

  it('lets the user add the product only once every option is selected', async () => {
    mockProductDetailEndpoint()
    const { user } = renderApp({ route: PRODUCT_ROUTE })
    const storage = await findOptionGroup('Almacenamiento')

    expect(getAddButton()).toBeDisabled()
    expect(
      screen.getByText(
        'Elige almacenamiento y color para añadirlo a la cesta.',
      ),
    ).toBeInTheDocument()

    await user.click(within(storage).getByRole('radio', { name: '32 GB' }))

    expect(getAddButton()).toBeEnabled()
  })

  it('sends the product and the selected options to the cart', async () => {
    mockProductDetailEndpoint()
    const cart = mockCartEndpoint()
    const { user } = await renderProductAndChooseStorage()

    await user.click(getAddButton())

    await waitFor(() => expect(cart).toHaveBeenCalledTimes(1))
    const [{ request }] = cart.mock.calls[0]
    await expect(request.json()).resolves.toEqual({
      id: PRODUCT_ID,
      colorCode: 1000,
      storageCode: 2001,
    })
  })

  it('confirms that the product was added', async () => {
    mockProductDetailEndpoint()
    mockCartEndpoint()
    const { user } = await renderProductAndChooseStorage()

    await user.click(getAddButton())

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Producto añadido a la cesta',
    )
  })

  it('clears the confirmation when the user changes the selected options', async () => {
    mockProductDetailEndpoint()
    mockCartEndpoint()
    const { user } = await renderProductAndChooseStorage()
    await user.click(getAddButton())
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Producto añadido a la cesta',
    )

    await user.click(screen.getByRole('radio', { name: '16 GB' }))

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('adds up the products in the header count, which stays on every page', async () => {
    mockProductDetailEndpoint()
    mockProductListEndpoint()
    mockCartEndpoint({ count: 1 })
    const { user } = await renderProductAndChooseStorage()

    await user.click(getAddButton())
    expect(
      await getHeader().findByText('1 producto en la cesta'),
    ).toBeInTheDocument()

    await user.click(getAddButton())
    expect(
      await getHeader().findByText('2 productos en la cesta'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Volver al listado' }))
    await screen.findByRole('list', { name: 'Productos' })
    expect(getHeader().getByText('2 productos en la cesta')).toBeInTheDocument()
  })

  it('prevents adding the product twice while the request is in progress', async () => {
    mockProductDetailEndpoint()
    const response = Promise.withResolvers()
    server.use(
      http.post(`${API_BASE_URL}/api/cart`, async () => {
        await response.promise
        return HttpResponse.json({ count: 1 })
      }),
    )
    const { user } = await renderProductAndChooseStorage()

    await user.click(getAddButton())

    expect(screen.getByRole('button', { name: 'Añadiendo…' })).toBeDisabled()
    response.resolve()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Producto añadido a la cesta',
    )
  })

  it('shows an error and keeps the count when the product cannot be added', async () => {
    mockProductDetailEndpoint()
    server.use(
      http.post(
        `${API_BASE_URL}/api/cart`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    const { user } = await renderProductAndChooseStorage()

    await user.click(getAddButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido añadir el producto a la cesta',
    )
    expect(getHeader().getByText('0 productos en la cesta')).toBeInTheDocument()
    expect(getAddButton()).toBeEnabled()
  })

  it('sends the color chosen by the user when there are several', async () => {
    mockProductDetailEndpoint(
      withOptions({
        colors: [
          { code: 1000, name: 'Black' },
          { code: 1001, name: 'White' },
        ],
        storages: [{ code: 2000, name: '16 GB' }],
      }),
    )
    const cart = mockCartEndpoint()
    const { user } = renderApp({ route: PRODUCT_ROUTE })
    const colors = await findOptionGroup('Color')

    await user.click(within(colors).getByRole('radio', { name: 'White' }))
    await user.click(getAddButton())

    await waitFor(() => expect(cart).toHaveBeenCalledTimes(1))
    const [{ request }] = cart.mock.calls[0]
    await expect(request.json()).resolves.toMatchObject({ colorCode: 1001 })
  })

  it('keeps the button disabled if the options change while adding', async () => {
    mockProductDetailEndpoint()
    server.use(
      http.post(`${API_BASE_URL}/api/cart`, () => new Promise(() => {})),
    )
    const { user } = await renderProductAndChooseStorage()

    await user.click(getAddButton())
    await user.click(screen.getByRole('radio', { name: '16 GB' }))

    expect(screen.getByRole('button', { name: 'Añadiendo…' })).toBeDisabled()
  })
})
