# S3 Setup Guide for Area 25 Furniture Store

## Prerequisites
- AWS Account
- IAM User with S3 permissions
- Access Key ID and Secret Access Key

## 1. Create S3 Bucket

1. Log into AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Configure bucket:
   - **Bucket name**: `area25-furniture-images`
   - **Region**: `eu-north-1` (Stockholm)
   - **Object Ownership**: ACLs enabled
   - **Block Public Access**: Uncheck "Block all public access"
   - **Bucket Versioning**: Disabled (optional)
   - **Default encryption**: Enabled with SSE-S3

## 2. Configure Bucket Policy

Add this policy to allow public read access for images:

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

## 3. Configure CORS

Add CORS configuration to allow frontend uploads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 4. Create IAM User

1. Go to IAM in AWS Console
2. Create new user: `area25-s3-user`
3. Attach policy with S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::area25-furniture-images",
        "arn:aws:s3:::area25-furniture-images/*"
      ]
    }
  ]
}
```

4. Create access key for the user
5. Save Access Key ID and Secret Access Key

## 5. Configure Backend

1. Copy `.env.s3.example` to `.env`:
```bash
cd area25-backend-main/area25-backend-main
cp .env.s3.example .env
```

2. Update `.env` with your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
S3_BUCKET_NAME=area25-furniture-images
AWS_REGION=eu-north-1
```

3. Restart the backend server:
```bash
npm run dev
```

## 6. Migrate Existing Images

If you have existing base64 images in the database, run the migration script:

```bash
cd area25-backend-main/area25-backend-main
npm run migrate:s3
```

## 7. Test S3 Integration

1. Open Manager Dashboard
2. Try uploading a new product image
3. Check if "S3 not configured" message disappears
4. Verify images are uploaded to S3 bucket

## Features

### Automatic S3 Detection
The frontend automatically detects if S3 is configured and switches between:
- **S3 Mode**: Direct upload to S3 with presigned URLs
- **Local Mode**: Base64 storage for development/testing

### Upload Methods
1. **Presigned URL**: Direct browser-to-S3 upload (fastest)
2. **Backend Upload**: Upload through server (fallback)
3. **Local Storage**: Base64 in database (development)

### Image Management
- Automatic thumbnail generation
- Delete images from S3
- Bulk migration from base64 to S3

## Troubleshooting

### S3 Not Configured Error
- Check AWS credentials in `.env`
- Verify IAM user has correct permissions
- Ensure bucket name and region are correct

### Upload Fails
- Check CORS configuration on S3 bucket
- Verify bucket policy allows public read
- Check file size limits (10MB max)

### Images Not Displaying
- Ensure bucket has public read access
- Check if image URLs are correct format
- Verify CloudFront distribution (if using)

## Optional: CloudFront CDN

For better performance, set up CloudFront:

1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Add `CLOUDFRONT_URL` to `.env`:
```env
CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## Security Notes

- Never commit AWS credentials to git
- Use IAM roles in production (Elastic Beanstalk)
- Regularly rotate access keys
- Monitor S3 bucket access logs
- Set up lifecycle policies for old images