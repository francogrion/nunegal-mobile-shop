import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rawProductDetail, rawProductList } from '../test/fixtures/products.js'
import {
  mockCartEndpoint,
  mockProductDetailEndpoint,
  mockProductListEndpoint,
} from '../test/apiMocks.js'
import { server } from '../test/server.js'
import { API_BASE_URL } from './config.js'
import { ApiError } from './httpClient.js'
import {
  normalizeProductDetail,
  normalizeProductSummary,
} from './normalizers.js'
import {
  addToCart,
  getProduct,
  getProducts,
  resetProductService,
} from './products.js'

describe('getProducts', () => {
  it('resolves with the normalized product list', async () => {
    mockProductListEndpoint()

    await expect(getProducts()).resolves.toEqual(
      rawProductList.map(normalizeProductSummary),
    )
  })
})

describe('getProduct', () => {
  it('resolves with the normalized product detail', async () => {
    mockProductDetailEndpoint()

    await expect(getProduct(rawProductDetail.id)).resolves.toEqual(
      normalizeProductDetail(rawProductDetail),
    )
  })
})

describe('addToCart', () => {
  const selection = {
    id: 'ZmGrkLRPXOTpxsU4jjAcv',
    colorCode: 1000,
    storageCode: 2000,
  }

  it('sends the selected product options', async () => {
    const endpoint = mockCartEndpoint()

    await addToCart(selection)

    const [{ request }] = endpoint.mock.calls[0]
    await expect(request.json()).resolves.toEqual(selection)
  })

  it('resolves with the number of products the API reports as added', async () => {
    mockCartEndpoint()

    await expect(addToCart(selection)).resolves.toBe(1)
  })

  it('never serves cart requests from the cache', async () => {
    const endpoint = mockCartEndpoint()

    await addToCart(selection)
    await addToCart(selection)

    expect(endpoint).toHaveBeenCalledTimes(2)
  })
})

describe('client-side cache', () => {
  const ONE_HOUR = 60 * 60 * 1000

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-19T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('serves the product list from the cache during the following hour', async () => {
    const endpoint = mockProductListEndpoint()
    await getProducts()

    vi.setSystemTime(Date.now() + ONE_HOUR - 1)

    await expect(getProducts()).resolves.toEqual(
      rawProductList.map(normalizeProductSummary),
    )
    expect(endpoint).toHaveBeenCalledTimes(1)
  })

  it('requests the product list again once the cached copy is an hour old', async () => {
    const endpoint = mockProductListEndpoint()
    await getProducts()

    vi.setSystemTime(Date.now() + ONE_HOUR)
    await getProducts()

    expect(endpoint).toHaveBeenCalledTimes(2)
  })

  it('caches the details of each product separately', async () => {
    const endpoint = mockProductDetailEndpoint()

    await getProduct('first-id')
    await getProduct('second-id')
    const firstProductAgain = await getProduct('first-id')

    expect(firstProductAgain.id).toBe('first-id')
    expect(endpoint).toHaveBeenCalledTimes(2)
  })

  it('shares a single request between simultaneous calls', async () => {
    const endpoint = mockProductListEndpoint()

    const [first, second] = await Promise.all([getProducts(), getProducts()])

    expect(second).toEqual(first)
    expect(endpoint).toHaveBeenCalledTimes(1)
  })

  it('does not cache failed requests, so they can be retried', async () => {
    const endpoint = mockProductListEndpoint()
    server.use(
      http.get(
        `${API_BASE_URL}/api/product`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    )

    await expect(getProducts()).rejects.toBeInstanceOf(ApiError)
    await expect(getProducts()).resolves.toHaveLength(rawProductList.length)
    expect(endpoint).toHaveBeenCalledTimes(1)
  })
})

describe('resetProductService', () => {
  it('forgets requests still in flight, so a hanging one is not reused', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/product`, () => new Promise(() => {}), {
        once: true,
      }),
    )
    getProducts()

    resetProductService()
    mockProductListEndpoint()

    await expect(getProducts()).resolves.toHaveLength(rawProductList.length)
  })
})
