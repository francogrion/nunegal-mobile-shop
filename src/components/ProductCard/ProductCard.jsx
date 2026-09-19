import { IconArrowUpRight } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router'
import { productPath } from '../../routes.js'
import { formatPrice } from '../../utils/formatPrice.js'
import ProductImage from '../ProductImage/ProductImage.jsx'
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
      <div className={styles.media}>
        {/* Decorative: brand and model are already announced as text */}
        <ProductImage className={styles.image} src={imageUrl} alt="" />
      </div>
      <div className={styles.info}>
        <p className={styles.brand}>{brand}</p>
        <h2 className={styles.model}>{model}</h2>
        <div className={styles.footer}>
          <p className={styles.price}>{formatPrice(price)}</p>
          <span className={styles.go} aria-hidden="true">
            <IconArrowUpRight size={16} stroke={2} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
