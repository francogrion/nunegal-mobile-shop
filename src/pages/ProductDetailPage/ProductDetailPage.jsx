import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { Link, useLocation, useParams } from 'react-router'
import LoadingNotice from '../../components/LoadingNotice/LoadingNotice.jsx'
import PageTitle from '../../components/PageTitle/PageTitle.jsx'
import ProductActions from '../../components/ProductActions/ProductActions.jsx'
import ProductHighlights from '../../components/ProductHighlights/ProductHighlights.jsx'
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
        <IconArrowLeft size={16} stroke={2} aria-hidden="true" />
        Volver al listado
      </Link>

      {status === 'loading' && (
        <p role="status" className={styles.message}>
          <LoadingNotice label="Cargando producto…" />
        </p>
      )}

      {status === 'error' && (
        <div role="alert" className={styles.message}>
          <p>No se ha podido cargar el producto.</p>
          <button type="button" className={styles.retry} onClick={retry}>
            <IconRefresh size={18} stroke={1.8} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className={styles.layout}>
          {/* Camera viewfinder corners frame the photo */}
          <div className={styles.viewer}>
            <span className={styles.corners} aria-hidden="true" />
            <ProductImage
              className={styles.image}
              src={product.imageUrl}
              alt={`${product.brand} ${product.model}`}
              loading="eager"
            />
          </div>

          <div className={styles.details}>
            <section className={styles.description}>
              <h1 className={styles.title}>
                <span className={styles.brand}>{product.brand}</span>{' '}
                {product.model}
              </h1>
              <p className={styles.price}>{formatPrice(product.price)}</p>
              <ProductHighlights specs={product.specs} />
              <ProductSpecs product={product} />
            </section>
            <ProductActions key={product.id} product={product} />
          </div>
        </div>
      )}
    </article>
  )
}

export default ProductDetailPage
