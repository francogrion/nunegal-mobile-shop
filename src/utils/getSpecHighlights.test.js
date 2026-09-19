import { describe, expect, it } from 'vitest'
import { normalizeProductDetail } from '../api/normalizers.js'
import { rawProductDetail } from '../test/fixtures/products.js'
import { getSpecHighlights } from './getSpecHighlights.js'

const { specs } = normalizeProductDetail(rawProductDetail)

describe('getSpecHighlights', () => {
  it('extracts the key figures from the texts sent by the API', () => {
    expect(getSpecHighlights(specs)).toEqual([
      { key: 'screen', label: 'Pantalla', value: '7.0″' },
      { key: 'battery', label: 'Batería', value: '3400 mAh' },
      { key: 'camera', label: 'Cámara', value: '13 MP' },
      { key: 'ram', label: 'RAM', value: '2 GB' },
    ])
  })

  it.each([
    ['a decimal screen size', { displaySize: '5.5 inches' }, '5.5″'],
    [
      'a camera described in text',
      { primaryCamera: ['Dual 12.2 MP + 2 MP'] },
      '12.2 MP',
    ],
    ['memory in megabytes', { ram: '512 MB RAM' }, '512 MB'],
  ])('reads %s', (_, overrides, expected) => {
    const values = getSpecHighlights({ ...specs, ...overrides }).map(
      ({ value }) => value,
    )

    expect(values).toContain(expected)
  })

  it('leaves out the figures that are missing or cannot be read', () => {
    const highlights = getSpecHighlights({
      ...specs,
      displaySize: null,
      battery: 'Removable Li-Ion battery',
      primaryCamera: [],
    })

    expect(highlights).toEqual([{ key: 'ram', label: 'RAM', value: '2 GB' }])
  })
})
