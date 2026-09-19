import { Link, matchPath, useLocation } from 'react-router'
import { useProduct } from '../../hooks/useProduct.js'
import { PRODUCT_PATH } from '../../routes.js'
import styles from './Breadcrumbs.module.css'

// Shares the request (and the cache) with the details page, so showing the
// product name here does not cost an extra call to the API.
function ProductName({ productId }) {
  const { product } = useProduct(productId)
  return product ? `${product.brand} ${product.model}` : 'Producto'
}

function CurrentPage({ pathname }) {
  const productMatch = matchPath(PRODUCT_PATH, pathname)
  if (productMatch) {
    return <ProductName productId={productMatch.params.productId} />
  }
  return 'Página no encontrada'
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const isCatalog = pathname === '/'

  return (
    <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
      <ol className={styles.list}>
        <li className={styles.item}>
          {isCatalog ? (
            <span aria-current="page">Catálogo</span>
          ) : (
            <Link to="/">Catálogo</Link>
          )}
        </li>
        {!isCatalog && (
          <li className={styles.item}>
            <span aria-current="page">
              <CurrentPage pathname={pathname} />
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
