# CRUD Operations Test Guide

## Manager Dashboard Testing

### 1. Login
- Navigate to `/manager/login`
- Username: `admin`
- Password: `admin`

### 2. Test CREATE (Add Product)
- Click "New Product" button
- Fill in:
  - Title: Test Product
  - Price: 999
  - Category: Select any
  - Description: Test description
- Click "Save"
- ✅ Product should appear in list

### 3. Test READ (View Products)
- Products should display in table
- Search functionality should work
- Category filter should work
- Pagination should work

### 4. Test UPDATE (Edit Product)
- Click "Edit" on any product
- Change title/price/description
- Click "Save"
- ✅ Changes should persist

### 5. Test DELETE
- Click "Delete" on any product
- Confirm deletion
- ✅ Product should be removed

### 6. Test Category Management
- Add new category in product editor
- Categories should appear in dropdown
- Category count should update

### 7. Test Image Management
- Add images to product (will be base64 for now)
- Remove images
- ✅ Images should save with product

## Known Issues Fixed
- ✅ Database connection works
- ✅ Products stored in PostgreSQL
- ✅ Images stored as base64 (temporary until S3)
- ✅ Payload size optimized (thumbnails only in listing)

## Next Steps
1. Improve UI/UX design
2. Configure S3 for proper image storage
3. Deploy to AWS