import { S3Client } from '@aws-sdk/client-s3'

// S3 configuration
export const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'area25-furniture-images',
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
}

// Create S3 client
export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey
  }
})

// Generate S3 URL for uploaded files
export function getS3Url(key: string): string {
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`
}