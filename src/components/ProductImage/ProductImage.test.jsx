import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProductImage from './ProductImage.jsx'

const SRC = 'https://itx-frontend-test.onrender.com/images/phone.jpg'

describe('ProductImage', () => {
  it('shows the product image', () => {
    render(<ProductImage src={SRC} alt="Acer Iconia Talk S" />)

    expect(
      screen.getByRole('img', { name: 'Acer Iconia Talk S' }),
    ).toHaveAttribute('src', SRC)
  })

  it('shows a placeholder with the same accessible name when the image fails to load', () => {
    render(<ProductImage src={SRC} alt="Acer Iconia Talk S" />)

    fireEvent.error(screen.getByRole('img', { name: 'Acer Iconia Talk S' }))

    const placeholder = screen.getByRole('img', { name: 'Acer Iconia Talk S' })
    expect(placeholder).not.toHaveAttribute('src')
    expect(placeholder).toHaveTextContent('Imagen no disponible')
  })

  it('keeps the placeholder of a decorative image hidden from screen readers', () => {
    render(<ProductImage src={SRC} alt="" />)

    fireEvent.error(screen.getByRole('presentation'))

    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
  })

  it('tries to load a new image after a previous one failed', () => {
    const { rerender } = render(<ProductImage src={SRC} alt="Phone" />)
    fireEvent.error(screen.getByRole('img', { name: 'Phone' }))

    rerender(<ProductImage src={`${SRC}?v=2`} alt="Phone" />)

    expect(screen.getByRole('img', { name: 'Phone' })).toHaveAttribute(
      'src',
      `${SRC}?v=2`,
    )
  })
})
