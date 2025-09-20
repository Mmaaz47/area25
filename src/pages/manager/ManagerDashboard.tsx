import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrUpdateProduct, deleteProductById, getAllProducts, seedIfEmpty, type Product } from '../../api/products'
import { ImagesManager } from './components/ImagesManager'
import { addCategory, getCategories, renameCategory, deleteCategory } from '../../api/categories'

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const API_URL = isDevelopment ? 'http://localhost:4000/api' : 'https://api.6th-space.com/api'

export function ManagerDashboard() {
  const navigate = useNavigate()
  const authed = useMemo(() => {
    const token = sessionStorage.getItem('manager_token')
    const expires = sessionStorage.getItem('manager_token_expires')
    if (!token || !expires) return false
    return new Date(expires) > new Date()
  }, [])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [editing, setEditing] = useState<Product | null>(null)

  useEffect(() => {
    if (!authed) {
      navigate('/manager/login')
      return
    }
    const loadData = async () => {
      setLoading(true)
      try {
        await seedIfEmpty()
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getCategories()
        ])
        setProducts(productsData)
        setCategories(['All', ...categoriesData])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [authed, navigate])

  async function handleSave(product: Product) {
    try {
      console.log('Saving product:', product)
      const saved = await createOrUpdateProduct(product)
      console.log('Product saved:', saved)
      const updatedProducts = await getAllProducts()
      setProducts(updatedProducts)
      setEditing(null)
      // Show success feedback
      alert('Product saved successfully!')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product: ' + (error as any).message)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this product?')) {
      try {
        await deleteProductById(id)
        const updatedProducts = await getAllProducts()
        setProducts(updatedProducts)
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  function startNew() {
    setEditing({ id: crypto.randomUUID(), title: '', price: 0, description: '', category: 'Home Furniture', images: [] })
  }

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

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Manager Dashboard</h2>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Manager Dashboard</h2>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => startNew()}>New Product</button>
        <button style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }} onClick={async () => {
          const token = sessionStorage.getItem('manager_token')
          if (token) {
            try {
              await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              })
            } catch (err) {
              // Ignore logout errors
            }
          }
          sessionStorage.removeItem('manager_token')
          sessionStorage.removeItem('manager_token_expires')
          navigate('/manager/login?loggedOut=1')
        }}>Logout</button>
        <input placeholder="Search products" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} style={{ flex: 1, minWidth: 220 }} />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <CategoryManager />
      {editing && (
        <Editor product={editing} onCancel={() => setEditing(null)} onSave={handleSave} />
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr>
            <th align="left" style={{ padding: 8, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Title</th>
            <th align="left" style={{ padding: 8, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Category</th>
            <th align="right" style={{ padding: 8, background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paged.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 8 }}>{p.title}</td>
              <td style={{ padding: 8 }}>{p.category}</td>
              <td align="right" style={{ padding: 8 }}>{p.price.toLocaleString()} SAR</td>
              <td align="right" style={{ padding: 8 }}>
                <button onClick={() => setEditing(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 8, background: '#fff', color: '#111', border: '1px solid #ddd' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }} disabled={page === 1}>Prev</button>
        <span style={{ alignSelf: 'center' }}>{page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  )
}

function Editor({ product, onCancel, onSave }: { product: Product, onCancel: () => void, onSave: (p: Product) => void }) {
  const [title, setTitle] = useState(product.title)
  const [price, setPrice] = useState(product.price)
  const [description, setDescription] = useState(product.description)
  const [category, setCategory] = useState(product.category)
  const [categoryId, setCategoryId] = useState(product.categoryId || '')
  const [images, setImages] = useState<string[]>(() => {
    // Ensure images are strings, not objects
    const imgs = product.images ?? []
    return imgs.map((img: any) => typeof img === 'string' ? img : img.url || img)
  })
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`)
        const data = await response.json()
        setCategories(data)
        // Set categoryId if not set
        if (!categoryId && data.length > 0) {
          const matchingCat = data.find((c: any) => c.name === product.category)
          if (matchingCat) {
            setCategoryId(matchingCat.id)
          } else {
            setCategoryId(data[0].id)
            setCategory(data[0].name)
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ minHeight: 36, width: '100%' }} />
        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value || '0'))} style={{ minHeight: 36, width: '100%' }} />
        <select value={categoryId} onChange={e => {
          const cat = categories.find(c => c.id === e.target.value)
          if (cat) {
            setCategoryId(cat.id)
            setCategory(cat.name)
          }
        }} style={{ minHeight: 36, width: '100%' }}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="New category" value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ minHeight: 36, flex: '1 1 180px' }} />
          <button type="button" style={{ minHeight: 36, flex: '0 0 auto' }} onClick={async () => {
            if (newCategory.trim()) {
              try {
                await addCategory(newCategory.trim())
                const response = await fetch(`${API_URL}/categories`)
                const data = await response.json()
                setCategories(data)
                const newCat = data.find((c: any) => c.name === newCategory.trim())
                if (newCat) {
                  setCategoryId(newCat.id)
                  setCategory(newCat.name)
                }
                setNewCategory('')
              } catch (error) {
                console.error('Error adding category:', error)
              }
            }
          }}>Add</button>
        </div>
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{ minHeight: 40 }} onClick={() => onSave({ id: product.id, title, price, description, category, categoryId, images })}>Save</button>
        <button onClick={onCancel} style={{ marginLeft: 0, minHeight: 40, background: '#fff', color: '#111', border: '1px solid #ddd' }}>Cancel</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <ImagesManager productId={product.id} images={images} onChange={(newImages) => {
          console.log('Editor received new images:', newImages)
          setImages(newImages)
        }} />
      </div>
    </div>
  )
}

function CategoryManager() {
  const [, setListVersion] = useState(0)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [selected, setSelected] = useState<string>('')
  const [name, setName] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      const response = await fetch(`${API_URL}/categories`)
      const data = await response.json()
      setCategories(data)
    }
    loadCategories()
  }, [])

  async function refresh() {
    setListVersion(v => v + 1)
    const response = await fetch(`${API_URL}/categories`)
    const data = await response.json()
    setCategories(data)
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong>Categories</strong>
        <select value={selected} onChange={e => setSelected(e.target.value)} style={{ minHeight: 36 }}>
          <option value="">Select</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="New name" value={name} onChange={e => setName(e.target.value)} style={{ minHeight: 36, flex: '1 1 180px' }} />
        <button type="button" style={{ minHeight: 36 }} onClick={async () => {
          if (selected && name.trim()) {
            await renameCategory(selected, name.trim())
            setSelected('')
            setName('')
            await refresh()
          }
        }}>Rename</button>
        <button type="button" onClick={async () => {
          if (selected && confirm('Delete category and keep products unchanged?')) {
            await deleteCategory(selected)
            setSelected('')
            await refresh()
          }
        }} style={{ background: '#fff', color: '#111', border: '1px solid #ddd', minHeight: 36 }}>Delete</button>
      </div>
      <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>Deleting a category does not remove products; their category label will remain until edited.</div>
    </div>
  )
}


