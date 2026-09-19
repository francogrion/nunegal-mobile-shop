import { describe, expect, it } from 'vitest'
import { getCatalogStats } from './getCatalogStats.js'

describe('getCatalogStats', () => {
  it('counts the models and the distinct brands, ignoring case', () => {
    const products = [
      { brand: 'Acer', price: 170 },
      { brand: 'acer', price: 90 },
      { brand: 'alcatel', price: null },
    ]

    expect(getCatalogStats(products)).toMatchObject({ models: 3, brands: 2 })
  })

  it('returns the lowest price among the products that have one', () => {
    const products = [
      { brand: 'Acer', price: 170 },
      { brand: 'Acer', price: null },
      { brand: 'Acer', price: 90 },
    ]

    expect(getCatalogStats(products).minPrice).toBe(90)
  })

  it('returns no minimum price when no product has a price', () => {
    const products = [{ brand: 'Acer', price: null }]

    expect(getCatalogStats(products).minPrice).toBeNull()
  })

  it('describes an empty catalog', () => {
    expect(getCatalogStats([])).toEqual({
      models: 0,
      brands: 0,
      minPrice: null,
    })
  })
})
