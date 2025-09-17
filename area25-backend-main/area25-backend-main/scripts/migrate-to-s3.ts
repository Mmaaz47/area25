import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { migrateBase64ToS3 } from '../src/services/s3Upload'
import { s3Config } from '../src/config/s3'

const prisma = new PrismaClient()

async function migrateImagesToS3() {
  console.log('Starting migration of images to S3...')
  console.log('S3 Bucket:', s3Config.bucketName)
  console.log('AWS Region:', s3Config.region)

  // Check if S3 is configured
  if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
    console.error('❌ AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env')
    process.exit(1)
  }

  try {
    // Get all products with base64 images
    const products = await prisma.product.findMany({
      include: { images: true }
    })

    let migratedCount = 0
    let errorCount = 0

    for (const product of products) {
      console.log(`\nProcessing product: ${product.title} (${product.id})`)

      // Check if product has base64 images in the old format
      const base64Images = product.images.filter(img =>
        img.url.startsWith('data:image') || img.key.startsWith('data:image')
      )

      if (base64Images.length === 0) {
        console.log('  No base64 images to migrate')
        continue
      }

      console.log(`  Found ${base64Images.length} base64 images to migrate`)

      const newImages = []

      for (const image of base64Images) {
        try {
          const base64Data = image.url.startsWith('data:image') ? image.url : image.key
          const uploaded = await migrateBase64ToS3(base64Data, product.id)

          // Update the image record
          await prisma.productImage.update({
            where: { id: image.id },
            data: {
              key: uploaded.key,
              url: uploaded.url
            }
          })

          newImages.push(uploaded)
          migratedCount++
          console.log(`  ✅ Migrated image to: ${uploaded.url}`)
        } catch (error) {
          console.error(`  ❌ Failed to migrate image:`, error)
          errorCount++
        }
      }
    }

    console.log('\n=================================')
    console.log(`Migration completed!`)
    console.log(`✅ Successfully migrated: ${migratedCount} images`)
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} images`)
    }
    console.log('=================================')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateImagesToS3()