import { useEffect, useState } from 'react'

/** Time after which a pending request is considered slow. */
export const SLOW_LOADING_DELAY_MS = 3000

/**
 * Tells whether something has been pending for longer than `delayMs`, e.g.
 * to explain that the API may be waking up from a cold start.
 */
export function useIsSlow(isPending, delayMs = SLOW_LOADING_DELAY_MS) {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isPending) return undefined
    const timer = setTimeout(() => setIsSlow(true), delayMs)
    return () => {
      clearTimeout(timer)
      setIsSlow(false)
    }
  }, [isPending, delayMs])

  return isPending && isSlow
}
