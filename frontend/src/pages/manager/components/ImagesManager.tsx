import React from 'react'

type Props = {
  productId: string
  images: string[]
  onChange: (images: string[]) => void
}

// Placeholder API client functions. Backend should provide endpoints to create presigned URLs
// and to list existing product images. Replace the fetch URLs when backend is ready.
async function getProductImages(productId: string): Promise<string[]> {
  const res = await fetch(`/api/manager/products/${encodeURIComponent(productId)}/images`, { credentials: 'include' })
  if (!res.ok) return []
  return res.json()
}

async function requestUploadUrl(productId: string, filename: string, contentType: string): Promise<{ uploadUrl: string, publicUrl: string } | null> {
  const res = await fetch(`/api/manager/products/${encodeURIComponent(productId)}/images/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ filename, contentType })
  })
  if (!res.ok) return null
  return res.json()
}

async function deleteImage(productId: string, keyOrUrl: string): Promise<boolean> {
  const res = await fetch(`/api/manager/products/${encodeURIComponent(productId)}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ image: keyOrUrl })
  })
  return res.ok
}

export function ImagesManager({ productId, images, onChange }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [useLocalFallback, setUseLocalFallback] = React.useState<boolean>(true)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    getProductImages(productId)
      .then(list => { if (mounted && list.length) onChange(list) })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [productId])

  function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    for (const file of Array.from(files)) {
      if (!useLocalFallback) {
        try {
          const presign = await requestUploadUrl(productId, file.name, file.type || 'application/octet-stream')
          if (!presign) throw new Error('no presign')
          const putRes = await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } })
          if (!putRes.ok) throw new Error('upload failed')
          onChange([...(images || []), presign.publicUrl])
          continue
        } catch {
          // fall through to local store
        }
      }
      // Local fallback: store small data URLs so we can preview and persist locally until backend is ready
      try {
        const dataUrl = await readFileAsDataURL(file)
        onChange([...(images || []), dataUrl])
      } catch {
        setError('Failed to read file')
      }
    }
  }

  async function handleRemove(url: string) {
    let removedViaApi = false
    if (!useLocalFallback) {
      try {
        const ok = await deleteImage(productId, url)
        removedViaApi = ok
      } catch {
        removedViaApi = false
      }
    }
    // Always remove locally if using fallback, if URL is a data URL, or if API removal failed
    if (useLocalFallback || url.startsWith('data:') || !removedViaApi) {
      onChange(images.filter(u => u !== url))
    }
  }

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
      <strong>Product Images</strong>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {images && images.length > 0 ? images.map(u => (
          <div key={u} style={{ width: 96, display: 'grid', gap: 6 }}>
            <img src={u} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
            <button type="button" onClick={() => handleRemove(u)} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>Remove</button>
          </div>
        )) : (
          <span style={{ color: '#6b7280' }}>{loading ? 'Loading…' : 'No images yet'}</span>
        )}
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input type="file" multiple accept="image/*" onChange={e => handleFilesSelected(e.target.files)} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
          <input type="checkbox" checked={useLocalFallback} onChange={e => setUseLocalFallback(e.target.checked)} />
          Use local preview storage (no upload)
        </label>
      </div>
    </div>
  )
}


