/**
 * Filters products by a free-text search: every word of the search must
 * appear in the product brand or model, in any order and ignoring case.
 */
export function filterProducts(products, search) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return products

  return products.filter((product) => {
    const text = `${product.brand} ${product.model}`.toLowerCase()
    return words.every((word) => text.includes(word))
  })
}
