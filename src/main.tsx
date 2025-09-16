import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { UserHome } from './pages/user/UserHome'
import { CategoryPage } from './pages/user/CategoryPage'
import { ProductDetails } from './pages/user/ProductDetails'
import { ManagerLogin } from './pages/manager/ManagerLogin'
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { ProductsPage } from './pages/shop/ProductsPage'
import { BookmarksPage } from './pages/shop/BookmarksPage'
import { CartPage } from './pages/shop/CartPage'
import { CollectionsPage } from './pages/shop/CollectionsPage'
import { ContactPage } from './pages/misc/ContactPage'
import { TestCrud } from './pages/TestCrud'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <UserHome /> },
      { path: 'category/:category', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductDetails /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'search', element: <ProductsPage /> },
      { path: 'login', element: <ManagerLogin /> },
      { path: 'bookmarks', element: <BookmarksPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'test-crud', element: <TestCrud /> },
    ]
  },
  { path: '/manager/login', element: <ManagerLogin /> },
  { path: '/manager', element: <ManagerDashboard /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
