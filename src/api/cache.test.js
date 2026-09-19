import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCache } from './cache.js'

const ONE_HOUR = 60 * 60 * 1000

describe('createCache', () => {
  it('returns null for a key that was never stored', () => {
    const cache = createCache({ namespace: 'test', ttl: ONE_HOUR })

    expect(cache.get('products')).toBeNull()
  })

  it('returns a stored value', () => {
    const cache = createCache({ namespace: 'test', ttl: ONE_HOUR })

    cache.set('products', [{ id: 'a1' }])

    expect(cache.get('products')).toEqual([{ id: 'a1' }])
  })

  it('persists values so they survive a page reload', () => {
    createCache({ namespace: 'test', ttl: ONE_HOUR }).set('products', [
      { id: 'a1' },
    ])

    const cacheAfterReload = createCache({ namespace: 'test', ttl: ONE_HOUR })

    expect(cacheAfterReload.get('products')).toEqual([{ id: 'a1' }])
  })

  describe('expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-09-19T10:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('keeps returning the value until the ttl has elapsed', () => {
      const cache = createCache({ namespace: 'test', ttl: ONE_HOUR })
      cache.set('products', [{ id: 'a1' }])

      vi.setSystemTime(Date.now() + ONE_HOUR - 1)

      expect(cache.get('products')).toEqual([{ id: 'a1' }])
    })

    it('returns null once the ttl has elapsed', () => {
      const cache = createCache({ namespace: 'test', ttl: ONE_HOUR })
      cache.set('products', [{ id: 'a1' }])

      vi.setSystemTime(Date.now() + ONE_HOUR)

      expect(cache.get('products')).toBeNull()
    })

    it('removes expired entries from storage', () => {
      const cache = createCache({ namespace: 'test', ttl: ONE_HOUR })
      cache.set('products', [{ id: 'a1' }])

      vi.setSystemTime(Date.now() + ONE_HOUR)
      cache.get('products')

      expect(localStorage.length).toBe(0)
    })
  })

  describe('resilience', () => {
    it.each([
      ['malformed JSON', '{not json'],
      ['a JSON null', 'null'],
      ['a value without expiration data', '"legacy-format"'],
    ])('treats an entry containing %s as missing', (_, storedEntry) => {
      localStorage.setItem('test:products', storedEntry)
      const cache = createCache({ namespace: 'test', ttl: ONE_HOUR })

      expect(cache.get('products')).toBeNull()
    })

    it('keeps working without cache when storage throws', () => {
      const failingStorage = {
        getItem: () => {
          throw new DOMException('Access denied', 'SecurityError')
        },
        setItem: () => {
          throw new DOMException('Storage is full', 'QuotaExceededError')
        },
        removeItem: () => {
          throw new DOMException('Access denied', 'SecurityError')
        },
      }
      const cache = createCache({
        namespace: 'test',
        ttl: ONE_HOUR,
        storage: failingStorage,
      })

      expect(() => cache.set('products', [{ id: 'a1' }])).not.toThrow()
      expect(cache.get('products')).toBeNull()
    })

    describe('when the browser blocks access to localStorage', () => {
      beforeEach(() => {
        // e.g. Safari with cookies blocked throws on property access
        vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => {
          throw new DOMException('Access denied', 'SecurityError')
        })
      })

      afterEach(() => {
        vi.restoreAllMocks()
      })

      it('keeps working without cache', () => {
        const createDefaultCache = () =>
          createCache({ namespace: 'test', ttl: ONE_HOUR })

        expect(createDefaultCache).not.toThrow()
        const cache = createDefaultCache()
        expect(() => cache.set('products', [{ id: 'a1' }])).not.toThrow()
        expect(cache.get('products')).toBeNull()
      })
    })
  })
})
