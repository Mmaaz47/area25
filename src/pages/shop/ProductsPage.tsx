import { useEffect, useMemo, useState } from 'react'
import { getAllProducts, seedIfEmpty, type Product } from '../../api/products'
import { getCategories } from '../../api/categories'
import { ProductCard } from '../../components/ProductCard'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await seedIfEmpty()
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getCategories()
        ])
        setProducts(productsData)
        setCategories(['All', ...categoriesData])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = useMemo(() => products.filter(p => {
    const matchQ = q ? (p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())) : true
    const matchC = category === 'All' ? true : p.category === category
    return matchQ && matchC
  }), [products, q, category])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Products</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Search products" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1 }} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {paged.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }} disabled={page === 1}>Prev</button>
        <span style={{ alignSelf: 'center' }}>{page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  )
}


