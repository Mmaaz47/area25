import { Link, NavLink, Outlet } from 'react-router-dom'
import { LuArmchair, LuLayers, LuSearch, LuUser, LuHeart, LuShoppingBag } from 'react-icons/lu'
import './App.css'
import { useStorageSignal } from './hooks/useStorageSignal'
import { getCartCount } from './store/cart'
import { getBookmarksCount } from './store/bookmarks'
import { SiteFooter } from './components/SiteFooter.tsx'

function App() {
  const cartCount = useStorageSignal('cart:update', getCartCount)
  const savedCount = useStorageSignal('bookmarks:update', getBookmarksCount)
  return (
    <div>
      <header className="app-header">
        <nav className="nav nav-tabs">
          <NavLink className={({isActive}) => `tab ${isActive ? 'active' : ''}`} to="/products"><span className="icon-circle"><LuArmchair /></span><span>Products</span></NavLink>
          <NavLink className={({isActive}) => `tab ${isActive ? 'active' : ''}`} to="/collections"><span className="icon-circle"><LuLayers /></span><span>Collections</span></NavLink>
          <div className="brand"><Link to="/">Furniture Store</Link></div>
          <NavLink className={({isActive}) => `tab ${isActive ? 'active' : ''}`} to="/search"><span className="icon-circle"><LuSearch /></span><span>Search</span></NavLink>
          <NavLink className={({isActive}) => `tab ${isActive ? 'active' : ''}`} to="/login"><span className="icon-circle"><LuUser /></span><span>Login</span></NavLink>
          <NavLink className={({isActive}) => `tab ${isActive ? 'active' : ''}`} to="/bookmarks"><span className="icon-circle badge-host"><LuHeart />{savedCount > 0 && <span className="badge">{savedCount}</span>}</span><span>Saved</span></NavLink>
          <NavLink className={({isActive}) => `tab ${isActive ? 'active' : ''}`} to="/cart"><span className="icon-circle badge-host"><LuShoppingBag />{cartCount > 0 && <span className="badge">{cartCount}</span>}</span><span>Cart</span></NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
