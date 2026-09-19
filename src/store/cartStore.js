import { getLocalStorage } from '../utils/getLocalStorage.js'

export const CART_STORAGE_KEY = 'mobile-shop:cart-count'

const parseCount = (value) => {
  const count = Number(value)
  return Number.isInteger(count) && count >= 0 ? count : 0
}

/**
 * Number of products in the cart, persisted in Web Storage so it survives
 * page reloads and is shared between browser tabs. Components read it with
 * `useSyncExternalStore(store.subscribe, store.getCount)`.
 *
 * When storage is not available, the count is kept in memory for the
 * current session instead.
 */
export function createCartStore({
  key = CART_STORAGE_KEY,
  storage = getLocalStorage(),
} = {}) {
  const listeners = new Set()
  let memoryCount = null

  const readStoredCount = () => {
    try {
      return parseCount(storage.getItem(key) ?? 0)
    } catch {
      return 0
    }
  }

  const notify = () => listeners.forEach((listener) => listener())

  const getCount = () => memoryCount ?? readStoredCount()

  const add = (amount) => {
    const count = getCount() + amount
    try {
      storage.setItem(key, String(count))
    } catch {
      memoryCount = count
    }
    notify()
  }

  const subscribe = (listener) => {
    // Other tabs changing the count fire a `storage` event in this one.
    const onStorage = (event) => {
      if (event.key === key || event.key === null) listener()
    }
    listeners.add(listener)
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  }

  return { getCount, add, subscribe }
}

export const cartStore = createCartStore()
