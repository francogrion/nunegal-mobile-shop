/**
 * Units in the cart, total price and units left out of the total because
 * their product has no price.
 */
export function summarizeCart(lines) {
  return lines.reduce(
    (summary, { price, quantity }) => ({
      count: summary.count + quantity,
      total: summary.total + (price ?? 0) * quantity,
      unpricedCount: summary.unpricedCount + (price === null ? quantity : 0),
    }),
    { count: 0, total: 0, unpricedCount: 0 },
  )
}
