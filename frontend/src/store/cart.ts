export type CartItem = { id: string; qty: number }

const STORAGE_KEY = 'furniture_cart'

function read(): CartItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as CartItem[] } catch { return [] }
}

function write(items: CartItem[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }

export function getCart(): CartItem[] { return read() }
export function getCartCount(): number { return read().reduce((s, i) => s + i.qty, 0) }

export function addToCart(id: string, qty: number = 1) {
  const items = read()
  const idx = items.findIndex(i => i.id === id)
  if (idx >= 0) items[idx].qty += qty
  else items.push({ id, qty })
  write(items)
  window.dispatchEvent(new Event('cart:update'))
}

export function setQuantity(id: string, qty: number) {
  const items = read().map(i => i.id === id ? { ...i, qty } : i).filter(i => i.qty > 0)
  write(items)
  window.dispatchEvent(new Event('cart:update'))
}

export function removeFromCart(id: string) {
  write(read().filter(i => i.id !== id))
  window.dispatchEvent(new Event('cart:update'))
}

export function clearCart() { write([]); window.dispatchEvent(new Event('cart:update')) }


