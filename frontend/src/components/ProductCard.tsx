import { Link } from 'react-router-dom'
import type { Product } from '../store/products'
import { addToCart } from '../store/cart'
import { toggleBookmark, isBookmarked } from '../store/bookmarks'
import { useMemo, useState } from 'react'
import { FiBookmark, FiShoppingCart, FiCheck } from 'react-icons/fi'

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const bookmarked = useMemo(() => isBookmarked(product.id), [product.id])

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
        <div style={{ aspectRatio: '1/1', background: '#f6f6f6', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span>{product.category}</span>
        </div>
        <div style={{ fontWeight: 700 }}>{product.title}</div>
        <div style={{ opacity: 0.9, marginBottom: 8 }}>{product.price.toLocaleString()} SAR</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {added ? <FiCheck /> : <FiShoppingCart />} {added ? 'Added' : 'Add'}
          </button>
          <button onClick={handleBookmark} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#111', border: '1px solid #ddd' }}>
            <FiBookmark color={bookmarked ? '#ff7a59' : undefined} /> Save
          </button>
        </div>
      </div>
    </Link>
  )
}


