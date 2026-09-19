const wholeEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const eurosWithCents = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function formatPrice(price) {
  if (price === null) return 'Precio no disponible'
  const formatter = Number.isInteger(price) ? wholeEuros : eurosWithCents
  return formatter.format(price)
}
