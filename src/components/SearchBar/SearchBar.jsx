import { useId } from 'react'
import styles from './SearchBar.module.css'

function SearchBar({ value, onChange }) {
  const inputId = useId()

  return (
    <div role="search" className={styles.searchBar}>
      <label htmlFor={inputId} className="visually-hidden">
        Buscar por marca o modelo
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="search"
        placeholder="Buscar por marca o modelo"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default SearchBar
