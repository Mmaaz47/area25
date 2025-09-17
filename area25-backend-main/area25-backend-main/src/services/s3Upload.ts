import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client, s3Config, getS3Url } from '../config/s3'
import { v4 as uuidv4 } from 'uuid'

export interface UploadedImage {
  url: string
  key: string
}

// Upload image to S3
export async function uploadImageToS3(
  buffer: Buffer,
  mimeType: string,
  productId: string
): Promise<UploadedImage> {
  const fileExtension = mimeType.split('/')[1] || 'jpg'
  const key = `products/${productId}/${uuidv4()}.${fileExtension}`

  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    // Public access handled by bucket policy
  })

  try {
    await s3Client.send(command)
    return {
      url: getS3Url(key),
      key,
    }
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload image')
  }
}

// Delete image from S3
export async function deleteImageFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  })

  try {
    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed to delete image')
  }
}

// Generate presigned URL for direct upload from frontend
export async function getPresignedUploadUrl(
  productId: string,
  mimeType: string
): Promise<{ uploadUrl: string; key: string; url: string }> {
  const fileExtension = mimeType.split('/')[1] || 'jpg'
  const key = `products/${productId}/${uuidv4()}.${fileExtension}`

  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: mimeType,
    // Public access handled by bucket policy
  })

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return {
      uploadUrl,
      key,
      url: getS3Url(key),
    }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw new Error('Failed to generate upload URL')
  }
}

// Migrate base64 image to S3
export async function migrateBase64ToS3(
  base64Image: string,
  productId: string
): Promise<UploadedImage> {
  // Extract mime type and data from base64 string
  const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format')
  }

  const mimeType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, 'base64')

  return uploadImageToS3(buffer, mimeType, productId)
}