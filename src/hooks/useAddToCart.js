import { useCallback, useState } from 'react'
import { addToCart } from '../api/products.js'
import { cartStore } from '../store/cartStore.js'

/**
 * Adds a product with the chosen storage and color ({ code, name }) to the
 * cart through the API and stores the line in the client cart. `status` is
 * 'idle', 'adding', 'added' or 'error'; `reset` goes back to 'idle' (e.g.
 * when the selection changes).
 */
export function useAddToCart() {
  const [status, setStatus] = useState('idle')

  const add = useCallback(async ({ product, storage, color }) => {
    setStatus('adding')
    try {
      // The API is stateless and always answers `{ count: 1 }`, so the count
      // it returns is added to the quantity kept in the client cart.
      const count = await addToCart({
        id: product.id,
        colorCode: color.code,
        storageCode: storage.code,
      })
      cartStore.add(
        {
          productId: product.id,
          brand: product.brand,
          model: product.model,
          imageUrl: product.imageUrl,
          price: product.price,
          storageCode: storage.code,
          storageName: storage.name,
          colorCode: color.code,
          colorName: color.name,
        },
        count,
      )
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
