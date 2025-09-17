import { Router } from 'express'
import multer from 'multer'
import { uploadImageToS3, deleteImageFromS3, getPresignedUploadUrl } from '../services/s3Upload'
import { PrismaClient } from '@prisma/client'
import { s3Config } from '../config/s3'

const prisma = new PrismaClient()

const router = Router()

// Check S3 configuration status
router.get('/status', (req, res) => {
  const isConfigured = !!(
    s3Config.accessKeyId &&
    s3Config.secretAccessKey &&
    s3Config.bucketName
  )

  res.json({
    configured: isConfigured,
    bucket: isConfigured ? s3Config.bucketName : null,
    region: isConfigured ? s3Config.region : null
  })
})

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// Upload image to S3
router.post('/upload/:productId', upload.single('image'), async (req, res) => {
  try {
    const { productId } = req.params
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Upload to S3
    const uploadedImage = await uploadImageToS3(
      file.buffer,
      file.mimetype,
      productId
    )

    // Update product with new image URL
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Add new image URL to product
    const currentImages = product.images || []
    const updatedImages = [...currentImages, uploadedImage.url]

    await prisma.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    })

    res.json({
      message: 'Image uploaded successfully',
      image: uploadedImage,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// Get presigned URL for direct upload
router.post('/presigned-url/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { mimeType } = req.body

    if (!mimeType || !mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid mime type' })
    }

    const presignedData = await getPresignedUploadUrl(productId, mimeType)

    res.json(presignedData)
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
})

// Delete image from S3
router.delete('/delete', async (req, res) => {
  try {
    const { productId, imageUrl } = req.body

    if (!productId || !imageUrl) {
      return res.status(400).json({ error: 'Product ID and image URL required' })
    }

    // Extract S3 key from URL
    const urlParts = imageUrl.split('.amazonaws.com/')
    if (urlParts.length !== 2) {
      return res.status(400).json({ error: 'Invalid S3 URL' })
    }
    const key = urlParts[1]

    // Delete from S3
    await deleteImageFromS3(key)

    // Update product to remove image URL
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (product) {
      const updatedImages = (product.images || []).filter(img => img !== imageUrl)
      await prisma.product.update({
        where: { id: productId },
        data: { images: updatedImages },
      })
    }

    res.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

export default router