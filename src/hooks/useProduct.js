import { getProduct } from '../api/products.js'
import { useResource } from './useResource.js'

/** Loads the details of a product. See `useResource` for the returned state. */
export function useProduct(id) {
  const { data, ...state } = useResource(getProduct, id)
  return { ...state, product: data }
}
