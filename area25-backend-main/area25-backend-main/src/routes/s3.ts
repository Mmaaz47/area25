import { Router } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { z } from 'zod'

const router = Router()

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const signSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().default('image/jpeg'),
})

router.get('/sign', async (req, res) => {
  try {
    const { key, contentType } = signSchema.parse(req.query)
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    res.json({ uploadUrl, publicUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error('Error generating signed URL:', error)
    res.status(500).json({ error: 'Failed to generate signed URL' })
  }
})

export { router }