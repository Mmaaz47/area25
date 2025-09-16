import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getAllProducts, seedIfEmpty, type Product } from '../../api/products'
import { ProductCard } from '../../components/ProductCard'
import { FiArrowRight, FiPackage, FiTruck, FiShield, FiAward } from 'react-icons/fi'

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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: '3px solid white',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <h2>Loading Amazing Furniture...</h2>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40,
          alignItems: 'center'
        }}>
          <div style={{ zIndex: 1 }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 20,
              lineHeight: 1.2
            }}>
              Transform Your
              <span style={{ display: 'block', color: '#fbbf24' }}>
                Living Space
              </span>
            </h1>
            <p style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 30,
              lineHeight: 1.6
            }}>
              Discover premium furniture that combines modern design with exceptional comfort.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/products" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'white',
                color: '#764ba2',
                padding: '16px 32px',
                borderRadius: 50,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                transition: 'transform 0.2s',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/collections" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 50,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                border: '2px solid white',
                transition: 'all 0.2s'
              }}>
                View Collections
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 400 }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 3s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '10%',
              width: 100,
              height: 100,
              background: 'rgba(251, 191, 36, 0.3)',
              borderRadius: '50%',
              filter: 'blur(40px)'
            }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '60px 20px',
        background: '#f9fafb'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 30
        }}>
          {[
            { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over 500 SAR' },
            { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions' },
            { icon: FiPackage, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: FiAward, title: 'Premium Quality', desc: 'Handpicked products' }
          ].map((feature, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: 20
            }}>
              <feature.icon size={48} style={{
                color: '#764ba2',
                marginBottom: 16
              }} />
              <h3 style={{ marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ color: '#6b7280' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 36,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 48
          }}>
            Shop by Category
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24
          }}>
            {categories.map(c => (
              <Link key={c} to={`/category/${encodeURIComponent(c)}`} style={{
                display: 'block',
                padding: 40,
                background: 'white',
                borderRadius: 16,
                textDecoration: 'none',
                textAlign: 'center',
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'
                e.currentTarget.style.borderColor = '#764ba2'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}>
                <div style={{
                  fontSize: 48,
                  marginBottom: 16
                }}>
                  {c === 'Home Furniture' && '🛋️'}
                  {c === 'Office Furniture' && '💼'}
                  {c === 'Lightings' && '💡'}
                  {c === 'Home Decor' && '🏠'}
                  {!['Home Furniture', 'Office Furniture', 'Lightings', 'Home Decor'].includes(c) && '📦'}
                </div>
                <h3 style={{ marginBottom: 8, color: '#1f2937' }}>{c}</h3>
                <p style={{ color: '#6b7280' }}>
                  {products.filter(p => p.category === c).length} products
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section style={{
        padding: '60px 20px',
        background: '#f9fafb'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 16
          }}>
            New Arrivals
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: 48,
            fontSize: 18
          }}>
            Handpicked furniture pieces for modern living
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24
          }}>
            {products.slice(0, 8).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {products.length > 8 && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/products" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 40px',
                background: '#764ba2',
                color: 'white',
                borderRadius: 50,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                View All Products <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}