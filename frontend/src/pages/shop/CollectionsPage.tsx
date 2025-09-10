import { getAllProducts } from '../../store/products'
import { ProductCard } from '../../components/ProductCard'

export function CollectionsPage() {
  const products = getAllProducts()
  const groups: Record<string, typeof products> = products.reduce((acc, p) => {
    (acc[p.category] ||= []).push(p)
    return acc
  }, {} as Record<string, typeof products>)

  return (
    <div style={{ padding: 16 }}>
      <h2>Collections</h2>
      {Object.entries(groups).map(([name, list]) => (
        <section key={name} style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h3 style={{ marginBottom: 8 }}>{name}</h3>
            <div style={{ height: 1, background: 'var(--border)', flex: 1, marginLeft: 12 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {list.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ))}
    </div>
  )
}


