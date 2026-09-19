import { IconRefresh } from '@tabler/icons-react'
import { useSearchParams } from 'react-router'
import LoadingNotice from '../../components/LoadingNotice/LoadingNotice.jsx'
import PageTitle from '../../components/PageTitle/PageTitle.jsx'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import { useProducts } from '../../hooks/useProducts.js'
import { filterProducts } from '../../utils/filterProducts.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { getCatalogStats } from '../../utils/getCatalogStats.js'
import styles from './ProductListPage.module.css'

const SKELETON_CARDS = 8

const describeResults = (count, search) => {
  if (count === 0) {
    return `No hay productos que coincidan con «${search.trim()}».`
  }
  return count === 1 ? '1 producto' : `${count} productos`
}

function CatalogSummary({ products }) {
  const { models, brands, minPrice } = getCatalogStats(products)

  return (
    <ul className={styles.stats} aria-label="Resumen del catálogo">
      <li>
        <strong>{models}</strong> {models === 1 ? 'modelo' : 'modelos'}
      </li>
      <li>
        <strong>{brands}</strong> {brands === 1 ? 'marca' : 'marcas'}
      </li>
      {minPrice !== null && (
        <li>
          <strong>{formatPrice(minPrice)}</strong> precio mínimo
        </li>
      )}
    </ul>
  )
}

function ProductListPage() {
  const { status, products, retry } = useProducts()
  // The search lives in the URL so it can be shared and survives navigating
  // to a product and back.
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const visibleProducts = filterProducts(products, search)

  const handleSearchChange = (value) => {
    setSearchParams(value ? { search: value } : {}, { replace: true })
  }

  return (
    <section>
      <PageTitle title="Catálogo de móviles" />
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Catálogo de <em>móviles</em>
        </h1>
        {status === 'success' && <CatalogSummary products={products} />}
      </div>

      <div className={styles.toolbar}>
        {/* A single live region whose text changes, so screen readers announce
            both the loading state and the number of results. */}
        <p role="status" className={styles.status}>
          {status === 'loading' && (
            <LoadingNotice label="Cargando productos…" />
          )}
          {status === 'success' &&
            describeResults(visibleProducts.length, search)}
        </p>
        <SearchBar value={search} onChange={handleSearchChange} />
      </div>

      {status === 'loading' && (
        <ul className={styles.grid} aria-hidden="true">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index} className={styles.skeleton} />
          ))}
        </ul>
      )}

      {status === 'error' && (
        <div role="alert" className={styles.error}>
          <p>No se han podido cargar los productos.</p>
          <button type="button" className={styles.retry} onClick={retry}>
            <IconRefresh size={18} stroke={1.8} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && visibleProducts.length > 0 && (
        <ul aria-label="Productos" className={styles.grid}>
          {visibleProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductListPage
