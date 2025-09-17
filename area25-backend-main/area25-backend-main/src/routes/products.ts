import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'

// Simple in-memory cache
const cache = {
  products: null as any,
  timestamp: 0,
  TTL: 30000 // 30 seconds cache
}

function createThumbnail(dataUrl: string): string {
  // Keep only first 10KB of base64 data for a low-quality preview
  // This reduces 1-2MB images to ~10KB
  const maxLength = 10000
  if (dataUrl.length > maxLength) {
    // Try to keep the data URL valid by finding a good cutoff point
    const prefix = dataUrl.substring(0, maxLength)
    // Return truncated version - browser will show partial image or placeholder
    return prefix
  }
  return dataUrl
}

export function router(prisma: PrismaClient) {
  const r = Router()

  r.get('/', async (req, res) => {
    try {
      const { q, categoryId } = req.query as { q?: string, categoryId?: string }

      // Use cache if available and not searching
      if (!q && !categoryId && cache.products && Date.now() - cache.timestamp < cache.TTL) {
        return res.json(cache.products)
      }

      const products = await prisma.product.findMany({
        where: {
          AND: [
            q ? { OR: [ { title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } } ] } : {},
            categoryId ? { categoryId } : {},
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true }
          },
          images: {
            select: { id: true, key: true, url: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Process products to include images
      const processedProducts = products.map(product => ({
        ...product,
        images: product.images || []
      }))

      // Cache the result if it's a general query
      if (!q && !categoryId) {
        cache.products = processedProducts
        cache.timestamp = Date.now()
      }

      res.json(processedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      res.status(500).json({ error: 'Failed to fetch products' })
    }
  })

  // Get single product with full images
  r.get('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          category: true
        }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      res.json(product)
    } catch (error) {
      console.error('Error fetching product:', error)
      res.status(500).json({ error: 'Failed to fetch product' })
    }
  })

  const bodySchema = z.object({
    title: z.string().min(1),
    description: z.string().default(''),
    price: z.number().nonnegative(),
    categoryId: z.string().min(1),
    images: z.array(z.object({ key: z.string(), url: z.string().url().optional() })).optional(),
  })

  r.post('/', async (req, res) => {
    try {
      const body = bodySchema.parse(req.body)
      const created = await prisma.product.create({
        data: {
          title: body.title,
          description: body.description,
          price: body.price,
          categoryId: body.categoryId,
          images: body.images ? {
            create: body.images.map(img => ({
              key: img.key,
              url: img.url || ''
            }))
          } : undefined,
        },
        include: { images: true, category: true }
      })

      // Invalidate cache
      cache.products = null

      res.status(201).json(created)
    } catch (error) {
      console.error('Error creating product:', error)
      res.status(500).json({ error: 'Failed to create product' })
    }
  })

  r.put('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const body = bodySchema.partial().parse(req.body)
      const { images, ...updateData } = body

      // Check if product exists
      const existing = await prisma.product.findUnique({ where: { id } })

      if (!existing) {
        // If product doesn't exist, create it with the provided ID
        // Get first category if categoryId not provided
        let categoryId = updateData.categoryId
        if (!categoryId) {
          const firstCategory = await prisma.category.findFirst()
          if (!firstCategory) {
            return res.status(400).json({ error: 'No categories exist. Please create a category first.' })
          }
          categoryId = firstCategory.id
        }

        const created = await prisma.product.create({
          data: {
            id,
            title: updateData.title || 'New Product',
            description: updateData.description || '',
            price: updateData.price || 0,
            categoryId,
            images: images ? {
              create: images.map(img => ({
                key: img.key,
                url: img.url || ''
              }))
            } : undefined,
          },
          include: { images: true, category: true }
        })
        // Invalidate cache
        cache.products = null
        return res.status(201).json(created)
      }

      // Update existing product
      if (images) {
        await prisma.image.deleteMany({ where: { productId: id } })
        await prisma.image.createMany({
          data: images.map(img => ({
            productId: id,
            key: img.key,
            url: img.url || ''
          }))
        })
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { images: true, category: true }
      })
      // Invalidate cache
      cache.products = null
      res.json(updated)
    } catch (error) {
      console.error('Error updating product:', error)
      res.status(500).json({ error: 'Failed to update product' })
    }
  })

  r.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id

      // Check if product exists
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Delete images first (foreign key constraint)
      await prisma.image.deleteMany({ where: { productId: id } })
      // Then delete the product
      await prisma.product.delete({ where: { id } })
      // Invalidate cache
      cache.products = null
      res.status(204).end()
    } catch (error) {
      console.error('Error deleting product:', error)
      res.status(500).json({ error: 'Failed to delete product' })
    }
  })

  return r
}


