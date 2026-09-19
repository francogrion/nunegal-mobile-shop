import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server.js'
import { API_BASE_URL } from './config.js'
import { ApiError, fetchJson } from './httpClient.js'

describe('fetchJson', () => {
  it('resolves with the JSON body returned by the API', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/product`, () =>
        HttpResponse.json([{ id: 'a1' }]),
      ),
    )

    await expect(fetchJson('/api/product')).resolves.toEqual([{ id: 'a1' }])
  })

  it('sends the request body as JSON', async () => {
    let receivedRequest
    server.use(
      http.post(`${API_BASE_URL}/api/cart`, async ({ request }) => {
        receivedRequest = {
          contentType: request.headers.get('Content-Type'),
          body: await request.json(),
        }
        return HttpResponse.json({ count: 1 })
      }),
    )

    await fetchJson('/api/cart', {
      method: 'POST',
      body: { id: 'a1', colorCode: 1000, storageCode: 2000 },
    })

    expect(receivedRequest).toEqual({
      contentType: 'application/json',
      body: { id: 'a1', colorCode: 1000, storageCode: 2000 },
    })
  })

  it.each([404, 500])(
    'rejects with an ApiError when the API responds with status %i',
    async (status) => {
      server.use(
        http.get(
          `${API_BASE_URL}/api/product/unknown`,
          () => new HttpResponse(null, { status }),
        ),
      )

      const error = await fetchJson('/api/product/unknown').catch((e) => e)

      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(status)
    },
  )

  it('rejects with an ApiError without status when the network fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/product`, () => HttpResponse.error()),
    )

    const error = await fetchJson('/api/product').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBeNull()
  })
})
