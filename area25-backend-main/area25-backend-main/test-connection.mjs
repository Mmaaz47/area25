import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  console.log('Testing database connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL)

  try {
    // Test 1: Basic connection
    console.log('\n1. Testing $connect()...')
    await prisma.$connect()
    console.log('✅ Connected successfully')

    // Test 2: Simple query with timeout
    console.log('\n2. Testing simple query...')
    const startTime = Date.now()
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
      )
    ])
    const elapsed = Date.now() - startTime
    console.log(`✅ Query successful in ${elapsed}ms:`, result)

    // Test 3: Count categories
    console.log('\n3. Testing category count...')
    const categoryCount = await Promise.race([
      prisma.category.count(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Count timeout after 5s')), 5000)
      )
    ])
    console.log(`✅ Found ${categoryCount} categories`)

    // Test 4: Fetch products
    console.log('\n4. Testing product fetch...')
    const products = await Promise.race([
      prisma.product.findMany({ take: 1 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fetch timeout after 5s')), 5000)
      )
    ])
    console.log(`✅ Found ${products.length} products`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('\nDisconnected from database')
  }
}

testConnection()