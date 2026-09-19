import { IconDeviceMobile, IconShoppingBag } from '@tabler/icons-react'
import { Link } from 'react-router'
import { useCartCount } from '../../hooks/useCartCount.js'
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx'
import styles from './Header.module.css'

const describeCart = (count) =>
  `${count} ${count === 1 ? 'producto' : 'productos'} en la cesta`

function Header() {
  const cartCount = useCartCount()

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
      <p className={styles.cart}>
        <IconShoppingBag
          className={styles.cartIcon}
          size={20}
          stroke={1.8}
          aria-hidden="true"
        />
        {/* The visible number is hidden from screen readers, which read the
            full sentence instead. */}
        <span className={styles.cartCount} aria-hidden="true">
          {cartCount}
        </span>
        <span className="visually-hidden">{describeCart(cartCount)}</span>
      </p>
    </header>
  )
}

export default Header
