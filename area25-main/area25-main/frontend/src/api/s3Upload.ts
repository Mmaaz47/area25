// PRODUCTION API URL - Using custom domain with HTTPS
const BACKEND_URL = 'https://api.6th-space.com'
const API_BASE = `${BACKEND_URL}/api`



export interface PresignedUploadData {
  uploadUrl: string
  key: string
  url: string
}

// Get presigned URL for direct S3 upload
export async function getPresignedUploadUrl(
  productId: string,
  file: File
): Promise<PresignedUploadData> {
  const response = await fetch(`${API_BASE}/images-s3/presigned-url/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mimeType: file.type,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get upload URL')
  }

  return response.json()
}

// Upload file directly to S3 using presigned URL
export async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to upload to S3')
  }
}

// Complete upload process: get presigned URL and upload
export async function uploadImageToS3(
  productId: string,
  file: File
): Promise<string> {
  try {
    // Get presigned URL
    const presignedData = await getPresignedUploadUrl(productId, file)

    // Upload to S3
    await uploadToS3(presignedData.uploadUrl, file)

    // Return the final URL
    return presignedData.url
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

// Delete image from S3
export async function deleteImageFromS3(
  productId: string,
  imageUrl: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/images-s3/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      imageUrl,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
}