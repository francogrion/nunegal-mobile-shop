import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../../api/config.js'
import {
  mockCartEndpoint,
  mockProductDetailEndpoint,
} from '../../test/apiMocks.js'
import { cartLines, seedCart } from '../../test/cart.js'
import { renderApp } from '../../test/renderApp.jsx'
import { server } from '../../test/server.js'

// A page that makes no API requests, so tests focus on the header cart
const QUIET_ROUTE = '/does-not-exist'
const { iconiaTalkS, liquidZ6Plus } = cartLines

const getCartButton = () => screen.getByRole('button', { name: /en la cesta$/ })

const openCart = async (user) => {
  await user.click(getCartButton())
  return screen.getByRole('region', { name: 'Cesta' })
}

const getTotal = (panel) => within(panel).getByText(/^Total/)

describe('Cart menu', () => {
  it('shows the number of products on a collapsed cart button', () => {
    seedCart([iconiaTalkS, liquidZ6Plus])
    renderApp({ route: QUIET_ROUTE })

    expect(
      screen.getByRole('button', { name: '3 productos en la cesta' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('region', { name: 'Cesta' }),
    ).not.toBeInTheDocument()
  })

  it('opens a panel listing each product with its options, quantity and price', async () => {
    seedCart([iconiaTalkS, liquidZ6Plus])
    const { user } = renderApp({ route: QUIET_ROUTE })

    const panel = await openCart(user)

    expect(getCartButton()).toHaveAttribute('aria-expanded', 'true')
    const [iconia, liquid] = within(panel).getAllByRole('listitem')
    expect(iconia).toHaveTextContent('Acer Iconia Talk S')
    expect(iconia).toHaveTextContent('32 GB · Black')
    expect(iconia).toHaveTextContent('2 × 170 €')
    expect(iconia).toHaveTextContent('340 €')
    expect(liquid).toHaveTextContent('Acer Liquid Z6 Plus')
    expect(liquid).toHaveTextContent('16 GB · White')
  })

  it('shows the total of the cart', async () => {
    seedCart([iconiaTalkS, liquidZ6Plus])
    const { user } = renderApp({ route: QUIET_ROUTE })

    const panel = await openCart(user)

    expect(getTotal(panel)).toHaveTextContent('Total 590 €')
  })

  it('tells when some products are left out of the total for having no price', async () => {
    seedCart([iconiaTalkS, { ...liquidZ6Plus, price: null }])
    const { user } = renderApp({ route: QUIET_ROUTE })

    const panel = await openCart(user)

    expect(getTotal(panel)).toHaveTextContent('Total 340 €')
    expect(panel).toHaveTextContent('No incluye 1 producto sin precio')
  })

  it('tells when the cart is empty', async () => {
    const { user } = renderApp({ route: QUIET_ROUTE })

    const panel = await openCart(user)

    expect(panel).toHaveTextContent('Tu cesta está vacía')
    expect(
      within(panel).queryByRole('button', { name: 'Vaciar cesta' }),
    ).not.toBeInTheDocument()
  })

  it('removes a product from the cart', async () => {
    seedCart([iconiaTalkS, liquidZ6Plus])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(
      within(panel).getByRole('button', {
        name: 'Eliminar Acer Iconia Talk S, 32 GB, Black',
      }),
    )

    expect(within(panel).getAllByRole('listitem')).toHaveLength(1)
    expect(getTotal(panel)).toHaveTextContent('Total 250 €')
    expect(getCartButton()).toHaveAccessibleName('1 producto en la cesta')
    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Producto eliminado de la cesta',
    )
  })

  it('empties the cart', async () => {
    seedCart([iconiaTalkS, liquidZ6Plus])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(
      within(panel).getByRole('button', { name: 'Vaciar cesta' }),
    )

    expect(panel).toHaveTextContent('Tu cesta está vacía')
    expect(getCartButton()).toHaveAccessibleName('0 productos en la cesta')
    expect(within(panel).getByRole('status')).toHaveTextContent('Cesta vaciada')
  })

  it('closes with Escape and returns the focus to the cart button', async () => {
    seedCart([iconiaTalkS])
    const { user } = renderApp({ route: QUIET_ROUTE })
    await openCart(user)

    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('region', { name: 'Cesta' }),
    ).not.toBeInTheDocument()
    expect(getCartButton()).toHaveFocus()
    expect(getCartButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when the user clicks outside of it', async () => {
    seedCart([iconiaTalkS])
    const { user } = renderApp({ route: QUIET_ROUTE })
    await openCart(user)

    await user.click(screen.getByRole('heading', { level: 1 }))

    expect(
      screen.queryByRole('region', { name: 'Cesta' }),
    ).not.toBeInTheDocument()
  })

  it('opens a product from the cart and closes the panel', async () => {
    mockProductDetailEndpoint()
    seedCart([iconiaTalkS])
    const { user, getLocation } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(
      within(panel).getByRole('link', { name: 'Acer Iconia Talk S' }),
    )

    expect(getLocation().pathname).toBe('/product/ZmGrkLRPXOTpxsU4jjAcv')
    expect(
      screen.queryByRole('region', { name: 'Cesta' }),
    ).not.toBeInTheDocument()
  })
})

describe('Cart menu quantities', () => {
  const ICONIA = 'Acer Iconia Talk S, 32 GB, Black'

  const getAddButton = (panel) =>
    within(panel).getByRole('button', { name: `Sumar una unidad de ${ICONIA}` })

  const getSubtractButton = (panel) =>
    within(panel).getByRole('button', {
      name: `Restar una unidad de ${ICONIA}`,
    })

  it('adds one more unit of a product through the API', async () => {
    const cart = mockCartEndpoint()
    seedCart([iconiaTalkS])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(getAddButton(panel))

    await waitFor(() =>
      expect(getCartButton()).toHaveAccessibleName('3 productos en la cesta'),
    )
    const [line] = within(panel).getAllByRole('listitem')
    expect(line).toHaveTextContent('3 × 170 €')
    expect(line).toHaveTextContent('510 €')
    expect(within(panel).getByRole('status')).toHaveTextContent(
      '3 unidades de Acer Iconia Talk S en la cesta',
    )
    const [{ request }] = cart.mock.calls[0]
    await expect(request.json()).resolves.toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      colorCode: 1000,
      storageCode: 2001,
    })
  })

  it('subtracts one unit of a product without calling the API', async () => {
    seedCart([iconiaTalkS])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(getSubtractButton(panel))

    const [line] = within(panel).getAllByRole('listitem')
    expect(line).toHaveTextContent('1 × 170 €')
    expect(getCartButton()).toHaveAccessibleName('1 producto en la cesta')
    expect(within(panel).getByRole('status')).toHaveTextContent(
      '1 unidad de Acer Iconia Talk S en la cesta',
    )
  })

  it('removes the product when subtracting its last unit', async () => {
    seedCart([{ ...iconiaTalkS, quantity: 1 }])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(getSubtractButton(panel))

    expect(panel).toHaveTextContent('Tu cesta está vacía')
    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Producto eliminado de la cesta',
    )
  })

  it('ignores further clicks on "+" while a unit is being added', async () => {
    const response = Promise.withResolvers()
    const endpoint = vi.fn(async () => {
      await response.promise
      return HttpResponse.json({ count: 1 })
    })
    server.use(http.post(`${API_BASE_URL}/api/cart`, endpoint))
    seedCart([iconiaTalkS])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(getAddButton(panel))
    await user.click(getAddButton(panel))

    expect(getAddButton(panel)).toHaveAttribute('aria-disabled', 'true')
    response.resolve()
    await waitFor(() =>
      expect(getCartButton()).toHaveAccessibleName('3 productos en la cesta'),
    )
    expect(endpoint).toHaveBeenCalledTimes(1)
  })

  it('tells when a unit could not be added and keeps the quantity', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/cart`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    seedCart([iconiaTalkS])
    const { user } = renderApp({ route: QUIET_ROUTE })
    const panel = await openCart(user)

    await user.click(getAddButton(panel))

    expect(await within(panel).findByRole('alert')).toHaveTextContent(
      'No se ha podido añadir otra unidad',
    )
    expect(within(panel).getAllByRole('listitem')[0]).toHaveTextContent(
      '2 × 170 €',
    )
  })
})
