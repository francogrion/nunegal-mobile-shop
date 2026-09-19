import { describe, expect, it } from 'vitest'
import { summarizeCart } from './summarizeCart.js'

describe('summarizeCart', () => {
  it('describes an empty cart', () => {
    expect(summarizeCart([])).toEqual({ count: 0, total: 0, unpricedCount: 0 })
  })

  it('adds up the units and the price of every line', () => {
    const lines = [
      { price: 170, quantity: 2 },
      { price: 250, quantity: 1 },
    ]

    expect(summarizeCart(lines)).toEqual({
      count: 3,
      total: 590,
      unpricedCount: 0,
    })
  })

  it('leaves the units without price out of the total and counts them', () => {
    const lines = [
      { price: 170, quantity: 1 },
      { price: null, quantity: 2 },
    ]

    expect(summarizeCart(lines)).toEqual({
      count: 3,
      total: 170,
      unpricedCount: 2,
    })
  })
})
