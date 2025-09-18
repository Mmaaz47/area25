const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Area25 Backend API',
    endpoints: ['/api/products', '/api/categories', '/health']
  });
});

// === PRODUCTS ROUTES ===
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: id }, // Use string ID directly
      include: {
        category: true,
        images: true
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { title, price, description, categoryId, images } = req.body;

    const product = await prisma.product.create({
      data: {
        id: req.body.id || undefined, // Use provided ID or let Prisma generate
        title,
        price: price ? parseFloat(price) : 0,
        description,
        categoryId,
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined
      },
      include: {
        category: true,
        images: true
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, category, categoryId, images } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id }
    });

    if (existingProduct) {
      // Product exists - update it
      // If images are provided, delete old ones and create new ones
      if (images !== undefined) {
        await prisma.image.deleteMany({
          where: { productId: id }
        });
      }

      const updateData = {
        title,
        price: price ? parseFloat(price) : undefined,
        description,
        categoryId: categoryId || undefined,
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined
      };

      // Remove undefined values except for images
      Object.keys(updateData).forEach(key => {
        if (key !== 'images' && updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const product = await prisma.product.update({
        where: { id: id },
        data: updateData,
        include: {
          category: true,
          images: true
        }
      });

      res.json(product);
    } else {
      // Product doesn't exist - create it with the provided ID
      const product = await prisma.product.create({
        data: {
          id: id,
          title: title || 'New Product',
          price: price ? parseFloat(price) : 0,
          description: description || '',
          categoryId: categoryId || undefined,
          images: images && images.length > 0 ? {
            create: images.map(url => ({ url }))
          } : undefined
        },
        include: {
          category: true,
          images: true
        }
      });

      res.json(product);
    }
  } catch (error) {
    console.error('Error updating/creating product:', error);
    res.status(500).json({ error: 'Failed to update/create product', details: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First delete related images
    await prisma.image.deleteMany({
      where: { productId: id }
    });

    // Then delete the product
    await prisma.product.delete({
      where: { id: id } // Use string ID directly
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product', details: error.message });
  }
});

// === CATEGORIES ROUTES ===
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: id }, // Use string ID directly
      include: { products: true }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.update({
      where: { id: id }, // Use string ID directly
      data: req.body
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: id } // Use string ID directly
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// === S3 IMAGE UPLOAD ROUTES ===
app.post('/api/s3/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const key = `products/${uuidv4()}-${req.file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({
      success: true,
      url,
      key,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to S3' });
  }
});

app.get('/api/s3/signed-url/:key', async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: req.params.key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// === AUTH ROUTES (Simple Implementation) ===
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Simple auth check - you should implement proper auth
  if (username === 'admin' && password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    res.json({
      success: true,
      token: 'dummy-token-' + Date.now(),
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// === S3 IMAGE ROUTES ===
app.get('/api/images-s3/status', (req, res) => {
  res.json({
    s3Enabled: !!process.env.AWS_ACCESS_KEY_ID && !!process.env.S3_BUCKET_NAME,
    bucket: process.env.S3_BUCKET_NAME,
    region: process.env.AWS_REGION
  });
});

app.post('/api/images-s3/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const key = `products/${Date.now()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database URL exists:', !!process.env.DATABASE_URL);
  console.log('S3 Bucket:', process.env.S3_BUCKET_NAME);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});