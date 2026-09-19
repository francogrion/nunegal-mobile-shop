import { useSearchParams } from 'react-router'
import PageTitle from '../../components/PageTitle/PageTitle.jsx'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import SearchBar from '../../components/SearchBar/SearchBar.jsx'
import { useProducts } from '../../hooks/useProducts.js'
import { filterProducts } from '../../utils/filterProducts.js'
import styles from './ProductListPage.module.css'

const describeResults = (count, search) => {
  if (count === 0) {
    return `No hay productos que coincidan con «${search.trim()}».`
  }
  return count === 1 ? '1 producto' : `${count} productos`
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
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Catálogo de móviles</h1>
        <SearchBar value={search} onChange={handleSearchChange} />
      </div>

      {/* A single live region whose text changes, so screen readers announce
          both the loading state and the number of results. */}
      <p
        role="status"
        className={status === 'loading' ? styles.message : styles.summary}
      >
        {status === 'loading' && 'Cargando productos…'}
        {status === 'success' &&
          describeResults(visibleProducts.length, search)}
      </p>

      {status === 'error' && (
        <div role="alert" className={styles.message}>
          <p>No se han podido cargar los productos.</p>
          <button type="button" onClick={retry}>
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
