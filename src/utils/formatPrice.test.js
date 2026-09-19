import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice.js'

// Intl separates the amount and the currency symbol with a no-break space.
const NBSP = ' '

describe('formatPrice', () => {
  it('formats whole prices in euros without decimals', () => {
    expect(formatPrice(170)).toBe(`170${NBSP}€`)
  })

  it('formats prices with cents using two decimals', () => {
    expect(formatPrice(99.5)).toBe(`99,50${NBSP}€`)
  })

  it('returns a fallback text when there is no price', () => {
    expect(formatPrice(null)).toBe('Precio no disponible')
  })
})
