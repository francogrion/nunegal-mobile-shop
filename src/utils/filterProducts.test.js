import { describe, expect, it } from 'vitest'
import { filterProducts } from './filterProducts.js'

const iconiaTalkS = { id: '1', brand: 'Acer', model: 'Iconia Talk S' }
const liquidZ6Plus = { id: '2', brand: 'Acer', model: 'Liquid Z6 Plus' }
const liquidJade2 = { id: '3', brand: 'Acer', model: 'Liquid Jade 2' }
const flash2017 = { id: '4', brand: 'alcatel', model: 'Flash (2017)' }
const products = [iconiaTalkS, liquidZ6Plus, liquidJade2, flash2017]

describe('filterProducts', () => {
  it.each([
    ['empty', ''],
    ['only whitespace', '   '],
  ])('returns every product when the search is %s', (_, search) => {
    expect(filterProducts(products, search)).toEqual(products)
  })

  it('matches the model ignoring case', () => {
    expect(filterProducts(products, 'LIQUID')).toEqual([
      liquidZ6Plus,
      liquidJade2,
    ])
  })

  it('matches the brand ignoring case', () => {
    expect(filterProducts(products, 'Alcatel')).toEqual([flash2017])
  })

  it('matches searches combining brand and model words in any order', () => {
    expect(filterProducts(products, 'z6 acer')).toEqual([liquidZ6Plus])
  })

  it('ignores extra whitespace between words', () => {
    expect(filterProducts(products, '  acer   jade ')).toEqual([liquidJade2])
  })

  it('returns an empty list when no product matches', () => {
    expect(filterProducts(products, 'nokia')).toEqual([])
  })
})
