import {
  IconBattery3,
  IconCamera,
  IconDeviceMobile,
  IconStack2,
} from '@tabler/icons-react'
import { getSpecHighlights } from '../../utils/getSpecHighlights.js'
import styles from './ProductHighlights.module.css'

const ICONS = {
  screen: IconDeviceMobile,
  battery: IconBattery3,
  camera: IconCamera,
  ram: IconStack2,
}

/** Key figures of the product; renders nothing when none can be read. */
function ProductHighlights({ specs }) {
  const highlights = getSpecHighlights(specs)
  if (highlights.length === 0) return null

  return (
    <ul className={styles.highlights} aria-label="Especificaciones destacadas">
      {highlights.map(({ key, label, value }) => {
        const Icon = ICONS[key]
        return (
          <li key={key} className={styles.highlight}>
            <Icon
              className={styles.icon}
              size={20}
              stroke={1.8}
              aria-hidden="true"
            />
            <strong className={styles.value}>{value}</strong>{' '}
            <span className={styles.label}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default ProductHighlights
