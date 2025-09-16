// Force production URL
function getApiBase() {
  return 'http://area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com/api'
}
const API_BASE = getApiBase()

// API service for categories


export interface Category {
  id: string
  name: string
  _count?: { products: number }
}

let categoriesCache: Category[] | null = null

export async function getCategories(): Promise<string[]> {
  const cats = await getCategoriesWithDetails()
  return cats.map(c => c.name)
}

export async function getCategoriesWithDetails(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache

  try {
    const response = await fetch(`${API_BASE}/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    const data = await response.json()
    categoriesCache = data
    return categoriesCache
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function addCategory(name: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    if (!response.ok) throw new Error('Failed to add category')
    categoriesCache = null // Clear cache
  } catch (error) {
    console.error('Error adding category:', error)
    throw error
  }
}

export async function renameCategory(categoryId: string, newName: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    if (!response.ok) throw new Error('Failed to rename category')
    categoriesCache = null // Clear cache
  } catch (error) {
    console.error('Error renaming category:', error)
    throw error
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete category')
    categoriesCache = null // Clear cache
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}