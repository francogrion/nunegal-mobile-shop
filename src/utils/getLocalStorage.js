/**
 * Returns `localStorage`, or undefined when the browser blocks it. Some
 * browsers throw on the mere access to the property when storage is
 * disabled (e.g. Safari with cookies blocked).
 */
export function getLocalStorage() {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}
