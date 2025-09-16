// Hardcoded backend URL for production
const API_BASE = 'http://area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com/api'

// API service for products
export type Product = {
  id: string
  title: string
  price: number
  description: string
  category: string
  categoryId?: string
  images?: string[]
}



// Cache to avoid excessive API calls
let productsCache: Product[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5000 // 5 seconds

export async function getAllProducts(): Promise<Product[]> {
  // Return cached data if fresh
  if (productsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return productsCache
  }

  try {
    const response = await fetch(`${API_BASE}/products`)
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()

    productsCache = data.map((p: any) => ({
      ...p,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      category: p.category?.name || 'Uncategorized',
      categoryId: p.categoryId,
      images: p.images?.map((img: any) => img.url) || []
    }))
    cacheTimestamp = Date.now()

    return productsCache
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProducts()
  return products.find(p => p.id === id)
}

export async function createOrUpdateProduct(product: Product): Promise<Product> {
  // Always use PUT with the ID - backend will create if doesn't exist
  const url = `${API_BASE}/products/${product.id}`

  const body = {
    title: product.title,
    description: product.description,
    price: Number(product.price), // Ensure price is a number
    categoryId: product.categoryId || product.category,
    images: product.images?.map(url => {
      // If it's an S3 URL, extract the key from it
      if (url.includes('s3') && url.includes('amazonaws.com')) {
        const urlParts = url.split('amazonaws.com/')
        const key = urlParts[1] ? urlParts[1].split('?')[0] : url
        return { key, url: url.split('?')[0] } // Remove query params from URL
      }
      // For base64 or other URLs, use as is
      return { key: url, url }
    })
  }

  console.log('Sending to backend:', body)

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) throw new Error('Failed to save product')

  // Clear cache after modification
  productsCache = null

  const savedProduct = await response.json()
  return {
    ...savedProduct,
    price: typeof savedProduct.price === 'string' ? parseFloat(savedProduct.price) : savedProduct.price,
    category: savedProduct.category?.name || 'Uncategorized',
    images: savedProduct.images?.map((img: any) => img.url) || []
  }
}

export async function deleteProductById(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error('Failed to delete product')

  // Clear cache after deletion
  productsCache = null
}

export async function seedIfEmpty(): Promise<void> {
  try {
    const products = await getAllProducts()
    if (products.length > 0) return // Already has data

    // Get or create categories first
    const categoriesResponse = await fetch(`${API_BASE}/categories`)
    let categories = await categoriesResponse.json()

    if (categories.length === 0) {
      // Create default categories
      const defaultCategories = ['Home Furniture', 'Home Decor', 'Lightings', 'Office Furniture']
      for (const name of defaultCategories) {
        await fetch(`${API_BASE}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        })
      }
      // Fetch categories again
      const response = await fetch(`${API_BASE}/categories`)
      categories = await response.json()
    }

    // Create a category map
    const categoryMap: Record<string, string> = {}
    categories.forEach((cat: any) => {
      categoryMap[cat.name] = cat.id
    })

    // Seed products
    const seedData = [
      { title: 'Vintage V Side Table', price: 930.35, description: 'A stylish vintage side table.', category: 'Home Furniture' },
      { title: 'Retro Elegance XVIII Side Table', price: 823.40, description: 'Retro styled side table.', category: 'Home Furniture' },
      { title: 'Vintage IV Side Table', price: 1534.10, description: 'Elegant side table.', category: 'Home Furniture' },
      { title: 'Serene Spectrum IV Wall Art', price: 1086.75, description: 'Calming wall art.', category: 'Home Decor' },
      { title: 'Midnight Jewel V Wall Art', price: 868.25, description: 'Dark tones wall art.', category: 'Home Decor' },
      { title: 'Midnight Luxe VI Wall Art', price: 1086.75, description: 'Luxurious wall art.', category: 'Home Decor' },
      { title: 'Table Lamp', price: 429.21, description: 'Ambient table lamp.', category: 'Lightings' },
      { title: 'Modern Table Lamp', price: 642.85, description: 'Modern table lamp.', category: 'Lightings' },
      { title: 'Premium Table Lamp', price: 807.30, description: 'Premium table lamp.', category: 'Lightings' },
      { title: 'Strata Sit Standing Table', price: 3520.15, description: 'Ergonomic sit-stand desk.', category: 'Office Furniture' },
      { title: 'Linéa Bar Table', price: 10353.45, description: 'Bar-height table.', category: 'Office Furniture' },
      { title: 'Orlo Reception desk', price: 23411.70, description: 'Reception desk for offices.', category: 'Office Furniture' },
    ]

    for (const product of seedData) {
      const categoryId = categoryMap[product.category]
      if (categoryId) {
        await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: product.title,
            description: product.description,
            price: product.price,
            categoryId
          })
        })
      }
    }

    // Clear cache after seeding
    productsCache = null
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}// Force rebuild Wed Sep 17 00:26:33 PKT 2025
