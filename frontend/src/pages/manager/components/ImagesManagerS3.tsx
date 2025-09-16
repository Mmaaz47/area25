import React from 'react'
import { uploadImageToS3, deleteImageFromS3 } from '../../../api/s3Upload'

type Props = {
  productId: string
  images: string[]
  onChange: (images: string[]) => void
}

export function ImagesManagerS3({ productId, images, onChange }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState<{ [key: string]: number }>({})
  const [useS3, setUseS3] = React.useState<boolean>(false) // Toggle between S3 and local storage

  // Check if S3 is configured
  React.useEffect(() => {
    // Check if backend has S3 configured by looking for env variable indicator
    fetch('/api/images-s3/status')
      .then(res => {
        if (res.ok) setUseS3(true)
      })
      .catch(() => setUseS3(false))
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
      const fileId = `${Date.now()}-${file.name}`

      try {
        if (useS3) {
          // Upload to S3
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

          const url = await uploadImageToS3(productId, file)

          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
          onChange([...(images || []), url])

          // Clean up progress after a delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev }
              delete newProgress[fileId]
              return newProgress
            })
          }, 1000)
        } else {
          // Local fallback: store as data URLs
          const dataUrl = await readFileAsDataURL(file)
          onChange([...(images || []), dataUrl])
        }
      } catch (err) {
        console.error('Upload error:', err)
        setError(`Failed to upload ${file.name}`)
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }
    }

    setLoading(false)
  }

  async function handleRemove(url: string) {
    try {
      if (useS3 && url.startsWith('http')) {
        // Delete from S3
        await deleteImageFromS3(productId, url)
      }
      // Remove from local state
      onChange(images.filter(u => u !== url))
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete image')
    }
  }

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Product Images</strong>
        {useS3 && (
          <span style={{ fontSize: 12, color: '#10b981' }}>S3 Storage Active</span>
        )}
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {images && images.length > 0 ? images.map((u, index) => (
          <div key={`${index}-${u.substring(0, 50)}`} style={{ width: 96, display: 'grid', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={u}
                alt=""
                style={{
                  width: 96,
                  height: 96,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: '1px solid #eee'
                }}
              />
              {u.startsWith('http') && (
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: 3,
                    fontSize: 10
                  }}
                >
                  S3
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(u)}
              style={{
                background: '#fff',
                color: '#111',
                border: '1px solid #ddd',
                fontSize: 12,
                padding: '4px 8px'
              }}
            >
              Remove
            </button>
          </div>
        )) : (
          <span style={{ color: '#6b7280' }}>
            {loading ? 'Uploading…' : 'No images yet'}
          </span>
        )}
      </div>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).length > 0 && (
        <div style={{ marginTop: 8 }}>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} style={{ marginBottom: 4 }}>
              <div style={{
                background: '#e5e7eb',
                borderRadius: 4,
                height: 4,
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    background: '#3b82f6',
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ color: '#ef4444', marginTop: 8, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e => handleFilesSelected(e.target.files)}
          disabled={loading}
        />

        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={!useS3}
            onChange={e => setUseS3(!e.target.checked)}
          />
          Use local storage (for testing)
        </label>
      </div>

      {!useS3 && (
        <div style={{
          marginTop: 8,
          padding: 8,
          background: '#fef3c7',
          borderRadius: 4,
          fontSize: 12,
          color: '#92400e'
        }}>
          Note: Images are stored locally as base64. Configure S3 for production use.
        </div>
      )}
    </div>
  )
}