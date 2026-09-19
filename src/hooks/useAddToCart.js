import { useCallback, useState } from 'react'
import { addToCart } from '../api/products.js'
import { cartStore } from '../store/cartStore.js'

/**
 * Adds a product selection to the cart through the API and updates the cart
 * count. `status` is 'idle', 'adding', 'added' or 'error'; `reset` goes back
 * to 'idle' (e.g. when the selection changes).
 */
export function useAddToCart() {
  const [status, setStatus] = useState('idle')

  const add = useCallback(async (selection) => {
    setStatus('adding')
    try {
      // The API is stateless and always answers `{ count: 1 }`, so the count
      // it returns is added to the one kept in the client.
      const count = await addToCart(selection)
      cartStore.add(count)
      setStatus('added')
    } catch {
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus((current) => (current === 'adding' ? current : 'idle'))
  }, [])

  return { status, add, reset }
}
