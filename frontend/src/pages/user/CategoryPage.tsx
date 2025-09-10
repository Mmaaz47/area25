import { useParams, Link } from 'react-router-dom'
import { getAllProducts, type Product } from '../../store/products'
import { useMemo } from 'react'
import { ProductCard } from '../../components/ProductCard'

const validCategories = ['Home Furniture', 'Home Decor', 'Lightings', 'Rugs', 'Office Furniture'] as const
type Category = typeof validCategories[number]

export function CategoryPage() {
  const { category } = useParams()
  const title = decodeURIComponent(category || '')
  const isValid = (validCategories as readonly string[]).includes(title)
  const products = useMemo<Product[]>(() => getAllProducts().filter(p => p.category === title), [title])

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}


