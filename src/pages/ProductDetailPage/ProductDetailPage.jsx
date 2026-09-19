import { Link, useLocation, useParams } from 'react-router'
import LoadingNotice from '../../components/LoadingNotice/LoadingNotice.jsx'
import PageTitle from '../../components/PageTitle/PageTitle.jsx'
import ProductActions from '../../components/ProductActions/ProductActions.jsx'
import ProductImage from '../../components/ProductImage/ProductImage.jsx'
import ProductSpecs from '../../components/ProductSpecs/ProductSpecs.jsx'
import { useProduct } from '../../hooks/useProduct.js'
import { formatPrice } from '../../utils/formatPrice.js'
import styles from './ProductDetailPage.module.css'

function ProductDetailPage() {
  const { productId } = useParams()
  const { status, product, retry } = useProduct(productId)
  // Back to the list the user came from, or to the full list when the page
  // was opened directly (e.g. from a shared link).
  const { state } = useLocation()
  const backTo = state?.from ?? '/'

  const title = {
    loading: 'Cargando producto',
    error: 'Producto no disponible',
    success: product && `${product.brand} ${product.model}`,
  }[status]

  return (
    <article>
      <PageTitle title={title} />
      <Link className={styles.back} to={backTo}>
        <span aria-hidden="true">← </span>Volver al listado
      </Link>

      {status === 'loading' && (
        <p role="status" className={styles.message}>
          <LoadingNotice label="Cargando producto…" />
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
          <ProductImage
            className={styles.image}
            src={product.imageUrl}
            alt={`${product.brand} ${product.model}`}
            loading="eager"
          />
          <div className={styles.details}>
            <h1 className={styles.title}>
              {product.brand} {product.model}
            </h1>
            <p className={styles.price}>{formatPrice(product.price)}</p>
            <ProductSpecs product={product} />
            <ProductActions key={product.id} product={product} />
          </div>
        </div>
      )}
    </article>
  )
}

export default ProductDetailPage
