import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'
import { router as productRouter } from './routes/products.js'
import { router as categoryRouter } from './routes/categories.js'
import { router as s3Router } from './routes/s3.js'
import imagesS3Router from './routes/images-s3.js'
import { router as authRouter } from './routes/auth.js'
import { router as debugRouter } from './routes/debug.js'

const app = express()
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty'
})

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter(prisma))
app.use('/api/categories', categoryRouter(prisma))
app.use('/api/s3', s3Router)
app.use('/api/images-s3', imagesS3Router)
app.use('/api/debug', debugRouter(prisma))

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully')
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error)
    console.log('Please check your DATABASE_URL and ensure the RDS instance is accessible')
  })

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})


