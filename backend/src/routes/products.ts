import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

export function router(prisma: PrismaClient) {
  const r = Router()

  r.get('/', async (req, res) => {
    const { q, categoryId } = req.query as { q?: string, categoryId?: string }
    const products = await prisma.product.findMany({
      where: {
        AND: [
          q ? { OR: [ { title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } } ] } : {},
          categoryId ? { categoryId } : {},
        ]
      },
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(products)
  })

  const bodySchema = z.object({
    title: z.string().min(1),
    description: z.string().default(''),
    price: z.number().nonnegative(),
    categoryId: z.string().min(1),
    images: z.array(z.object({ key: z.string(), url: z.string().url().optional() })).optional(),
  })

  r.post('/', async (req, res) => {
    const body = bodySchema.parse(req.body)
    const created = await prisma.product.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
        images: body.images ? { create: body.images } : undefined,
      },
      include: { images: true }
    })
    res.status(201).json(created)
  })

  r.put('/:id', async (req, res) => {
    const id = req.params.id
    const body = bodySchema.partial().parse(req.body)
    const updated = await prisma.product.update({ where: { id }, data: body, include: { images: true } })
    res.json(updated)
  })

  r.delete('/:id', async (req, res) => {
    const id = req.params.id
    await prisma.image.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    res.status(204).end()
  })

  return r
}


