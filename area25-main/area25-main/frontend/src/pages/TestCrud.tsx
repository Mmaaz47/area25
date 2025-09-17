import { useState } from 'react'
import { getAllProducts, createOrUpdateProduct, deleteProductById } from '../api/products'
import { getCategories, addCategory } from '../api/categories'

export function TestCrud() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function runTests() {
    setLoading(true)
    const log: string[] = []

    try {
      // Test 1: GET Products
      log.push('1️⃣ Testing GET Products...')
      const products = await getAllProducts()
      log.push(`✅ Found ${products.length} products`)

      // Test 2: GET Categories
      log.push('\n2️⃣ Testing GET Categories...')
      const categories = await getCategories()
      log.push(`✅ Found ${categories.length} categories`)

      // Test 3: CREATE Product
      log.push('\n3️⃣ Testing CREATE Product...')
      const newProduct = {
        id: crypto.randomUUID(),
        title: 'Test Product ' + Date.now(),
        description: 'Test description',
        price: 999.99,
        category: categories[0] || 'Test',
        categoryId: categories[0] || 'cat1',
        images: []
      }

      const created = await createOrUpdateProduct(newProduct)
      log.push(`✅ Created product: ${created.title}`)

      // Test 4: UPDATE Product
      log.push('\n4️⃣ Testing UPDATE Product...')
      const updated = await createOrUpdateProduct({
        ...created,
        title: created.title + ' (Updated)',
        price: 1299.99
      })
      log.push(`✅ Updated product: ${updated.title}`)

      // Test 5: DELETE Product
      log.push('\n5️⃣ Testing DELETE Product...')
      await deleteProductById(created.id)
      log.push(`✅ Deleted product successfully`)

      // Test 6: CREATE Category
      log.push('\n6️⃣ Testing CREATE Category...')
      const newCat = 'Test Category ' + Date.now()
      await addCategory(newCat)
      log.push(`✅ Created category: ${newCat}`)

      log.push('\n✨ All CRUD operations successful!')

    } catch (error: any) {
      log.push(`\n❌ Error: ${error.message}`)
    }

    setResults(log)
    setLoading(false)
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>CRUD Operations Test</h1>

      <button
        onClick={runTests}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: 16,
          marginBottom: 20,
          background: loading ? '#666' : 'var(--accent)'
        }}
      >
        {loading ? 'Running Tests...' : 'Run All Tests'}
      </button>

      {results.length > 0 && (
        <div style={{
          background: '#f3f4f6',
          padding: 20,
          borderRadius: 8,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          {results.join('\n')}
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h3>Manual Testing Links:</h3>
        <ul>
          <li><a href="/manager/login">Manager Dashboard</a> (admin/admin)</li>
          <li><a href="/products">Products Page</a></li>
          <li><a href="/cart">Cart Page</a></li>
          <li><a href="/bookmarks">Bookmarks Page</a></li>
        </ul>
      </div>
    </div>
  )
}