import { useParams, Link } from 'react-router-dom'
import { getProductById } from '../../store/products'
import { addToCart } from '../../store/cart'
import { toggleBookmark, isBookmarked } from '../../store/bookmarks'
import { useMemo } from 'react'

export function ProductDetails() {
  const { id } = useParams()
  const product = id ? getProductById(id) : undefined

  if (!product) {
    return (
      <div style={{ padding: 16 }}>
        <p>Product not found.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  const bookmarked = useMemo(() => isBookmarked(product.id), [product.id])

  return (
    <div style={{ padding: 16 }}>
      <Link to="/">← Back</Link>
      <h2 style={{ marginTop: 12 }}>{product.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ aspectRatio: '1/1', background: '#f6f6f6', borderRadius: 6 }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{product.price.toLocaleString()} Saudi Riyal</div>
          <p style={{ marginTop: 12 }}>{product.description}</p>
          <div style={{ marginTop: 8, opacity: 0.8 }}>Category: {product.category}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => addToCart(product.id, 1)}>Add to Cart</button>
            <button onClick={() => toggleBookmark(product.id)} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>
              {bookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


