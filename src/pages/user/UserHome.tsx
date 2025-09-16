import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getAllProducts, seedIfEmpty, type Product } from '../../api/products'
import { ProductCard } from '../../components/ProductCard'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'

export function UserHome() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      await seedIfEmpty()
      const data = await getAllProducts()
      setProducts(data)
      setLoading(false)
    }
    loadProducts()
  }, [])

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products])

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{
          height: 360,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          borderRadius: 16,
          marginBottom: 24,
          animation: 'shimmer 1.5s infinite'
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          <LoadingSkeleton count={6} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, animation: 'fadeIn 0.5s ease-out' }}>
      <section
        style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          height: 360,
          display: 'flex',
          alignItems: 'flex-end',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img
          alt="Warm, elegant living room"
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.45))' }} />
        <div style={{ position: 'relative', padding: 24, color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: 32, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Elevate Your Space</h2>
          <p style={{ marginTop: 6, opacity: 0.95 }}>Thoughtful pieces in warm, timeless tones.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Link to="/products" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>Shop now</Link>
            <Link to="/collections" style={{ background: 'rgba(255,255,255,0.9)', color: '#1f2937', padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>Explore collections</Link>
          </div>
        </div>
      </section>
      <h3 style={{ marginTop: 20 }}>Featured Categories</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {categories.map(c => (
          <Link key={c} to={`/category/${encodeURIComponent(c)}`} style={{ border: '1px solid #ddd', borderRadius: 999, padding: '6px 10px', textDecoration: 'none' }}>{c}</Link>
        ))}
      </div>
      <h3 style={{ marginBottom: 8 }}>New Arrivals</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}


