import { useId } from 'react'
import styles from './OptionSelector.module.css'

/**
 * Group of mutually exclusive options ({ code, name, swatch? }) rendered as
 * native radio buttons, so keyboard and screen reader support come for free.
 * An option with a `swatch` CSS color also shows a decorative color sample.
 */
function OptionSelector({ label, options, selectedCode, onSelect }) {
  const groupName = useId()

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.code} className={styles.option}>
            <input
              type="radio"
              className={styles.input}
              name={groupName}
              value={option.code}
              checked={option.code === selectedCode}
              onChange={() => onSelect(option.code)}
            />
            <span className={styles.label}>
              {option.swatch && (
                <span
                  className={styles.swatch}
                  style={{ '--swatch': option.swatch }}
                  aria-hidden="true"
                />
              )}
              {option.name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default OptionSelector
