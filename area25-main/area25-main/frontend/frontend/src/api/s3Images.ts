const API_BASE = '/api'

export interface S3Status {
  configured: boolean
  bucket: string | null
  region: string | null
}

export interface PresignedUploadData {
  uploadUrl: string
  key: string
  url: string
}

// Check if S3 is configured
export async function checkS3Status(): Promise<S3Status> {
  try {
    const response = await fetch(`${API_BASE}/images-s3/status`)
    if (!response.ok) throw new Error('Failed to check S3 status')
    return await response.json()
  } catch (error) {
    console.error('Error checking S3 status:', error)
    return { configured: false, bucket: null, region: null }
  }
}

// Get presigned URL for direct upload
export async function getPresignedUploadUrl(
  productId: string,
  mimeType: string
): Promise<PresignedUploadData | null> {
  try {
    const response = await fetch(`${API_BASE}/images-s3/presigned-url/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType })
    })
    if (!response.ok) throw new Error('Failed to get presigned URL')
    return await response.json()
  } catch (error) {
    console.error('Error getting presigned URL:', error)
    return null
  }
}

// Upload image directly to S3 using presigned URL
export async function uploadToS3(
  presignedUrl: string,
  file: File
): Promise<boolean> {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })
    return response.ok
  } catch (error) {
    console.error('Error uploading to S3:', error)
    return false
  }
}

// Upload image through backend (fallback method)
export async function uploadImageViaBackend(
  productId: string,
  file: File
): Promise<{ url: string; key: string } | null> {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE}/images-s3/upload/${productId}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Failed to upload image')
    const data = await response.json()
    return data.image
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

// Delete image from S3
export async function deleteImageFromS3(
  productId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/images-s3/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, imageUrl })
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}