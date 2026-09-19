const NUMBER = String.raw`(\d+(?:\.\d+)?)`

// Each highlight reads one figure out of the free text sent by the API. When
// the text does not contain it, the highlight is left out rather than showing
// a guess; the full specifications table always shows the original text.
const HIGHLIGHTS = [
  {
    key: 'screen',
    label: 'Pantalla',
    source: (specs) => specs.displaySize,
    pattern: new RegExp(`${NUMBER}\\s*inch`, 'i'),
    format: ([, size]) => `${size}″`,
  },
  {
    key: 'battery',
    label: 'Batería',
    source: (specs) => specs.battery,
    pattern: new RegExp(`${NUMBER}\\s*mAh`, 'i'),
    format: ([, capacity]) => `${capacity} mAh`,
  },
  {
    key: 'camera',
    label: 'Cámara',
    source: (specs) => specs.primaryCamera[0],
    pattern: new RegExp(`${NUMBER}\\s*MP`, 'i'),
    format: ([, megapixels]) => `${megapixels} MP`,
  },
  {
    key: 'ram',
    label: 'RAM',
    source: (specs) => specs.ram,
    pattern: new RegExp(`${NUMBER}\\s*(GB|MB)`, 'i'),
    format: ([, amount, unit]) => `${amount} ${unit.toUpperCase()}`,
  },
]

/** Key figures of a product (screen, battery, camera and RAM) when known. */
export function getSpecHighlights(specs) {
  return HIGHLIGHTS.flatMap(({ key, label, source, pattern, format }) => {
    const match = source(specs)?.match(pattern)
    return match ? [{ key, label, value: format(match) }] : []
  })
}
