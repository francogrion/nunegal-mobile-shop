import { getProducts } from '../api/products.js'
import { useResource } from './useResource.js'

/** Loads the product list. See `useResource` for the returned state. */
export function useProducts() {
  const { data, ...state } = useResource(getProducts)
  return { ...state, products: data ?? [] }
}
