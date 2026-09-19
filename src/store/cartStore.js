import { getLocalStorage } from '../utils/getLocalStorage.js'

export const CART_STORAGE_KEY = 'mobile-shop:cart'

const EMPTY_CART = []

// One line per product variant: adding the same storage and color again
// increases the quantity of the existing line.
const lineIdOf = ({ productId, storageCode, colorCode }) =>
  `${productId}:${storageCode}:${colorCode}`

const isValidLine = (line) =>
  typeof line === 'object' &&
  line !== null &&
  typeof line.lineId === 'string' &&
  typeof line.productId === 'string' &&
  typeof line.brand === 'string' &&
  typeof line.model === 'string' &&
  typeof line.storageName === 'string' &&
  typeof line.colorName === 'string' &&
  Number.isInteger(line.quantity) &&
  line.quantity > 0 &&
  (line.price === null || Number.isFinite(line.price))

// Anything unexpected in storage (corrupted data, the count saved by previous
// versions...) is treated as an empty cart instead of breaking the app.
const parseLines = (serialized) => {
  try {
    const lines = JSON.parse(serialized)
    return Array.isArray(lines) ? lines.filter(isValidLine) : EMPTY_CART
  } catch {
    return EMPTY_CART
  }
}

/**
 * Cart content: one line per product variant with its quantity, persisted in
 * Web Storage so it survives page reloads and is shared between browser tabs.
 * Components read it with `useSyncExternalStore`, which requires `getItems`
 * to return the same list until the cart changes.
 *
 * The API only exposes adding products, so removing lines and emptying the
 * cart happen in the client. When storage is not available, the cart is kept
 * in memory for the current session instead.
 */
export function createCartStore({
  key = CART_STORAGE_KEY,
  storage = getLocalStorage(),
} = {}) {
  const listeners = new Set()
  let memoryLines = null
  let cache = { serialized: null, lines: EMPTY_CART }

  const readSerialized = () => {
    try {
      return storage.getItem(key)
    } catch {
      return null
    }
  }

  const getItems = () => {
    if (memoryLines) return memoryLines
    const serialized = readSerialized()
    if (serialized !== cache.serialized) {
      cache = {
        serialized,
        lines: serialized === null ? EMPTY_CART : parseLines(serialized),
      }
    }
    return cache.lines
  }

  const getCount = () =>
    getItems().reduce((count, line) => count + line.quantity, 0)

  const write = (lines) => {
    try {
      storage.setItem(key, JSON.stringify(lines))
      memoryLines = null
    } catch {
      memoryLines = lines
    }
    listeners.forEach((listener) => listener())
  }

  const add = (product, quantity) => {
    const lineId = lineIdOf(product)
    const lines = getItems()
    const existing = lines.some((line) => line.lineId === lineId)
    write(
      existing
        ? lines.map((line) =>
            line.lineId === lineId
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          )
        : [...lines, { ...product, lineId, quantity }],
    )
  }

  const remove = (lineId) => {
    write(getItems().filter((line) => line.lineId !== lineId))
  }

  // Subtracting the last unit removes the line
  const decrease = (lineId) => {
    write(
      getItems().flatMap((line) => {
        if (line.lineId !== lineId) return [line]
        return line.quantity > 1
          ? [{ ...line, quantity: line.quantity - 1 }]
          : []
      }),
    )
  }

  const clear = () => write(EMPTY_CART)

  const subscribe = (listener) => {
    // Other tabs changing the cart fire a `storage` event in this one.
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

  return { getItems, getCount, add, decrease, remove, clear, subscribe }
}

export const cartStore = createCartStore()
