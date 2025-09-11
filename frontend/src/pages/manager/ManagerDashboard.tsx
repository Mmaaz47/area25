import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrUpdateProduct, deleteProductById, getAllProducts, seedIfEmpty, type Product } from '../../store/products'
import { ImagesManager } from './components/ImagesManager'
import { addCategory, getCategories, renameCategory, deleteCategory } from '../../store/categories'

export function ManagerDashboard() {
  const navigate = useNavigate()
  const authed = useMemo(() => localStorage.getItem('manager_auth') === '1', [])
  const [products, setProducts] = useState<Product[]>([])
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
    seedIfEmpty()
    setProducts(getAllProducts())
  }, [authed, navigate])

  function handleSave(product: Product) {
    createOrUpdateProduct(product)
    setProducts(getAllProducts())
    setEditing(null)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this product?')) {
      deleteProductById(id)
      setProducts(getAllProducts())
    }
  }

  function startNew() {
    setEditing({ id: crypto.randomUUID(), title: '', price: 0, description: '', category: 'Home Furniture', images: [] })
  }

  const categories = useMemo(() => ['All', ...getCategories()], [products])
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

  return (
    <div style={{ padding: 16 }}>
      <h2>Manager Dashboard</h2>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => startNew()}>New Product</button>
        <button style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }} onClick={() => { localStorage.removeItem('manager_auth'); navigate('/manager/login?loggedOut=1') }}>Logout</button>
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
  const [images, setImages] = useState<string[]>(product.images ?? [])
  const [newCategory, setNewCategory] = useState('')

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value || '0'))} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {getCategories().map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="New category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <button type="button" onClick={() => { if (newCategory.trim()) { addCategory(newCategory); setCategory(newCategory.trim()); setNewCategory('') } }}>Add</button>
        </div>
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => onSave({ id: product.id, title, price, description, category, images })}>Save</button>
        <button onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <ImagesManager productId={product.id} images={images} onChange={setImages} />
      </div>
    </div>
  )
}

function CategoryManager() {
  const [listVersion, setListVersion] = useState(0)
  const categories = useMemo(() => getCategories(), [listVersion])
  const [selected, setSelected] = useState<string>('')
  const [name, setName] = useState('')

  function refresh() { setListVersion(v => v + 1) }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong>Categories</strong>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="New name" value={name} onChange={e => setName(e.target.value)} />
        <button type="button" onClick={() => { if (selected && name.trim()) { renameCategory(selected, name); setSelected(name.trim()); setName(''); refresh() } }}>Rename</button>
        <button type="button" onClick={() => { if (selected && confirm('Delete category and keep products unchanged?')) { deleteCategory(selected); setSelected(''); refresh() } }} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>Delete</button>
      </div>
      <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>Deleting a category does not remove products; their category label will remain until edited.</div>
    </div>
  )
}


