import { Link } from 'react-router-dom'
import type { Product } from '../api/products'
import { addToCart } from '../store/cart'
import { toggleBookmark, isBookmarked, getBookmarksCount } from '../store/bookmarks'
import { useMemo, useState } from 'react'
import { useStorageSignal } from '../hooks/useStorageSignal'
import { FiBookmark, FiShoppingCart, FiCheck } from 'react-icons/fi'

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  useStorageSignal('bookmarks:update', getBookmarksCount)
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
      <div style={{
        borderRadius: 16,
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          position: 'relative',
          aspectRatio: '4/5',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              sizes="(max-width: 600px) 100vw, 33vw"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#9ca3af',
              padding: 20
            }}>
              <FiShoppingCart size={48} style={{ marginBottom: 8, opacity: 0.5 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>{product.category}</div>
            </div>
          )}
          <span style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            color: '#374151',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {product.category}
          </span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {product.title}
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--accent)',
            marginBottom: 12
          }}>
            {product.price.toLocaleString()} SAR
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                minHeight: 40,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: added ? '#10b981' : 'var(--accent)',
                border: 'none'
              }}
            >
              {added ? <FiCheck size={18} /> : <FiShoppingCart size={18} />}
              <span>{added ? 'Added!' : 'Add to Cart'}</span>
            </button>
            <button
              onClick={handleBookmark}
              style={{
                minWidth: 40,
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: bookmarked ? '#fef2f2' : '#f9fafb',
                color: bookmarked ? '#dc2626' : '#6b7280',
                border: `1px solid ${bookmarked ? '#fecaca' : '#e5e7eb'}`,
                borderRadius: 10,
                transition: 'all 0.2s ease'
              }}
            >
              <FiBookmark
                size={18}
                fill={bookmarked ? '#dc2626' : 'none'}
                color={bookmarked ? '#dc2626' : '#6b7280'}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}


