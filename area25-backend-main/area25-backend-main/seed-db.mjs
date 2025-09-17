import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Seeding database...\n')

  try {
    // Check if categories exist
    const existingCategories = await prisma.category.count()

    if (existingCategories === 0) {
      console.log('Creating default categories...')

      const categories = [
        { name: 'Home Furniture' },
        { name: 'Office Furniture' },
        { name: 'Lightings' },
        { name: 'Home Decor' }
      ]

      for (const cat of categories) {
        const created = await prisma.category.create({
          data: cat
        })
        console.log(`✅ Created category: ${created.name}`)
      }
    } else {
      console.log(`Categories already exist: ${existingCategories} found`)
    }

    // Check if products exist
    const existingProducts = await prisma.product.count()

    if (existingProducts === 0) {
      console.log('\nCreating sample products...')

      const categories = await prisma.category.findMany()
      const categoryMap = {}
      categories.forEach(cat => {
        categoryMap[cat.name] = cat.id
      })

      const products = [
        {
          title: 'Modern Sofa',
          description: 'Comfortable 3-seater sofa in premium fabric',
          price: 2499.99,
          categoryId: categoryMap['Home Furniture']
        },
        {
          title: 'Executive Desk',
          description: 'Spacious wooden desk with built-in storage',
          price: 1899.99,
          categoryId: categoryMap['Office Furniture']
        },
        {
          title: 'Crystal Chandelier',
          description: 'Elegant crystal chandelier for dining rooms',
          price: 3499.99,
          categoryId: categoryMap['Lightings']
        },
        {
          title: 'Wall Art Set',
          description: 'Modern abstract wall art, set of 3',
          price: 599.99,
          categoryId: categoryMap['Home Decor']
        }
      ]

      for (const product of products) {
        if (product.categoryId) {
          const created = await prisma.product.create({
            data: product
          })
          console.log(`✅ Created product: ${created.title}`)
        }
      }
    } else {
      console.log(`\nProducts already exist: ${existingProducts} found`)
    }

    console.log('\n✨ Database seeding complete!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()