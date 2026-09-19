/**
 * Adapters from the raw API payloads to the models used by the app.
 *
 * The API has a few quirks (typos in field names, swapped fields, prices as
 * text, values that are sometimes lists and sometimes plain text...). They are
 * all fixed here so components can rely on a clean, predictable shape.
 */

const toText = (value) => {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text === '' ? null : text
}

const toNumber = (value) => {
  const text = typeof value === 'number' ? String(value) : toText(value)
  if (text === null) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

const toList = (value) => {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

const toOptions = (options = []) =>
  options.map(({ code, name }) => ({ code, name }))

export function normalizeProductSummary(raw) {
  return {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    price: toNumber(raw.price),
    imageUrl: raw.imgUrl,
  }
}

export function normalizeProductDetail(raw) {
  return {
    ...normalizeProductSummary(raw),
    specs: {
      cpu: toText(raw.cpu),
      ram: toText(raw.ram),
      os: toText(raw.os),
      // The API swaps these two fields: `displaySize` holds the resolution in
      // pixels and `displayResolution` the diagonal size in inches.
      displayResolution: toText(raw.displaySize),
      displaySize: toText(raw.displayResolution),
      battery: toText(raw.battery),
      primaryCamera: toList(raw.primaryCamera),
      secondaryCamera: toList(raw.secondaryCmera),
      dimensions: toText(raw.dimentions),
      weight: toNumber(raw.weight),
    },
    options: {
      colors: toOptions(raw.options?.colors),
      storages: toOptions(raw.options?.storages),
    },
  }
}
