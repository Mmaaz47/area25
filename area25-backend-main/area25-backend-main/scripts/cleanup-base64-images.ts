import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupBase64Images() {
  console.log('Cleaning up base64 images from database...')

  try {
    // Find all images with base64 data
    const images = await prisma.image.findMany()
    let cleaned = 0

    for (const image of images) {
      // Check if it's a base64 image
      if (image.url.startsWith('data:') || image.key.startsWith('data:')) {
        // Delete the base64 image record
        await prisma.image.delete({
          where: { id: image.id }
        })
        cleaned++
        console.log(`Deleted base64 image for product ${image.productId}`)
      }
    }

    console.log(`✅ Cleaned up ${cleaned} base64 images`)

    // Also clean up any products without valid categories
    const products = await prisma.product.findMany({
      include: { category: true }
    })

    for (const product of products) {
      if (!product.category) {
        const firstCategory = await prisma.category.findFirst()
        if (firstCategory) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: firstCategory.id }
          })
          console.log(`Fixed category for product: ${product.title}`)
        }
      }
    }

  } catch (error) {
    console.error('Error cleaning up:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupBase64Images()