import { prisma } from '../db'
import { migrateBase64ToS3 } from '../services/s3Upload'
import dotenv from 'dotenv'

dotenv.config()

async function migrateImagesToS3() {
  console.log('Starting migration of base64 images to S3...')

  try {
    // Check S3 configuration
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials not configured in .env file')
      console.log('Please add the following to your .env file:')
      console.log('AWS_ACCESS_KEY_ID=your-access-key')
      console.log('AWS_SECRET_ACCESS_KEY=your-secret-key')
      console.log('S3_BUCKET_NAME=area25-furniture-images')
      console.log('AWS_REGION=eu-north-1')
      process.exit(1)
    }

    // Get all products with images
    const products = await prisma.product.findMany({
      where: {
        NOT: {
          images: {
            equals: null
          }
        }
      }
    })

    console.log(`Found ${products.length} products to check`)

    let migratedCount = 0
    let errorCount = 0

    for (const product of products) {
      if (!product.images || product.images.length === 0) continue

      const newImages: string[] = []
      let hasBase64 = false

      for (const image of product.images) {
        // Check if image is base64
        if (image.startsWith('data:image')) {
          hasBase64 = true
          console.log(`Migrating image for product: ${product.title}`)

          try {
            const uploadedImage = await migrateBase64ToS3(image, product.id)
            newImages.push(uploadedImage.url)
            console.log(`✓ Migrated to: ${uploadedImage.url}`)
            migratedCount++
          } catch (error) {
            console.error(`✗ Failed to migrate image:`, error)
            errorCount++
            // Keep the base64 image if migration fails
            newImages.push(image)
          }
        } else {
          // Keep existing S3 URLs
          newImages.push(image)
        }
      }

      // Update product with new image URLs if any were migrated
      if (hasBase64) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: newImages }
        })
        console.log(`Updated product ${product.title} with new image URLs`)
      }
    }

    console.log('\nMigration complete!')
    console.log(`Successfully migrated: ${migratedCount} images`)
    if (errorCount > 0) {
      console.log(`Failed to migrate: ${errorCount} images`)
    }

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateImagesToS3()
}