import { Outlet } from 'react-router'
import Header from '../Header/Header.jsx'
import styles from './Layout.module.css'

function Layout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}

export default Layout
