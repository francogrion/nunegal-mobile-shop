import { createCache } from './cache.js'
import { CACHE_TTL_MS } from './config.js'
import { fetchJson } from './httpClient.js'
import {
  normalizeProductDetail,
  normalizeProductSummary,
} from './normalizers.js'

const cache = createCache({ namespace: 'mobile-shop:api', ttl: CACHE_TTL_MS })
const pendingRequests = new Map()

// Raw responses are cached (not the normalized models), so a change in the
// normalizers never has to deal with stale shapes stored by a previous version.
// Simultaneous calls for the same path share one request, and failed requests
// are never cached so they can be retried.
function fetchCached(path) {
  const cached = cache.get(path)
  if (cached !== null) return Promise.resolve(cached)

  if (!pendingRequests.has(path)) {
    const request = fetchJson(path)
      .then((data) => {
        cache.set(path, data)
        return data
      })
      .finally(() => pendingRequests.delete(path))
    pendingRequests.set(path, request)
  }
  return pendingRequests.get(path)
}

export async function getProducts() {
  const products = await fetchCached('/api/product')
  return products.map(normalizeProductSummary)
}

export async function getProduct(id) {
  const product = await fetchCached(`/api/product/${id}`)
  return normalizeProductDetail(product)
}

export async function addToCart({ id, colorCode, storageCode }) {
  const { count } = await fetchJson('/api/cart', {
    method: 'POST',
    body: { id, colorCode, storageCode },
  })
  return count
}
