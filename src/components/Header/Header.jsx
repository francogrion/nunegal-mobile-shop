import { Link } from 'react-router'
import { useCartCount } from '../../hooks/useCartCount.js'
import styles from './Header.module.css'

const describeCart = (count) =>
  `${count} ${count === 1 ? 'producto' : 'productos'} en la cesta`

function CartIcon() {
  return (
    <svg
      className={styles.cartIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  )
}

function Header() {
  const cartCount = useCartCount()

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/">
        Mobile Shop
      </Link>
      <p className={styles.cart}>
        <CartIcon />
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
