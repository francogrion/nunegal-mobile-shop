import { describe, expect, it } from 'vitest'
import { toSwatchColor } from './toSwatchColor.js'

// Stand-in for CSS.supports that knows a couple of named colors
const supports = (property, value) =>
  property === 'color' && ['black', 'lightblue'].includes(value)

describe('toSwatchColor', () => {
  it.each([
    ['Black', 'black'],
    ['Light Blue', 'lightblue'],
  ])('turns the color name %s into the CSS color %s', (name, expected) => {
    expect(toSwatchColor(name, supports)).toBe(expected)
  })

  it('returns null for names that are not CSS colors', () => {
    expect(toSwatchColor('Rose Gold', supports)).toBeNull()
  })

  it('returns null when the browser cannot validate colors', () => {
    expect(toSwatchColor('Black', null)).toBeNull()
  })
})
