const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function showProducts() {
  try {
    // Get all products with categories
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n========== PRODUCTS IN DATABASE (Total: ${products.length}) ==========\n`)

    if (products.length === 0) {
      console.log('No products found in database.')
      console.log('Products will be seeded automatically when you open the frontend.')
    } else {
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Price: $${product.price}`)
        console.log(`   Category: ${product.category?.name || 'N/A'}`)
        console.log(`   Description: ${product.description}`)
        console.log(`   Images: ${product.images.length} image(s)`)
        console.log(`   Created: ${product.createdAt}`)
        console.log('   ---')
      })
    }

    // Also show categories
    const categories = await prisma.category.findMany()
    console.log(`\n========== CATEGORIES (Total: ${categories.length}) ==========\n`)
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id})`)
    })

  } catch (error) {
    console.error('Error connecting to database:', error.message)
    console.log('\nMake sure the backend is configured and database is accessible.')
  } finally {
    await prisma.$disconnect()
  }
}

showProducts()