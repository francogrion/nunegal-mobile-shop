import { IconSearch } from '@tabler/icons-react'
import { useEffect, useId, useRef } from 'react'
import styles from './SearchBar.module.css'

const SHORTCUT = '/'

const isEditable = (element) =>
  element instanceof HTMLElement &&
  (element.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName))

function SearchBar({ value, onChange }) {
  const inputId = useId()
  const inputRef = useRef(null)

  // Pressing "/" anywhere on the page (except while typing in a field) jumps
  // to the search box, a common shortcut on search-driven sites.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey
      if (event.key !== SHORTCUT || hasModifier || isEditable(event.target)) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div role="search" className={styles.searchBar}>
      <label htmlFor={inputId} className="visually-hidden">
        Buscar por marca o modelo
      </label>
      <IconSearch
        className={styles.icon}
        size={18}
        stroke={1.8}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        type="search"
        placeholder="Buscar por marca o modelo"
        autoComplete="off"
        aria-keyshortcuts={SHORTCUT}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <kbd className={styles.shortcut} aria-hidden="true">
        {SHORTCUT}
      </kbd>
    </div>
  )
}

export default SearchBar
