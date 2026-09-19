import { useSyncExternalStore } from 'react'
import { cartStore } from '../store/cartStore.js'

/** Lines in the cart, kept up to date across the app (and browser tabs). */
export function useCartItems() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getItems)
}
