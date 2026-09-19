import { formatPrice } from '../../utils/formatPrice.js'
import styles from './ProductSpecs.module.css'

const NOT_AVAILABLE = 'No disponible'

const grams = new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'gram' })

const formatList = (values) => (values.length > 0 ? values.join(', ') : null)

const formatWeight = (weight) => (weight === null ? null : grams.format(weight))

function ProductSpecs({ product }) {
  const { brand, model, price, specs } = product
  const rows = [
    ['Marca', brand],
    ['Modelo', model],
    ['Precio', formatPrice(price)],
    ['CPU', specs.cpu],
    ['RAM', specs.ram],
    ['Sistema operativo', specs.os],
    ['Resolución de pantalla', specs.displayResolution],
    ['Tamaño de pantalla', specs.displaySize],
    ['Batería', specs.battery],
    ['Cámara principal', formatList(specs.primaryCamera)],
    ['Cámara frontal', formatList(specs.secondaryCamera)],
    ['Dimensiones', specs.dimensions],
    ['Peso', formatWeight(specs.weight)],
  ]

  return (
    <table className={styles.table}>
      <caption className={styles.caption}>Especificaciones</caption>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value ?? NOT_AVAILABLE}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProductSpecs
