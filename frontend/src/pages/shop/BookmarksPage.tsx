import { getBookmarks } from '../../store/bookmarks'
import { getAllProducts } from '../../store/products'
import { ProductCard } from '../../components/ProductCard'

export function BookmarksPage() {
  const ids = new Set(getBookmarks())
  const products = getAllProducts().filter(p => ids.has(p.id))
  return (
    <div style={{ padding: 16 }}>
      <h2>Bookmarks</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}


