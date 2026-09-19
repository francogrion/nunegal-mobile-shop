import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import { useProducts } from '../../hooks/useProducts.js'
import styles from './ProductListPage.module.css'

function ProductListPage() {
  const { status, products, retry } = useProducts()

  return (
    <section>
      <h1>Catálogo de móviles</h1>

      {status === 'loading' && (
        <p role="status" className={styles.message}>
          Cargando productos…
        </p>
      )}

      {status === 'error' && (
        <div role="alert" className={styles.message}>
          <p>No se han podido cargar los productos.</p>
          <button type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && (
        <ul aria-label="Productos" className={styles.grid}>
          {products.map((product) => (
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
