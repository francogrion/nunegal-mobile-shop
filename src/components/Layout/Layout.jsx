import { Outlet } from 'react-router'
import CircuitBackground from '../CircuitBackground/CircuitBackground.jsx'
import Header from '../Header/Header.jsx'
import styles from './Layout.module.css'

function Layout() {
  return (
    <div className={styles.layout}>
      <CircuitBackground />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
