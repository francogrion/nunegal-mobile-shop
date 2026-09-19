/**
 * Summary figures of the catalog: number of models, number of distinct
 * brands (the API mixes cases, e.g. "Acer" and "alcatel") and the lowest
 * known price, or null when no product has a price.
 */
export function getCatalogStats(products) {
  const brands = new Set(products.map(({ brand }) => brand.toLowerCase()))
  const prices = products
    .map(({ price }) => price)
    .filter((price) => price !== null)

  return {
    models: products.length,
    brands: brands.size,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
  }
}
