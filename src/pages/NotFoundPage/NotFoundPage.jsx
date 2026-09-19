import { IconArrowLeft } from '@tabler/icons-react'
import { Link } from 'react-router'
import PageTitle from '../../components/PageTitle/PageTitle.jsx'
import styles from './NotFoundPage.module.css'

function NotFoundPage() {
  return (
    <section className={styles.page}>
      <PageTitle title="Página no encontrada" />
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.text}>
        La página que buscas no existe o ha cambiado de dirección.
      </p>
      <Link className={styles.link} to="/">
        <IconArrowLeft size={18} stroke={2} aria-hidden="true" />
        Volver al catálogo
      </Link>
    </section>
  )
}

export default NotFoundPage
