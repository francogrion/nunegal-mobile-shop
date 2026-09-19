import { useSyncExternalStore } from 'react'
import { cartStore } from '../store/cartStore.js'

/** Number of products in the cart, kept up to date across the app. */
export function useCartCount() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getCount)
}
