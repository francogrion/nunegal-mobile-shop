import { Link, useLocation } from 'react-router'
import { productPath } from '../../routes.js'
import { formatPrice } from '../../utils/formatPrice.js'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { id, brand, model, price, imageUrl } = product
  // Remember the list the user comes from (e.g. with a search applied), so
  // the details page can link back to it.
  const location = useLocation()

  return (
    <Link
      className={styles.card}
      to={productPath(id)}
      state={{ from: location }}
    >
      {/* Decorative: brand and model are already announced as text */}
      <img className={styles.image} src={imageUrl} alt="" loading="lazy" />
      <div className={styles.info}>
        <p className={styles.brand}>{brand}</p>
        <h2 className={styles.model}>{model}</h2>
        <p className={styles.price}>{formatPrice(price)}</p>
      </div>
    </Link>
  )
}

export default ProductCard
