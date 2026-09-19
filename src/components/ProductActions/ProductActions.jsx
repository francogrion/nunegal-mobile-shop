import { useState } from 'react'
import { useAddToCart } from '../../hooks/useAddToCart.js'
import OptionSelector from '../OptionSelector/OptionSelector.jsx'
import styles from './ProductActions.module.css'

// When a product has a single option it is shown and selected by default.
const defaultCode = (options) => (options.length === 1 ? options[0].code : null)

function ProductActions({ product }) {
  const { colors, storages } = product.options
  const [storageCode, setStorageCode] = useState(() => defaultCode(storages))
  const [colorCode, setColorCode] = useState(() => defaultCode(colors))
  const { status, add, reset } = useAddToCart()

  const isComplete = storageCode !== null && colorCode !== null
  const isAdding = status === 'adding'

  const handleAdd = () => {
    add({ id: product.id, colorCode, storageCode })
  }

  // A previous confirmation no longer applies to a different selection.
  const selectStorage = (code) => {
    setStorageCode(code)
    reset()
  }

  const selectColor = (code) => {
    setColorCode(code)
    reset()
  }

  return (
    <div className={styles.actions}>
      <OptionSelector
        label="Almacenamiento"
        options={storages}
        selectedCode={storageCode}
        onSelect={selectStorage}
      />
      <OptionSelector
        label="Color"
        options={colors}
        selectedCode={colorCode}
        onSelect={selectColor}
      />

      <button
        type="button"
        className={styles.addButton}
        disabled={!isComplete || isAdding}
        onClick={handleAdd}
      >
        {isAdding ? 'Añadiendo…' : 'Añadir a la cesta'}
      </button>

      <div className={styles.messages}>
        {!isComplete && (
          <p className={styles.hint}>
            Elige almacenamiento y color para añadirlo a la cesta.
          </p>
        )}
        <p role="status">
          {status === 'added' && 'Producto añadido a la cesta.'}
        </p>
        {status === 'error' && (
          <p role="alert" className={styles.error}>
            No se ha podido añadir el producto a la cesta. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductActions
