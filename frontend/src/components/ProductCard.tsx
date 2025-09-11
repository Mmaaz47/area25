import { Link } from 'react-router-dom'
import type { Product } from '../store/products'
import { addToCart } from '../store/cart'
import { toggleBookmark, isBookmarked, getBookmarksCount } from '../store/bookmarks'
import { useMemo, useState } from 'react'
import { useStorageSignal } from '../hooks/useStorageSignal'
import { FiBookmark, FiShoppingCart, FiCheck } from 'react-icons/fi'

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const bookmarksVersion = useStorageSignal('bookmarks:update', getBookmarksCount)
  const bookmarked = useMemo(() => isBookmarked(product.id), [product.id, bookmarksVersion])

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addToCart(product.id, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  function handleBookmark(e: React.MouseEvent) {
    e.preventDefault()
    toggleBookmark(product.id)
  }

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, background: 'var(--card-bg)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ position: 'relative', aspectRatio: '1/1', background: '#f6f6f6', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{product.category}</span>
          )}
          <span style={{ position: 'absolute', left: 8, bottom: 8, background: 'rgba(0,0,0,0.55)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
            {product.category}
          </span>
        </div>
        <div style={{ fontWeight: 700 }}>{product.title}</div>
        <div style={{ opacity: 0.9, marginBottom: 8 }}>{product.price.toLocaleString()} SAR</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {added ? <FiCheck /> : <FiShoppingCart />} {added ? 'Added' : 'Add'}
          </button>
          <button onClick={handleBookmark} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: bookmarked ? '#dc2626' : '#111', border: '1px solid #ddd' }}>
            <FiBookmark color={bookmarked ? '#dc2626' : undefined} /> {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </Link>
  )
}


