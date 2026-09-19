import { IconDeviceMobile } from '@tabler/icons-react'
import { Link } from 'react-router'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx'
import CartMenu from '../CartMenu/CartMenu.jsx'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/">
        <span className={styles.logo} aria-hidden="true">
          <IconDeviceMobile size={18} stroke={1.8} />
        </span>
        Mobile Shop
      </Link>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs />
      </div>
      <CartMenu />
    </header>
  )
}

export default Header
