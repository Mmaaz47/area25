# Furniture Store - Frontend

Modern, elegant furniture shop frontend built with React + Vite + TypeScript.

## Scripts

- `npm install`
- `npm run dev` – start on http://localhost:5173
- `npm run build` – production build
- `npm run preview` – preview build locally

## Features

- Product listing with search and category filter
- Product details, add to cart, save/bookmark
- Cart and Saved pages (persisted in localStorage)
- Manager dashboard with simple CRUD (local only)
- Elegant palette: off‑white, charcoal, terracotta accent

## AWS Static Hosting (S3 + CloudFront)

1) Build

```bash
npm run build
```

2) Create S3 bucket (public for static site)

- Name: e.g., furniture-store-frontend
- Enable static website hosting (index document: `index.html`, error document: `index.html`)

3) Upload `dist/` to S3

4) Invalidate caching via CloudFront (recommended)

- Create CloudFront distribution with the S3 bucket as origin
- Behaviors: Redirect HTTP to HTTPS; Caching enabled
- After deploy, create an invalidation: `/*` when you publish new builds

5) SPA routing

- For S3 static website endpoint, set error document to `index.html` to handle React Router routes
- For CloudFront + S3 (non-website endpoint), add a Function/Lambda@Edge to rewrite 404s to `/index.html` or configure S3 website endpoint as origin

## Local Development

```bash
npm run dev -- --host
```

## CI/CD (GitHub Actions → S3 + CloudFront)

Workflow: `.github/workflows/frontend-deploy.yml`

Set repo secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., us-east-1)
- `AWS_S3_BUCKET` (your static site bucket)
- `CLOUDFRONT_DISTRIBUTION_ID` (optional; for invalidations)

Push to `main` under `frontend/**` to build and deploy automatically.
