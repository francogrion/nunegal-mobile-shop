import { Link } from 'react-router'
import styles from './NotFoundPage.module.css'

function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1>Página no encontrada</h1>
      <p>La página que buscas no existe o ha cambiado de dirección.</p>
      <Link to="/">Volver al catálogo</Link>
    </section>
  )
}

export default NotFoundPage
