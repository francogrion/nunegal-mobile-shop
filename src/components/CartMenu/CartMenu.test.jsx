import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockProductDetailEndpoint } from '../../test/apiMocks.js'
import { cartLines, seedCart } from '../../test/cart.js'
import { renderApp } from '../../test/renderApp.jsx'

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
