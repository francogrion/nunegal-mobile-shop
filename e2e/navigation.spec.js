import { expect, test } from '@playwright/test'

test.describe('Navegación', () => {
  test('shows a not found page for unknown routes, with a way back', async ({
    page,
  }) => {
    await page.goto('/no-existe')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Página no encontrada',
    )
    await expect(page).toHaveTitle('Página no encontrada · Mobile Shop')

    await page.getByRole('link', { name: 'Volver al catálogo' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Catálogo de móviles',
    )
  })

  test('goes to the home page from the app name and the breadcrumbs', async ({
    page,
  }) => {
    await page.goto('/product/ZmGrkLRPXOTpxsU4jjAcv')
    await page
      .getByRole('navigation', { name: 'Migas de pan' })
      .getByRole('link', { name: 'Inicio' })
      .click()
    await expect(page).toHaveURL('/')

    await page.goto('/product/ZmGrkLRPXOTpxsU4jjAcv')
    await page.getByRole('link', { name: 'Mobile Shop' }).click()
    await expect(page).toHaveURL('/')
  })
})
