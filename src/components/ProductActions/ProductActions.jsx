import { useState } from 'react'
import OptionSelector from '../OptionSelector/OptionSelector.jsx'
import styles from './ProductActions.module.css'

// When a product has a single option it is shown and selected by default.
const defaultCode = (options) => (options.length === 1 ? options[0].code : null)

function ProductActions({ product }) {
  const { colors, storages } = product.options
  const [storageCode, setStorageCode] = useState(() => defaultCode(storages))
  const [colorCode, setColorCode] = useState(() => defaultCode(colors))

  return (
    <div className={styles.actions}>
      <OptionSelector
        label="Almacenamiento"
        options={storages}
        selectedCode={storageCode}
        onSelect={setStorageCode}
      />
      <OptionSelector
        label="Color"
        options={colors}
        selectedCode={colorCode}
        onSelect={setColorCode}
      />
    </div>
  )
}

export default ProductActions
