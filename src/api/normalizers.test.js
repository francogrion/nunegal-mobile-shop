import { describe, expect, it } from 'vitest'
import { rawProductDetail, rawProductList } from '../test/fixtures/products.js'
import {
  normalizeProductDetail,
  normalizeProductSummary,
} from './normalizers.js'

describe('normalizeProductSummary', () => {
  it('maps the fields shown in the product list', () => {
    expect(normalizeProductSummary(rawProductList[0])).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: 170,
      imageUrl:
        'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
    })
  })

  it('returns a null price when the API sends an empty one', () => {
    const productWithoutPrice = rawProductList[2]

    expect(normalizeProductSummary(productWithoutPrice).price).toBeNull()
  })

  it('keeps the price when the API already sends it as a number', () => {
    const product = { ...rawProductList[0], price: 170 }

    expect(normalizeProductSummary(product).price).toBe(170)
  })
})

describe('normalizeProductDetail', () => {
  it('includes the same fields as the product list', () => {
    expect(normalizeProductDetail(rawProductDetail)).toMatchObject(
      normalizeProductSummary(rawProductDetail),
    )
  })

  it('maps the specs shown in the details page, fixing API typos', () => {
    expect(normalizeProductDetail(rawProductDetail).specs).toEqual({
      cpu: 'Quad-core 1.3 GHz Cortex-A53',
      ram: '2 GB RAM',
      os: 'Android 6.0 (Marshmallow)',
      displayResolution: '720 x 1280 pixels (~210 ppi pixel density)',
      displaySize: '7.0 inches (~69.8% screen-to-body ratio)',
      battery: 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)',
      primaryCamera: ['13 MP', 'autofocus'],
      secondaryCamera: ['2 MP', '720p'],
      dimensions: '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)',
      weight: 260,
    })
  })

  it.each([
    ['a list', ['5 MP', 'autofocus'], ['5 MP', 'autofocus']],
    ['a single text', '5 MP', ['5 MP']],
    ['an empty text', '', []],
    ['nothing', undefined, []],
  ])(
    'returns cameras as a list when the API sends %s',
    (_, camera, expected) => {
      const { specs } = normalizeProductDetail({
        ...rawProductDetail,
        primaryCamera: camera,
        secondaryCmera: camera,
      })

      expect(specs.primaryCamera).toEqual(expected)
      expect(specs.secondaryCamera).toEqual(expected)
    },
  )

  it('returns null for text specs the API leaves empty', () => {
    const { specs } = normalizeProductDetail({
      ...rawProductDetail,
      cpu: '',
      battery: '   ',
      os: undefined,
      weight: '',
    })

    expect(specs).toMatchObject({
      cpu: null,
      battery: null,
      os: null,
      weight: null,
    })
  })

  it.each([
    ['an empty text', ''],
    ['null', null],
    ['nothing', undefined],
    ['a non numeric text', 'unknown'],
  ])('returns a null weight when the API sends %s', (_, weight) => {
    const { specs } = normalizeProductDetail({ ...rawProductDetail, weight })

    expect(specs.weight).toBeNull()
  })

  it('maps the purchase options with their codes', () => {
    expect(normalizeProductDetail(rawProductDetail).options).toEqual({
      colors: [{ code: 1000, name: 'Black' }],
      storages: [
        { code: 2000, name: '16 GB' },
        { code: 2001, name: '32 GB' },
      ],
    })
  })

  it.each([
    ['no options at all', undefined],
    ['an empty options object', {}],
  ])('returns empty option lists when the API sends %s', (_, options) => {
    expect(
      normalizeProductDetail({ ...rawProductDetail, options }).options,
    ).toEqual({ colors: [], storages: [] })
  })
})
