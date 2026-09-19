import { useIsSlow } from '../../hooks/useIsSlow.js'
import styles from './LoadingNotice.module.css'

/**
 * Loading message that, when loading takes a while, explains that the API
 * may be waking up (it sleeps when idle and can take a minute to start).
 */
function LoadingNotice({ label }) {
  const isSlow = useIsSlow(true)

  return (
    <>
      {label}
      {isSlow && (
        <span className={styles.slow}>
          El servidor se está activando: la primera carga puede tardar hasta un
          minuto.
        </span>
      )}
    </>
  )
}

export default LoadingNotice
