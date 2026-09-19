import { Link } from 'react-router'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/">
        Mobile Shop
      </Link>
    </header>
  )
}

export default Header
