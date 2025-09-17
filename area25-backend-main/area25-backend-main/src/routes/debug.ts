import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

export function router(prisma: PrismaClient) {
  const r = Router()

  r.get('/test', async (req, res) => {
    const results = {
      connection: false,
      queryTime: 0,
      productCount: 0,
      error: null as any
    }

    try {
      const start = Date.now()

      // Test basic query
      await prisma.$queryRaw`SELECT 1`
      results.connection = true

      // Count products
      const count = await prisma.product.count()
      results.productCount = count

      results.queryTime = Date.now() - start

      res.json({
        success: true,
        ...results
      })
    } catch (error: any) {
      results.error = error.message
      res.json({
        success: false,
        ...results
      })
    }
  })

  r.get('/metrics', async (req, res) => {
    const metrics: any = {}

    try {
      // Get pool metrics if available
      const pool = (prisma as any)._engineConfig?.pool
      if (pool) {
        metrics.pool = {
          size: pool.size,
          available: pool.available,
          pending: pool.pending
        }
      }

      // Test query performance
      const timings = []
      for (let i = 0; i < 3; i++) {
        const start = Date.now()
        await prisma.product.findMany({ take: 1 })
        timings.push(Date.now() - start)
      }

      metrics.queryTimings = timings
      metrics.avgQueryTime = timings.reduce((a, b) => a + b, 0) / timings.length

      res.json(metrics)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })

  return r
}