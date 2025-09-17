import { getBookmarks, getBookmarksCount } from '../../store/bookmarks'
import { getAllProducts, type Product } from '../../api/products'
import { ProductCard } from '../../components/ProductCard'
import { useStorageSignal } from '../../hooks/useStorageSignal'
import { useEffect, useState } from 'react'

export function BookmarksPage() {
  useStorageSignal('bookmarks:update', getBookmarksCount)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllProducts().then(data => {
      const ids = new Set(getBookmarks())
      setProducts(data.filter(p => ids.has(p.id)))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Bookmarks</h2>
        <p>Loading...</p>
      </div>
    )
  }
  return (
    <div style={{ padding: 16 }}>
      <h2>Bookmarks</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}


