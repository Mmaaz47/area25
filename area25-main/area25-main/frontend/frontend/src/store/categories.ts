const STORAGE_KEY = 'furniture_categories'

const defaultCategories = ['Home Furniture', 'Home Decor', 'Lightings', 'Rugs', 'Office Furniture'] as const

function read(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return Array.from(defaultCategories)
  try { return JSON.parse(raw) as string[] } catch { return Array.from(defaultCategories) }
}

function write(list: string[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }

export function getCategories(): string[] { return read() }

export function addCategory(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  const list = new Set(read())
  list.add(trimmed)
  write(Array.from(list))
  window.dispatchEvent(new Event('categories:update'))
}

export function renameCategory(oldName: string, newName: string) {
  const trimmed = newName.trim()
  if (!trimmed || oldName === trimmed) return
  const current = read()
  const next = current.map(c => c === oldName ? trimmed : c)
  write(Array.from(new Set(next)))
  window.dispatchEvent(new Event('categories:update'))
}

export function deleteCategory(name: string) {
  const next = read().filter(c => c !== name)
  write(next)
  window.dispatchEvent(new Event('categories:update'))
}


