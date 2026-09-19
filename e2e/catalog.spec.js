import { expect, test } from '@playwright/test'

const productList = (page) =>
  page.getByRole('list', { name: 'Productos' }).getByRole('listitem')

test.describe('Catálogo', () => {
  test('lists every product returned by the API', async ({ page }) => {
    await page.goto('/')

    await expect(productList(page).first()).toBeVisible()
    const count = await productList(page).count()
    expect(count).toBeGreaterThan(0)
    await expect(page.getByRole('status')).toHaveText(`${count} productos`)
    await expect(page).toHaveTitle('Catálogo de móviles · Mobile Shop')
  })

  test('filters the products in real time by brand and model', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(productList(page).first()).toBeVisible()

    await page
      .getByRole('searchbox', { name: 'Buscar por marca o modelo' })
      .pressSequentially('acer iconia talk')

    await expect(productList(page)).toHaveCount(1)
    await expect(productList(page)).toContainText('Iconia Talk S')
    await expect(page).toHaveURL(/\?search=acer\+iconia\+talk$/)
  })

  test('shows up to four products per row, adapting to the screen', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/')
    const grid = page.getByRole('list', { name: 'Productos' })
    await expect(grid.getByRole('listitem').first()).toBeVisible()

    const columns = await grid.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(' ').length,
    )

    expect(columns).toBe(isMobile ? 1 : 4)
  })

  test('reuses the cached products instead of calling the API again', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(productList(page).first()).toBeVisible()

    const apiRequests = []
    page.on('request', (request) => {
      if (request.url().includes('/api/product')) apiRequests.push(request)
    })
    await page.reload()

    await expect(productList(page).first()).toBeVisible()
    expect(apiRequests).toHaveLength(0)
  })
})
