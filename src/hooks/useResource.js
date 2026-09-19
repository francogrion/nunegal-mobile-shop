import { useCallback, useEffect, useState } from 'react'

const LOADING = { status: 'loading', data: null, error: null }

/**
 * Loads async data with `load(key)` and exposes its state: `status` is
 * 'loading', 'success' or 'error'. Data is loaded again whenever `key`
 * changes, and `retry` requests it again after a failure.
 *
 * `load` must be a stable function (e.g. defined at module level).
 */
export function useResource(load, key) {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Results of a request that is no longer current (the key changed or
    // the component unmounted) are ignored.
    let ignore = false
    const settle = (outcome) => {
      if (!ignore) setResult({ key, attempt, ...outcome })
    }

    load(key).then(
      (data) => settle({ status: 'success', data, error: null }),
      (error) => settle({ status: 'error', data: null, error }),
    )
    return () => {
      ignore = true
    }
  }, [load, key, attempt])

  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1)
  }, [])

  // The loading state is derived: until the result matches the current key
  // and attempt, the data being shown would be outdated.
  const isCurrent = result?.key === key && result?.attempt === attempt
  const { status, data, error } = isCurrent ? result : LOADING

  return { status, data, error, retry }
}
