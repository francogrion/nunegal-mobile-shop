import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useResource } from './useResource.js'

describe('useResource', () => {
  it('starts loading and then exposes the loaded data', async () => {
    const load = vi.fn((id) => Promise.resolve({ id }))

    const { result } = renderHook(() => useResource(load, 'a1'))

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.data).toEqual({ id: 'a1' })
    expect(load).toHaveBeenCalledWith('a1')
  })

  it('exposes the error when loading fails and loads again on retry', async () => {
    const failure = new Error('Network error')
    const load = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(['product'])

    const { result } = renderHook(() => useResource(load))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe(failure)

    act(() => result.current.retry())

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.data).toEqual(['product'])
  })

  it('shows the loading state again while a new key is loaded', async () => {
    const load = vi.fn((id) => Promise.resolve({ id }))
    const { result, rerender } = renderHook(({ id }) => useResource(load, id), {
      initialProps: { id: 'a1' },
    })
    await waitFor(() => expect(result.current.data).toEqual({ id: 'a1' }))

    rerender({ id: 'b2' })

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.data).toEqual({ id: 'b2' }))
  })

  it('ignores the result of a request that is no longer current', async () => {
    const requests = {
      a1: Promise.withResolvers(),
      b2: Promise.withResolvers(),
    }
    const load = vi.fn((id) => requests[id].promise)
    const { result, rerender } = renderHook(({ id }) => useResource(load, id), {
      initialProps: { id: 'a1' },
    })

    rerender({ id: 'b2' })
    await act(async () => requests.b2.resolve({ id: 'b2' }))
    await act(async () => requests.a1.resolve({ id: 'a1' }))

    expect(result.current.data).toEqual({ id: 'b2' })
  })
})
