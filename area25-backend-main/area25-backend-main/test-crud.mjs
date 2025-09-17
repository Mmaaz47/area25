// Node 18+ has built-in fetch

const API_BASE = 'http://localhost:4000/api'

async function testCRUD() {
  console.log('🧪 Testing CRUD Operations...\n')

  try {
    // 1. Test READ (List products)
    console.log('1️⃣ Testing READ (List products)...')
    const listRes = await fetch(`${API_BASE}/products`)
    const products = await listRes.json()
    console.log(`✅ Found ${products.length} products`)

    // 2. Test CREATE
    console.log('\n2️⃣ Testing CREATE (Add new product)...')
    const newProduct = {
      title: 'Test Product ' + Date.now(),
      description: 'This is a test product',
      price: 99.99,
      categoryId: products[0]?.categoryId || 'cat1',
      images: []
    }

    const createRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })

    if (createRes.ok) {
      const created = await createRes.json()
      console.log(`✅ Created product: ${created.title} (ID: ${created.id})`)

      // 3. Test READ single
      console.log('\n3️⃣ Testing READ (Single product)...')
      const singleRes = await fetch(`${API_BASE}/products/${created.id}`)
      if (singleRes.ok) {
        const single = await singleRes.json()
        console.log(`✅ Retrieved product: ${single.title}`)
      } else {
        console.log('❌ Failed to get single product')
      }

      // 4. Test UPDATE
      console.log('\n4️⃣ Testing UPDATE...')
      const updateRes = await fetch(`${API_BASE}/products/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: created.title + ' (Updated)',
          price: 149.99
        })
      })

      if (updateRes.ok) {
        const updated = await updateRes.json()
        console.log(`✅ Updated product: ${updated.title}, Price: ${updated.price}`)
      } else {
        console.log('❌ Failed to update product')
      }

      // 5. Test DELETE
      console.log('\n5️⃣ Testing DELETE...')
      const deleteRes = await fetch(`${API_BASE}/products/${created.id}`, {
        method: 'DELETE'
      })

      if (deleteRes.ok) {
        console.log(`✅ Deleted product successfully`)
      } else {
        console.log('❌ Failed to delete product')
      }
    } else {
      console.log('❌ Failed to create product:', await createRes.text())
    }

    // 6. Test Categories
    console.log('\n6️⃣ Testing Categories...')
    const catRes = await fetch(`${API_BASE}/categories`)
    const categories = await catRes.json()
    console.log(`✅ Found ${categories.length} categories:`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat._count.products} products)`)
    })

    // 7. Test Manager Auth
    console.log('\n7️⃣ Testing Manager Authentication...')
    const authRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    })

    if (authRes.ok) {
      const auth = await authRes.json()
      console.log(`✅ Manager login successful, token: ${auth.token.substring(0, 20)}...`)
    } else {
      console.log('❌ Manager login failed')
    }

    console.log('\n✨ All CRUD operations tested!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n⚠️  Make sure the backend is running on port 4000')
  }
}

testCRUD()