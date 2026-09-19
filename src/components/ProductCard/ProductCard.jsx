import { Link } from 'react-router'
import { formatPrice } from '../../utils/formatPrice.js'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { id, brand, model, price, imageUrl } = product

  return (
    <Link className={styles.card} to={`/product/${id}`}>
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
