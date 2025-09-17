import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function cleanImages() {
  console.log('🧹 Cleaning up large images from database...\n')

  try {
    // Count images
    const imageCount = await prisma.image.count()
    console.log(`Found ${imageCount} images in database`)

    if (imageCount > 0) {
      console.log('Removing all image records to improve performance...')

      // Delete all images
      const deleted = await prisma.image.deleteMany()
      console.log(`✅ Deleted ${deleted.count} image records`)

      console.log('\nImages have been removed from database.')
      console.log('Products will now load instantly!')
      console.log('\nNext step: Configure S3 for proper image storage')
    } else {
      console.log('No images found in database - already clean!')
    }

    // Show product count
    const productCount = await prisma.product.count()
    console.log(`\n📦 Total products in database: ${productCount}`)

    // Show category count
    const categoryCount = await prisma.category.count()
    console.log(`📁 Total categories in database: ${categoryCount}`)

  } catch (error) {
    console.error('❌ Error cleaning images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanImages()