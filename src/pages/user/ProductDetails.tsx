import { useParams, Link } from 'react-router-dom'
import { getProductById } from '../../api/products'
import { addToCart } from '../../store/cart'
import { toggleBookmark, isBookmarked } from '../../store/bookmarks'
import { useMemo } from 'react'

export function ProductDetails() {
  const { id } = useParams()
  const product = id ? getProductById(id) : undefined
  const bookmarked = useMemo(() => product ? isBookmarked(product.id) : false, [product])

  if (!product) {
    return (
      <div style={{ padding: 16 }}>
        <p>Product not found.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <Link to="/">← Back</Link>
      <h2 style={{ marginTop: 12 }}>{product.title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ position: 'relative', aspectRatio: '1/1', background: '#f6f6f6', borderRadius: 6, overflow: 'hidden' }}>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}
          <span style={{ position: 'absolute', left: 8, bottom: 8, background: 'rgba(0,0,0,0.55)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
            {product.category}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{(product.price || 0).toLocaleString()} Saudi Riyal</div>
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


