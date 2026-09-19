import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { API_BASE_URL } from '../api/config.js'
import { rawProductDetail, rawProductList } from './fixtures/products.js'
import { server } from './server.js'

// Helpers to declare API responses in tests. Each one returns the resolver
// as a mock function, so tests can assert how many requests reached the API
// and what they contained.

export const mockProductListEndpoint = (products = rawProductList) => {
  const resolver = vi.fn(() => HttpResponse.json(products))
  server.use(http.get(`${API_BASE_URL}/api/product`, resolver))
  return resolver
}

export const mockProductDetailEndpoint = (product = rawProductDetail) => {
  const resolver = vi.fn(({ params }) =>
    HttpResponse.json({ ...product, id: params.id }),
  )
  server.use(http.get(`${API_BASE_URL}/api/product/:id`, resolver))
  return resolver
}

export const mockCartEndpoint = ({ count = 1 } = {}) => {
  const resolver = vi.fn(() => HttpResponse.json({ count }))
  server.use(http.post(`${API_BASE_URL}/api/cart`, resolver))
  return resolver
}
