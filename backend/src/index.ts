import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'
import { router as productRouter } from './routes/products'
import { router as categoryRouter } from './routes/categories'
import { router as s3Router } from './routes/s3'

const app = express()
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/products', productRouter(prisma))
app.use('/api/categories', categoryRouter(prisma))
app.use('/api/s3', s3Router)

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})


