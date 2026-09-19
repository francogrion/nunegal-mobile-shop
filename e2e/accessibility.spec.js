import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Automated WCAG 2.1 AA audit of every page once its content has loaded.
// It catches issues such as missing names, low contrast or invalid ARIA;
// manual checks (keyboard, screen readers) are still needed for the rest.
const pages = [
  {
    name: 'catálogo',
    path: '/',
    ready: (page) =>
      page
        .getByRole('list', { name: 'Productos' })
        .getByRole('listitem')
        .first(),
  },
  {
    name: 'detalle de producto',
    path: '/product/ZmGrkLRPXOTpxsU4jjAcv',
    ready: (page) => page.getByRole('button', { name: 'Añadir a la cesta' }),
  },
  {
    name: 'página no encontrada',
    path: '/no-existe',
    ready: (page) => page.getByRole('heading', { level: 1 }),
  },
]

for (const { name, path, ready } of pages) {
  test(`the ${name} page has no detectable accessibility issues`, async ({
    page,
  }) => {
    await page.goto(path)
    await expect(ready(page)).toBeVisible()

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Only the relevant details, so a failure is readable
    const issues = violations.map(({ id, help, nodes }) => ({
      id,
      help,
      targets: nodes.map((node) => node.target.join(' ')),
    }))
    expect(issues).toEqual([])
  })
}
