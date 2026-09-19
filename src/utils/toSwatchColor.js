const browserSupports = globalThis.CSS?.supports?.bind(globalThis.CSS)

/**
 * CSS color for a product color name (e.g. "Light Blue" → "lightblue"), or
 * null when the name is not a color the browser knows. Validating the name
 * also guarantees API text never reaches the styles unchecked.
 */
export function toSwatchColor(name, supports = browserSupports) {
  if (!supports) return null
  const color = name.trim().toLowerCase().replace(/\s+/g, '')
  return supports('color', color) ? color : null
}
