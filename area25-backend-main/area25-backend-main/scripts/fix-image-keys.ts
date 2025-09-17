import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixImageKeys() {
  console.log('Fixing image keys in database...')

  try {
    const images = await prisma.image.findMany()
    let fixed = 0

    for (const image of images) {
      // If key contains the full URL, extract just the key part
      if (image.key.includes('amazonaws.com')) {
        const urlParts = image.key.split('amazonaws.com/')
        const key = urlParts[1] ? urlParts[1].split('?')[0] : image.key

        await prisma.image.update({
          where: { id: image.id },
          data: {
            key,
            url: image.url.split('?')[0] // Remove query params from URL
          }
        })
        fixed++
        console.log(`Fixed image key: ${key}`)
      }
    }

    console.log(`✅ Fixed ${fixed} image keys`)

  } catch (error) {
    console.error('Error fixing keys:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixImageKeys()