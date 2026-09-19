import { getLocalStorage } from '../utils/getLocalStorage.js'

/**
 * Key-value cache persisted in Web Storage whose entries expire after `ttl`
 * milliseconds.
 *
 * The cache is only an optimisation: any storage failure (quota exceeded,
 * storage disabled, corrupted entries...) is treated as a cache miss instead
 * of breaking the app.
 */
export function createCache({ namespace, ttl, storage = getLocalStorage() }) {
  const storageKey = (key) => `${namespace}:${key}`

  const readEntry = (key) => {
    try {
      const entry = JSON.parse(storage.getItem(storageKey(key)))
      return Number.isFinite(entry?.expiresAt) ? entry : null
    } catch {
      return null
    }
  }

  const removeEntry = (key) => {
    try {
      storage.removeItem(storageKey(key))
    } catch {
      // Nothing else to do: the entry will be ignored once it has expired.
    }
  }

  return {
    get(key) {
      const entry = readEntry(key)
      if (entry === null) return null

      if (Date.now() >= entry.expiresAt) {
        removeEntry(key)
        return null
      }
      return entry.value
    },

    set(key, value) {
      const entry = { value, expiresAt: Date.now() + ttl }
      try {
        storage.setItem(storageKey(key), JSON.stringify(entry))
      } catch {
        // Without storage the app keeps working, it just requests data again.
      }
    },
  }
}
