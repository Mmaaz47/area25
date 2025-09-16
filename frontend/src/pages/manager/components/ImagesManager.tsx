import React from 'react'
import {
  checkS3Status,
  getPresignedUploadUrl,
  uploadToS3,
  uploadImageViaBackend,
  deleteImageFromS3
} from '../../../api/s3Images'

type Props = {
  productId: string
  images: string[]
  onChange: (images: string[]) => void
}

export function ImagesManager({ productId, images, onChange }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [s3Configured, setS3Configured] = React.useState<boolean>(false)
  const [useLocalFallback, setUseLocalFallback] = React.useState<boolean>(true)

  React.useEffect(() => {
    // Check if S3 is configured
    checkS3Status().then(status => {
      setS3Configured(status.configured)
      // Auto-disable local fallback if S3 is configured
      if (status.configured) {
        setUseLocalFallback(false)
      }
    })
  }, [])

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
    setLoading(true)

    for (const file of Array.from(files)) {
      if (!useLocalFallback && s3Configured) {
        try {
          // Try presigned URL upload first (faster)
          const presignData = await getPresignedUploadUrl(productId, file.type || 'image/jpeg')
          if (presignData) {
            const uploaded = await uploadToS3(presignData.uploadUrl, file)
            if (uploaded) {
              onChange([...(images || []), presignData.url])
              continue
            }
          }

          // Fallback to backend upload if presigned fails
          const result = await uploadImageViaBackend(productId, file)
          if (result) {
            onChange([...(images || []), result.url])
            continue
          }
        } catch (error) {
          console.error('S3 upload failed:', error)
          // Fall through to local storage
        }
      }

      // Local fallback: store as data URLs
      try {
        const dataUrl = await readFileAsDataURL(file)
        onChange([...(images || []), dataUrl])
      } catch {
        setError('Failed to read file')
      }
    }
    setLoading(false)
  }

  async function handleRemove(url: string) {
    let removedViaApi = false
    if (!useLocalFallback && s3Configured && !url.startsWith('data:')) {
      try {
        const ok = await deleteImageFromS3(productId, url)
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
        {images && images.length > 0 ? images.map((u, index) => (
          <div key={`${index}-${u.substring(0, 50)}`} style={{ width: 96, display: 'grid', gap: 6 }}>
            <img src={u} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
            <button type="button" onClick={() => handleRemove(u)} style={{ background: '#fff', color: '#111', border: '1px solid #ddd' }}>Remove</button>
          </div>
        )) : (
          <span style={{ color: '#6b7280' }}>{loading ? 'Loading…' : 'No images yet'}</span>
        )}
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input type="file" multiple accept="image/*" onChange={e => handleFilesSelected(e.target.files)} disabled={loading} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
          <input type="checkbox" checked={useLocalFallback} onChange={e => setUseLocalFallback(e.target.checked)} />
          {s3Configured ? 'Use local storage (bypass S3)' : 'Use local preview storage (S3 not configured)'}
        </label>
        {loading && <span style={{ fontSize: 12, color: '#6b7280' }}>Uploading...</span>}
      </div>
    </div>
  )
}


