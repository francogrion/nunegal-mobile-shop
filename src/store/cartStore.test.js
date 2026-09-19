import { describe, expect, it, vi } from 'vitest'
import { createCartStore } from './cartStore.js'

const KEY = 'test:cart'

const iconia32Black = {
  productId: 'ZmGrkLRPXOTpxsU4jjAcv',
  brand: 'Acer',
  model: 'Iconia Talk S',
  imageUrl: 'https://itx-frontend-test.onrender.com/images/iconia.jpg',
  price: 170,
  storageCode: 2001,
  storageName: '32 GB',
  colorCode: 1000,
  colorName: 'Black',
}
const iconia16Black = {
  ...iconia32Black,
  storageCode: 2000,
  storageName: '16 GB',
}

describe('createCartStore', () => {
  it('starts with an empty cart', () => {
    const store = createCartStore({ key: KEY })

    expect(store.getItems()).toEqual([])
    expect(store.getCount()).toBe(0)
  })

  it('adds a product variant as a cart line with the given quantity', () => {
    const store = createCartStore({ key: KEY })

    store.add(iconia32Black, 1)

    expect(store.getItems()).toEqual([
      {
        ...iconia32Black,
        lineId: 'ZmGrkLRPXOTpxsU4jjAcv:2001:1000',
        quantity: 1,
      },
    ])
  })

  it('adds up repeated additions of the same variant in a single line', () => {
    const store = createCartStore({ key: KEY })

    store.add(iconia32Black, 1)
    store.add(iconia32Black, 2)

    expect(store.getItems()).toHaveLength(1)
    expect(store.getItems()[0].quantity).toBe(3)
  })

  it('keeps different variants of a product in separate lines', () => {
    const store = createCartStore({ key: KEY })

    store.add(iconia32Black, 1)
    store.add(iconia16Black, 1)

    expect(store.getItems().map(({ storageName }) => storageName)).toEqual([
      '32 GB',
      '16 GB',
    ])
  })

  it('counts every unit in the cart', () => {
    const store = createCartStore({ key: KEY })

    store.add(iconia32Black, 2)
    store.add(iconia16Black, 1)

    expect(store.getCount()).toBe(3)
  })

  it('removes a line from the cart', () => {
    const store = createCartStore({ key: KEY })
    store.add(iconia32Black, 2)
    store.add(iconia16Black, 1)

    store.remove('ZmGrkLRPXOTpxsU4jjAcv:2001:1000')

    expect(store.getItems().map(({ storageName }) => storageName)).toEqual([
      '16 GB',
    ])
    expect(store.getCount()).toBe(1)
  })

  it('subtracts one unit from a line', () => {
    const store = createCartStore({ key: KEY })
    store.add(iconia32Black, 3)

    store.decrease('ZmGrkLRPXOTpxsU4jjAcv:2001:1000')

    expect(store.getItems()[0].quantity).toBe(2)
    expect(store.getCount()).toBe(2)
  })

  it('removes a line when subtracting its last unit', () => {
    const store = createCartStore({ key: KEY })
    store.add(iconia32Black, 1)
    store.add(iconia16Black, 1)

    store.decrease('ZmGrkLRPXOTpxsU4jjAcv:2001:1000')

    expect(store.getItems().map(({ storageName }) => storageName)).toEqual([
      '16 GB',
    ])
  })

  it('empties the cart', () => {
    const store = createCartStore({ key: KEY })
    store.add(iconia32Black, 2)

    store.clear()

    expect(store.getItems()).toEqual([])
    expect(store.getCount()).toBe(0)
  })

  it('persists the cart so it survives a page reload', () => {
    createCartStore({ key: KEY }).add(iconia32Black, 2)

    const storeAfterReload = createCartStore({ key: KEY })

    expect(storeAfterReload.getItems()).toEqual([
      expect.objectContaining({ model: 'Iconia Talk S', quantity: 2 }),
    ])
  })

  it('notifies subscribers when the cart changes until they unsubscribe', () => {
    const store = createCartStore({ key: KEY })
    const listener = vi.fn()

    const unsubscribe = store.subscribe(listener)
    store.add(iconia32Black, 1)
    store.remove('ZmGrkLRPXOTpxsU4jjAcv:2001:1000')
    store.clear()
    unsubscribe()
    store.add(iconia32Black, 1)

    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('returns the same list of lines until the cart changes', () => {
    const store = createCartStore({ key: KEY })
    store.add(iconia32Black, 1)

    const before = store.getItems()

    expect(store.getItems()).toBe(before)
    store.add(iconia32Black, 1)
    expect(store.getItems()).not.toBe(before)
  })

  it.each([
    ['malformed JSON', '{'],
    ['an object instead of a list', '{"items":[]}'],
    ['the count saved by previous versions', '3'],
  ])('treats %s as an empty cart', (_, storedValue) => {
    localStorage.setItem(KEY, storedValue)

    expect(createCartStore({ key: KEY }).getItems()).toEqual([])
  })

  it('ignores stored lines that are not valid', () => {
    const valid = { ...iconia32Black, lineId: 'a', quantity: 1 }
    localStorage.setItem(
      KEY,
      JSON.stringify([valid, { ...valid, quantity: 0 }, { model: 'Unknown' }]),
    )

    expect(createCartStore({ key: KEY }).getItems()).toEqual([valid])
  })

  it('keeps the cart in memory when storage is not available', () => {
    const failingStorage = {
      getItem: () => {
        throw new DOMException('Access denied', 'SecurityError')
      },
      setItem: () => {
        throw new DOMException('Access denied', 'SecurityError')
      },
    }
    const store = createCartStore({ key: KEY, storage: failingStorage })

    store.add(iconia32Black, 1)
    store.add(iconia16Black, 2)

    expect(store.getCount()).toBe(3)
  })

  it('picks up the cart updated from another browser tab', () => {
    const store = createCartStore({ key: KEY })
    const listener = vi.fn()
    store.subscribe(listener)

    // Another tab writes the storage and the browser fires a `storage` event
    const otherTabCart = [{ ...iconia32Black, lineId: 'a', quantity: 5 }]
    localStorage.setItem(KEY, JSON.stringify(otherTabCart))
    window.dispatchEvent(new StorageEvent('storage', { key: KEY }))

    expect(listener).toHaveBeenCalled()
    expect(store.getCount()).toBe(5)
  })

  it('empties the cart when another tab clears the storage', () => {
    const store = createCartStore({ key: KEY })
    store.add(iconia32Black, 3)
    const listener = vi.fn()
    store.subscribe(listener)

    // Clearing the whole storage fires a `storage` event with a null key
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))

    expect(listener).toHaveBeenCalled()
    expect(store.getCount()).toBe(0)
  })
})
