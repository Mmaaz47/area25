Backend (Node.js + Express + PostgreSQL + Prisma + S3)

Setup
1) Copy .env.example to .env and fill values
2) Install deps: npm install
3) Generate Prisma client: npm run prisma:generate
4) Run migrations: npm run prisma:migrate
5) Start dev server: npm run dev (http://localhost:4000)

Endpoints
- GET /api/products
- POST /api/products
- GET /api/categories
- POST /api/categories
- GET /api/s3/sign?key=path/to/file.jpg&contentType=image/jpeg


