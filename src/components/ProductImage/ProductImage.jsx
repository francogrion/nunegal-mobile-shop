import { useState } from 'react'
import styles from './ProductImage.module.css'

/**
 * Product image that falls back to a placeholder when it cannot be loaded.
 * An empty `alt` marks the image (and its placeholder) as decorative.
 */
function ProductImage({ src, alt, className = '', loading = 'lazy' }) {
  // Remembering which source failed (instead of a boolean) makes a new `src`
  // be tried again without resetting any state.
  const [failedSrc, setFailedSrc] = useState(null)

  if (failedSrc === src) {
    const accessibility = alt
      ? { role: 'img', 'aria-label': alt }
      : { 'aria-hidden': true }
    return (
      <div className={`${className} ${styles.placeholder}`} {...accessibility}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect
            x="6"
            y="2"
            width="12"
            height="20"
            rx="2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="18.5" r="1" fill="currentColor" />
        </svg>
        <span aria-hidden="true">Imagen no disponible</span>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailedSrc(src)}
    />
  )
}

export default ProductImage
