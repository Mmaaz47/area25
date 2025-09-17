# S3 Setup Guide for Area 25 Furniture Store

## Prerequisites
- AWS Account
- IAM user with S3 permissions
- AWS CLI (optional, for bucket creation)

## Step 1: Create S3 Bucket

### Option A: Using AWS Console
1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/
2. Click "Create bucket"
3. Enter bucket name: `area25-furniture-images`
4. Select region: `eu-north-1` (Stockholm)
5. Uncheck "Block all public access" (we need public read for images)
6. Acknowledge the warning about public access
7. Leave other settings as default
8. Click "Create bucket"

### Option B: Using AWS CLI
```bash
# Create bucket
aws s3api create-bucket \
  --bucket area25-furniture-images \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1

# Set public access policy
aws s3api put-bucket-policy \
  --bucket area25-furniture-images \
  --policy file://bucket-policy.json
```

## Step 2: Set Bucket Policy

Add this policy to allow public read access to images:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::area25-furniture-images/*"
    }
  ]
}
```

## Step 3: Configure CORS

Add CORS configuration to allow browser uploads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Step 4: Create IAM User

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add users"
3. Username: `area25-s3-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search and select: `AmazonS3FullAccess`
8. Click "Next" → "Create user"
9. **Save the Access Key ID and Secret Access Key**

## Step 5: Configure Backend

1. Copy the environment template:
```bash
cp .env.s3.example .env
```

2. Edit `.env` and add your credentials:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=area25-furniture-images
AWS_REGION=eu-north-1
```

## Step 6: Install Dependencies

```bash
cd area25-backend-main/area25-backend-main
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer @types/multer uuid
```

## Step 7: Update Backend Routes

In `src/index.ts`, add the S3 routes:

```typescript
import imagesS3Router from './routes/images-s3'

// Add after other routes
app.use('/api/images-s3', imagesS3Router)
```

## Step 8: Migrate Existing Images

Run the migration script to move base64 images to S3:

```bash
npm run migrate:images
```

Or manually:
```bash
npx ts-node src/scripts/migrateImagesToS3.ts
```

## Step 9: Update Frontend

The frontend will automatically detect S3 availability and switch from local storage to S3 uploads.

## Testing

1. Start the backend with S3 configured
2. Go to Manager Dashboard
3. Upload a new product image
4. Check that the image URL starts with `https://area25-furniture-images.s3.eu-north-1.amazonaws.com/`

## Troubleshooting

### "Access Denied" errors
- Check IAM user has S3 permissions
- Verify bucket policy allows public read
- Ensure CORS is configured

### Images not displaying
- Check bucket is public
- Verify image URLs are correct
- Check browser console for CORS errors

### Upload fails
- Verify AWS credentials in .env
- Check bucket name and region
- Ensure backend is restarted after .env changes

## Optional: CloudFront CDN

For better performance, set up CloudFront:

1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Update `.env` with CloudFront URL:
```env
CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## Security Notes

- Never commit `.env` file with credentials
- Use IAM roles in production (Elastic Beanstalk)
- Consider signed URLs for sensitive content
- Enable S3 versioning for backup