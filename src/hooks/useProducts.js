import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '../api/products.js'

const LOADING = { status: 'loading', products: [], error: null }

/**
 * Loads the product list and exposes its loading state. `retry` requests
 * the list again after a failure.
 */
export function useProducts() {
  const [state, setState] = useState(LOADING)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false
    getProducts().then(
      (products) => {
        if (!ignore) setState({ status: 'success', products, error: null })
      },
      (error) => {
        if (!ignore) setState({ status: 'error', products: [], error })
      },
    )
    return () => {
      ignore = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState(LOADING)
    setAttempt((previous) => previous + 1)
  }, [])

  return { ...state, retry }
}
