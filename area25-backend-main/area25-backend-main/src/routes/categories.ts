import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Simple cache for categories
const cache = {
  categories: null as any,
  timestamp: 0,
  TTL: 60000 // 60 seconds cache for categories (they change less often)
}

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
})

export function router(prisma: PrismaClient) {
  const router = Router()

  router.get('/', async (_req, res) => {
    try {
      // Use cache if available
      if (cache.categories && Date.now() - cache.timestamp < cache.TTL) {
        return res.json(cache.categories)
      }

      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          _count: {
            select: { products: true }
          }
        }
      })

      // If no categories exist, create defaults
      if (categories.length === 0) {
        console.log('No categories found, creating defaults...')
        const defaultCategories = [
          'Home Furniture',
          'Office Furniture',
          'Lightings',
          'Home Decor'
        ]

        for (const name of defaultCategories) {
          try {
            const created = await prisma.category.create({
              data: { name },
              select: {
                id: true,
                name: true,
                _count: {
                  select: { products: true }
                }
              }
            })
            categories.push(created)
          } catch (err) {
            console.error(`Failed to create category ${name}:`, err)
          }
        }
      }

      // Cache the result
      cache.categories = categories
      cache.timestamp = Date.now()

      res.json(categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      res.status(500).json({ error: 'Failed to fetch categories' })
    }
  })

  router.post('/', async (req, res) => {
    try {
      const data = createCategorySchema.parse(req.body)
      const category = await prisma.category.create({
        data,
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      // Invalidate cache
      cache.categories = null

      res.status(201).json(category)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error creating category:', error)
      res.status(500).json({ error: 'Failed to create category' })
    }
  })

  // UPDATE/RENAME category
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params
      const data = createCategorySchema.parse(req.body)

      const updated = await prisma.category.update({
        where: { id },
        data: { name: data.name },
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      // Invalidate cache
      cache.categories = null

      res.json(updated)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error('Error updating category:', error)
      res.status(500).json({ error: 'Failed to update category' })
    }
  })

  router.delete('/:id', async (req, res) => {
    try {
      await prisma.category.delete({
        where: { id: req.params.id }
      })

      // Invalidate cache
      cache.categories = null

      res.status(204).send()
    } catch (error) {
      console.error('Error deleting category:', error)
      res.status(500).json({ error: 'Failed to delete category' })
    }
  })

  return router
}