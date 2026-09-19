import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsSlow } from './useIsSlow.js'

const DELAY = 3000

describe('useIsSlow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('becomes true once the delay elapses while something is pending', () => {
    const { result } = renderHook(() => useIsSlow(true, DELAY))

    act(() => vi.advanceTimersByTime(DELAY - 1))
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it('stays false when nothing is pending', () => {
    const { result } = renderHook(() => useIsSlow(false, DELAY))

    act(() => vi.advanceTimersByTime(DELAY))

    expect(result.current).toBe(false)
  })

  it('starts counting again for every new pending period', () => {
    const { result, rerender } = renderHook(
      ({ isPending }) => useIsSlow(isPending, DELAY),
      { initialProps: { isPending: true } },
    )
    act(() => vi.advanceTimersByTime(DELAY))
    expect(result.current).toBe(true)

    rerender({ isPending: false })
    expect(result.current).toBe(false)

    rerender({ isPending: true })
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(DELAY))
    expect(result.current).toBe(true)
  })
})
