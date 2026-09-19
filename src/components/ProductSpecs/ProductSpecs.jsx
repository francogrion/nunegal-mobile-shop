import {
  IconAspectRatio,
  IconBattery3,
  IconBrandAndroid,
  IconBuildingStore,
  IconCamera,
  IconCameraSelfie,
  IconCpu,
  IconDeviceMobile,
  IconRuler2,
  IconStack2,
  IconTag,
  IconWeight,
} from '@tabler/icons-react'
import { formatPrice } from '../../utils/formatPrice.js'
import styles from './ProductSpecs.module.css'

const NOT_AVAILABLE = 'No disponible'

const grams = new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'gram' })

const formatList = (values) => (values.length > 0 ? values.join(', ') : null)

const formatWeight = (weight) => (weight === null ? null : grams.format(weight))

function ProductSpecs({ product }) {
  const { brand, model, price, specs } = product
  const rows = [
    [IconBuildingStore, 'Marca', brand],
    [IconDeviceMobile, 'Modelo', model],
    [IconTag, 'Precio', formatPrice(price)],
    [IconCpu, 'CPU', specs.cpu],
    [IconStack2, 'RAM', specs.ram],
    [IconBrandAndroid, 'Sistema operativo', specs.os],
    [IconAspectRatio, 'Resolución de pantalla', specs.displayResolution],
    [IconDeviceMobile, 'Tamaño de pantalla', specs.displaySize],
    [IconBattery3, 'Batería', specs.battery],
    [IconCamera, 'Cámara principal', formatList(specs.primaryCamera)],
    [IconCameraSelfie, 'Cámara frontal', formatList(specs.secondaryCamera)],
    [IconRuler2, 'Dimensiones', specs.dimensions],
    [IconWeight, 'Peso', formatWeight(specs.weight)],
  ]

  return (
    <table className={styles.table}>
      <caption className={styles.caption}>Especificaciones</caption>
      <tbody>
        {rows.map(([Icon, label, value]) => (
          <tr key={label}>
            <th scope="row">
              <Icon
                className={styles.icon}
                size={16}
                stroke={1.8}
                aria-hidden="true"
              />
              {label}
            </th>
            <td>{value ?? NOT_AVAILABLE}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProductSpecs
