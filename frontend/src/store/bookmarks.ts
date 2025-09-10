const STORAGE_KEY = 'furniture_bookmarks'

function read(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as string[] } catch { return [] }
}

function write(ids: string[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) }

export function getBookmarks(): string[] { return read() }
export function getBookmarksCount(): number { return read().length }

export function toggleBookmark(id: string) {
  const set = new Set(read())
  if (set.has(id)) { set.delete(id) } else { set.add(id) }
  write(Array.from(set))
  window.dispatchEvent(new Event('bookmarks:update'))
}

export function isBookmarked(id: string): boolean {
  return new Set(read()).has(id)
}


