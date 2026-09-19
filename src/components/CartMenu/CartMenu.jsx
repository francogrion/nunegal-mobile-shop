import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconTrash,
} from '@tabler/icons-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAddToCart } from '../../hooks/useAddToCart.js'
import { useCartItems } from '../../hooks/useCartItems.js'
import { productPath } from '../../routes.js'
import { cartStore } from '../../store/cartStore.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { summarizeCart } from '../../utils/summarizeCart.js'
import ProductImage from '../ProductImage/ProductImage.jsx'
import styles from './CartMenu.module.css'

const describeCart = (count) =>
  `${count} ${count === 1 ? 'producto' : 'productos'} en la cesta`

const describeUnpriced = (count) =>
  `No incluye ${count} ${count === 1 ? 'producto' : 'productos'} sin precio.`

const describeUnits = (quantity, name) =>
  `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${name} en la cesta.`

function CartLine({ line, onIncreased, onDecrease, onRemove, onOpen }) {
  const { productId, brand, model, imageUrl, price, quantity } = line
  const { storageCode, storageName, colorCode, colorName } = line
  const name = `${brand} ${model}`
  const label = `${name}, ${storageName}, ${colorName}`
  // Adding a unit goes through the API like any other addition to the cart
  const { status, add } = useAddToCart()
  const isAdding = status === 'adding'

  const increase = async () => {
    if (isAdding) return
    const added = await add({
      product: { id: productId, brand, model, imageUrl, price },
      storage: { code: storageCode, name: storageName },
      color: { code: colorCode, name: colorName },
    })
    if (added) onIncreased(line)
  }

  return (
    <li className={styles.line}>
      <div className={styles.thumb}>
        <ProductImage className={styles.thumbImage} src={imageUrl} alt="" />
      </div>
      <div className={styles.lineInfo}>
        <Link
          className={styles.name}
          to={productPath(productId)}
          onClick={() => onOpen()}
        >
          {name}
        </Link>
        <p className={styles.variant}>
          {storageName} · {colorName}
        </p>
        <div className={styles.quantity}>
          <div
            className={styles.stepper}
            role="group"
            aria-label={`Cantidad de ${label}`}
          >
            <button
              type="button"
              className={styles.step}
              aria-label={`Restar una unidad de ${label}`}
              onClick={() => onDecrease(line)}
            >
              <IconMinus size={14} stroke={2} aria-hidden="true" />
            </button>
            <span className={styles.stepValue}>{quantity}</span>
            {/* aria-disabled instead of disabled keeps the focus on the
                button while the request is in progress */}
            <button
              type="button"
              className={styles.step}
              aria-label={`Sumar una unidad de ${label}`}
              aria-disabled={isAdding}
              onClick={increase}
            >
              <IconPlus size={14} stroke={2} aria-hidden="true" />
            </button>
          </div>{' '}
          <span className={styles.unitPrice}>
            × {price === null ? 'Precio no disponible' : formatPrice(price)}
          </span>
        </div>
        {status === 'error' && (
          <p role="alert" className={styles.error}>
            No se ha podido añadir otra unidad. Inténtalo de nuevo.
          </p>
        )}
      </div>
      {price !== null && (
        <p className={styles.lineTotal}>{formatPrice(price * quantity)}</p>
      )}
      <button
        type="button"
        className={styles.remove}
        aria-label={`Eliminar ${label}`}
        onClick={() => onRemove(line)}
      >
        <IconTrash size={18} stroke={1.8} aria-hidden="true" />
      </button>
    </li>
  )
}

/**
 * Cart button of the header with a disclosure panel listing the products in
 * the cart, their total and actions to remove them. The panel closes with
 * Escape (returning the focus to the button), when clicking outside of it and
 * when opening a product from it.
 */
function CartMenu() {
  const lines = useCartItems()
  const { count, total, unpricedCount } = summarizeCart(lines)
  const [isOpen, setIsOpen] = useState(false)
  // Announced to screen readers after removing products
  const [announcement, setAnnouncement] = useState('')
  const panelId = useId()
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const titleRef = useRef(null)

  const close = useCallback(({ returnFocus = false } = {}) => {
    setIsOpen(false)
    setAnnouncement('')
    if (returnFocus) buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close({ returnFocus: true })
    }
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) close()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen, close])

  const toggle = () => {
    setIsOpen((open) => !open)
    setAnnouncement('')
  }

  // The removed control disappears, so the focus moves to the panel title to
  // keep keyboard users inside the panel.
  const removeLine = (line) => {
    cartStore.remove(line.lineId)
    setAnnouncement('Producto eliminado de la cesta.')
    titleRef.current?.focus()
  }

  const announceQuantity = ({ lineId, brand, model }) => {
    const line = cartStore.getItems().find((item) => item.lineId === lineId)
    if (line) setAnnouncement(describeUnits(line.quantity, `${brand} ${model}`))
  }

  // Subtracting the last unit removes the line, like the remove button
  const decreaseLine = (line) => {
    if (line.quantity === 1) {
      removeLine(line)
      return
    }
    cartStore.decrease(line.lineId)
    announceQuantity(line)
  }

  const emptyCart = () => {
    cartStore.clear()
    setAnnouncement('Cesta vaciada.')
    titleRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={styles.cartMenu}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={toggle}
      >
        <IconShoppingBag size={20} stroke={1.8} aria-hidden="true" />
        {/* The visible number is hidden from screen readers, which read the
            full sentence instead. */}
        <span className={styles.count} aria-hidden="true">
          {count}
        </span>
        <span className="visually-hidden">{describeCart(count)}</span>
      </button>

      {isOpen && (
        <section id={panelId} className={styles.panel} aria-label="Cesta">
          <h2 ref={titleRef} className={styles.title} tabIndex={-1}>
            Tu cesta
          </h2>
          <p role="status" className="visually-hidden">
            {announcement}
          </p>

          {lines.length === 0 ? (
            <p className={styles.empty}>Tu cesta está vacía.</p>
          ) : (
            <>
              <ul className={styles.lines} aria-label="Productos en la cesta">
                {lines.map((line) => (
                  <CartLine
                    key={line.lineId}
                    line={line}
                    onIncreased={announceQuantity}
                    onDecrease={decreaseLine}
                    onRemove={removeLine}
                    onOpen={close}
                  />
                ))}
              </ul>
              <div className={styles.summary}>
                <p className={styles.total}>
                  Total <strong>{formatPrice(total)}</strong>
                </p>
                {unpricedCount > 0 && (
                  <p className={styles.note}>
                    {describeUnpriced(unpricedCount)}
                  </p>
                )}
                <button
                  type="button"
                  className={styles.clear}
                  onClick={emptyCart}
                >
                  <IconTrash size={16} stroke={1.8} aria-hidden="true" />
                  Vaciar cesta
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

export default CartMenu
