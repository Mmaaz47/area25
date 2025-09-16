import { useParams, Link } from 'react-router-dom'
import { getAllProducts, type Product } from '../../api/products'
import { useEffect, useState } from 'react'
import { getCategories } from '../../store/categories'
import { ProductCard } from '../../components/ProductCard'

// dynamic categories are used; remove hardcoded types

export function CategoryPage() {
  const { category } = useParams()
  const title = decodeURIComponent(category || '')
  const categories = getCategories()
  const isValid = categories.includes(title)
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    let mounted = true
    getAllProducts().then(list => {
      if (mounted) setProducts(list.filter(p => p.category === title))
    })
    return () => { mounted = false }
  }, [title])

  if (!isValid) {
    return (
      <div style={{ padding: 16 }}>
        <p>Category not found.</p>
        <Link to="/">Back</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{title}</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {categories.map(c => (
          <Link key={c} to={`/category/${encodeURIComponent(c)}`} style={{ border: '1px solid #ddd', borderRadius: 999, padding: '6px 10px', textDecoration: 'none', background: c === title ? '#111' : '#fff', color: c === title ? '#fff' : '#111' }}>{c}</Link>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}


