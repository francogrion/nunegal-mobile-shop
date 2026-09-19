import { Link, useParams } from 'react-router'
import { useProduct } from '../../hooks/useProduct.js'
import { formatPrice } from '../../utils/formatPrice.js'
import styles from './ProductDetailPage.module.css'

function ProductDetailPage() {
  const { productId } = useParams()
  const { status, product, retry } = useProduct(productId)

  return (
    <article>
      <Link className={styles.back} to="/">
        <span aria-hidden="true">← </span>Volver al listado
      </Link>

      {status === 'loading' && (
        <p role="status" className={styles.message}>
          Cargando producto…
        </p>
      )}

      {status === 'error' && (
        <div role="alert" className={styles.message}>
          <p>No se ha podido cargar el producto.</p>
          <button type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className={styles.layout}>
          <img
            className={styles.image}
            src={product.imageUrl}
            alt={`${product.brand} ${product.model}`}
          />
          <div className={styles.details}>
            <h1 className={styles.title}>
              {product.brand} {product.model}
            </h1>
            <p className={styles.price}>{formatPrice(product.price)}</p>
          </div>
        </div>
      )}
    </article>
  )
}

export default ProductDetailPage
