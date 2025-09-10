import { getCart, removeFromCart, setQuantity, clearCart } from '../../store/cart'
import { getAllProducts } from '../../store/products'
import { useMemo, useState } from 'react'

export function CartPage() {
  const [version, setVersion] = useState(0)
  const products = getAllProducts()
  const items = useMemo(() => getCart().map(i => ({ ...i, product: products.find(p => p.id === i.id)! })).filter(i => i.product), [version])
  const total = items.reduce((sum, i) => sum + i.qty * i.product.price, 0)

  function refresh() { setVersion(v => v + 1) }

  return (
    <div style={{ padding: 16 }}>
      <h2>Cart</h2>
      {items.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th>Qty</th>
                <th align="right">Price</th>
                <th align="right">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.product.title}</td>
                  <td align="center">
                    <input type="number" min={1} value={i.qty} onChange={e => { setQuantity(i.id, parseInt(e.target.value || '1')); refresh() }} style={{ width: 64 }} />
                  </td>
                  <td align="right">{i.product.price.toLocaleString()} SAR</td>
                  <td align="right">{(i.product.price * i.qty).toLocaleString()} SAR</td>
                  <td align="right"><button onClick={() => { removeFromCart(i.id); refresh() }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => { clearCart(); refresh() }} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>Clear Cart</button>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Total: {total.toLocaleString()} SAR</div>
          </div>
        </>
      )}
    </div>
  )
}


