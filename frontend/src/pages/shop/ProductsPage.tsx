import { useEffect, useMemo, useState } from 'react'
import { getAllProducts, seedIfEmpty, type Product } from '../../store/products'
import { getCategories } from '../../store/categories'
import { ProductCard } from '../../components/ProductCard'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => { seedIfEmpty(); setProducts(getAllProducts()) }, [])

  const categories = useMemo(() => ['All', ...getCategories()], [products])
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


