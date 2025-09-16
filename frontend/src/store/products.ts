export type Product = {
  id: string
  title: string
  price: number
  description: string
  category: string
  images?: string[]
}

const STORAGE_KEY = 'area25_products'

const seedData: Product[] = [
  { id: 'vintage-v', title: 'Vintage V Side Table', price: 930.35, description: 'A stylish vintage side table.', category: 'Home Furniture' },
  { id: 'retro-elegance-xviii', title: 'Retro Elegance XVIII Side Table', price: 823.40, description: 'Retro styled side table.', category: 'Home Furniture' },
  { id: 'vintage-iv', title: 'Vintage IV Side Table', price: 1534.10, description: 'Elegant side table.', category: 'Home Furniture' },
  { id: 'serene-spectrum-iv', title: 'Serene Spectrum IV Wall Art', price: 1086.75, description: 'Calming wall art.', category: 'Home Decor' },
  { id: 'midnight-jewel-v', title: 'Midnight Jewel V Wall Art', price: 868.25, description: 'Dark tones wall art.', category: 'Home Decor' },
  { id: 'midnight-luxe-vi', title: 'Midnight Luxe VI Wall Art', price: 1086.75, description: 'Luxurious wall art.', category: 'Home Decor' },
  { id: 'table-lamp-a', title: 'Table Lamp', price: 429.21, description: 'Ambient table lamp.', category: 'Lightings' },
  { id: 'table-lamp-b', title: 'Table Lamp', price: 642.85, description: 'Modern table lamp.', category: 'Lightings' },
  { id: 'table-lamp-c', title: 'Table Lamp', price: 807.30, description: 'Premium table lamp.', category: 'Lightings' },
  { id: 'strata-sit-standing', title: 'Strata Sit Standing Table', price: 3520.15, description: 'Ergonomic sit-stand desk.', category: 'Office Furniture' },
  { id: 'linea-bar-table', title: 'Linéa Bar Table', price: 10353.45, description: 'Bar-height table.', category: 'Office Furniture' },
  { id: 'orlo-reception', title: 'Orlo Reception desk', price: 23411.70, description: 'Reception desk for offices.', category: 'Office Furniture' },
  { id: 'earthy-elegance-viii', title: 'Earthy elegance VIII Wall Art', price: 868.25, description: 'Earth-toned wall art.', category: 'Home Decor' },
]

export function seedIfEmpty() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
  }
}

export function getAllProducts(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as Product[] } catch { return [] }
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find(p => p.id === id)
}

export function createOrUpdateProduct(product: Product) {
  const products = getAllProducts()
  const idx = products.findIndex(p => p.id === product.id)
  if (idx >= 0) products[idx] = product
  else products.push(product)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function deleteProductById(id: string) {
  const products = getAllProducts().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}


