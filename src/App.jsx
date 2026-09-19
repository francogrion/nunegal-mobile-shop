import { Route, Routes } from 'react-router'
import Layout from './components/Layout/Layout.jsx'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx'
import ProductListPage from './pages/ProductListPage/ProductListPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProductListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
