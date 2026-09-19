import { describe, expect, it, vi } from 'vitest'
import { createCartStore } from './cartStore.js'

const KEY = 'test:cart-count'

describe('createCartStore', () => {
  it('starts with an empty cart', () => {
    const store = createCartStore({ key: KEY })

    expect(store.getCount()).toBe(0)
  })

  it('adds the given amount of products to the count', () => {
    const store = createCartStore({ key: KEY })

    store.add(1)
    store.add(2)

    expect(store.getCount()).toBe(3)
  })

  it('persists the count so it survives a page reload', () => {
    createCartStore({ key: KEY }).add(2)

    const storeAfterReload = createCartStore({ key: KEY })

    expect(storeAfterReload.getCount()).toBe(2)
  })

  it('notifies subscribers when the count changes until they unsubscribe', () => {
    const store = createCartStore({ key: KEY })
    const listener = vi.fn()

    const unsubscribe = store.subscribe(listener)
    store.add(1)
    unsubscribe()
    store.add(1)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['text', 'many'],
    ['a negative number', '-2'],
    ['a decimal number', '1.5'],
  ])('treats a stored %s as an empty cart', (_, storedValue) => {
    localStorage.setItem(KEY, storedValue)

    expect(createCartStore({ key: KEY }).getCount()).toBe(0)
  })

  it('keeps counting in memory when storage is not available', () => {
    const failingStorage = {
      getItem: () => {
        throw new DOMException('Access denied', 'SecurityError')
      },
      setItem: () => {
        throw new DOMException('Access denied', 'SecurityError')
      },
    }
    const store = createCartStore({ key: KEY, storage: failingStorage })

    store.add(1)
    store.add(2)

    expect(store.getCount()).toBe(3)
  })

  it('picks up the count updated from another browser tab', () => {
    const store = createCartStore({ key: KEY })
    const listener = vi.fn()
    store.subscribe(listener)

    // Another tab writes the storage and the browser fires a `storage` event
    localStorage.setItem(KEY, '5')
    window.dispatchEvent(
      new StorageEvent('storage', { key: KEY, newValue: '5' }),
    )

    expect(listener).toHaveBeenCalled()
    expect(store.getCount()).toBe(5)
  })
})
