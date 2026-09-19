import { expect, test } from '@playwright/test'

// Acer Iconia Talk S: two storage options (16 GB, 32 GB) and a single color
const PRODUCT_PATH = '/product/ZmGrkLRPXOTpxsU4jjAcv'

const cartSummary = (page, text) =>
  page.getByRole('banner').getByText(text, { exact: true })

test.describe('Detalle de producto', () => {
  test('opens a product from the list and shows its details', async ({
    page,
  }) => {
    await page.goto('/?search=iconia+talk')

    await page.getByRole('link', { name: /Iconia Talk S/ }).click()

    await expect(page).toHaveURL(PRODUCT_PATH)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Acer Iconia Talk S',
    )
    await expect(page).toHaveTitle('Acer Iconia Talk S · Mobile Shop')
    await expect(
      page.getByRole('img', { name: 'Acer Iconia Talk S' }),
    ).toBeVisible()
    await expect(
      page
        .getByRole('navigation', { name: 'Migas de pan' })
        .getByText('Acer Iconia Talk S'),
    ).toHaveAttribute('aria-current', 'page')
  })

  test('opens the details at the top even from a product far down the list', async ({
    page,
  }) => {
    await page.goto('/')
    const product = page
      .getByRole('list', { name: 'Productos' })
      .getByRole('listitem')
      .nth(11)
    await product.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await product.getByRole('link').click()

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('shows every attribute required for the product description', async ({
    page,
  }) => {
    await page.goto(PRODUCT_PATH)
    const specs = page.getByRole('table', { name: 'Especificaciones' })

    for (const attribute of [
      'Marca',
      'Modelo',
      'Precio',
      'CPU',
      'RAM',
      'Sistema operativo',
      'Resolución de pantalla',
      'Batería',
      'Cámara principal',
      'Cámara frontal',
      'Dimensiones',
      'Peso',
    ]) {
      await expect(
        specs.getByRole('rowheader', { name: attribute, exact: true }),
      ).toBeVisible()
    }
  })

  test('adds the product to the cart and keeps the count across pages and reloads', async ({
    page,
  }) => {
    await page.goto(PRODUCT_PATH)
    const addButton = page.getByRole('button', { name: 'Añadir a la cesta' })
    await expect(cartSummary(page, '0 productos en la cesta')).toBeAttached()

    // The only color is preselected; the storage must be chosen
    await expect(page.getByRole('radio', { name: 'Black' })).toBeChecked()
    await expect(addButton).toBeDisabled()
    await page.getByText('32 GB', { exact: true }).click()
    await expect(page.getByRole('radio', { name: '32 GB' })).toBeChecked()

    await addButton.click()

    await expect(page.getByRole('status')).toHaveText(
      'Producto añadido a la cesta.',
    )
    await expect(cartSummary(page, '1 producto en la cesta')).toBeAttached()

    await page.reload()
    await expect(cartSummary(page, '1 producto en la cesta')).toBeAttached()

    await page.getByRole('link', { name: 'Volver al listado' }).click()
    await expect(page).toHaveURL('/')
    await expect(cartSummary(page, '1 producto en la cesta')).toBeAttached()
  })

  test('lists the added product in the cart, where it can be removed', async ({
    page,
  }) => {
    await page.goto(PRODUCT_PATH)
    await page.getByText('32 GB', { exact: true }).click()
    await page.getByRole('button', { name: 'Añadir a la cesta' }).click()
    await expect(page.getByRole('status')).toHaveText(
      'Producto añadido a la cesta.',
    )

    await page.getByRole('button', { name: '1 producto en la cesta' }).click()
    const cart = page.getByRole('region', { name: 'Cesta' })
    await expect(cart.getByRole('listitem')).toHaveCount(1)
    await expect(cart.getByRole('listitem')).toContainText('32 GB · Black')
    await expect(cart.getByText(/^Total/)).toContainText('170')

    await cart
      .getByRole('button', {
        name: 'Eliminar Acer Iconia Talk S, 32 GB, Black',
      })
      .click()

    await expect(cart).toContainText('Tu cesta está vacía')
    await expect(
      page.getByRole('button', { name: '0 productos en la cesta' }),
    ).toBeVisible()
  })

  test('goes back to the list where the user left it', async ({ page }) => {
    await page.goto('/')
    const product = page
      .getByRole('list', { name: 'Productos' })
      .getByRole('listitem')
      .nth(11)
    await product.scrollIntoViewIfNeeded()
    const listScroll = await page.evaluate(() => window.scrollY)
    await product.getByRole('link').click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.getByRole('link', { name: 'Volver al listado' }).click()

    await expect(page.getByRole('list', { name: 'Productos' })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeCloseTo(listScroll, -1)
  })

  test('goes back to the list keeping the previous search', async ({
    page,
  }) => {
    await page.goto('/?search=iconia+talk')
    await page.getByRole('link', { name: /Iconia Talk S/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.getByRole('link', { name: 'Volver al listado' }).click()

    await expect(page).toHaveURL('/?search=iconia+talk')
    await expect(
      page.getByRole('searchbox', { name: 'Buscar por marca o modelo' }),
    ).toHaveValue('iconia talk')
  })
})
