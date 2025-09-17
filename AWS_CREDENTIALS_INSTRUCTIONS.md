# AWS Credentials Setup Instructions

## Quick Steps to Get Your AWS Keys:

1. **Login to AWS Console**: https://console.aws.amazon.com/

2. **Navigate to IAM**:
   - Search "IAM" in the top search bar
   - Click on IAM service

3. **Create User**:
   - Left sidebar → Users → Create user
   - Username: `area25-s3-user`
   - Next

4. **Add Permissions**:
   - Select "Attach policies directly"
   - Search and check: `AmazonS3FullAccess`
   - Next → Create user

5. **Generate Access Keys**:
   - Click on the created user
   - Security credentials tab
   - Access keys section → Create access key
   - Select "Application running outside AWS"
   - Next → Create access key

6. **Copy Your Keys** (⚠️ You only see these once!):
   - Access key ID: `AKIA...` (20 characters)
   - Secret access key: `...` (40 characters)

7. **Update .env file**:
```env
AWS_ACCESS_KEY_ID="PASTE_YOUR_ACCESS_KEY_ID_HERE"
AWS_SECRET_ACCESS_KEY="PASTE_YOUR_SECRET_ACCESS_KEY_HERE"
```

## Alternative: If You Already Have an IAM User

1. Go to IAM → Users
2. Click on your existing user
3. Security credentials tab
4. Create new access key (follow steps 5-7 above)

## Security Best Practices

- Never commit these keys to Git
- Rotate keys regularly
- Use IAM roles in production (Elastic Beanstalk)
- Delete unused access keys

## Verify S3 Bucket Exists

1. Go to S3 Console: https://s3.console.aws.amazon.com/
2. Create bucket if not exists:
   - Name: `area25-images`
   - Region: `eu-north-1` (Stockholm)
   - Uncheck "Block all public access"
   - Create bucket

## Test Your Configuration

After updating .env, restart your backend:
```bash
cd area25-backend-main/area25-backend-main
npm run dev
```

Check if S3 is working:
```bash
curl http://localhost:4000/api/images-s3/status
```

Should return:
```json
{
  "configured": true,
  "bucket": "area25-images",
  "region": "eu-north-1"
}
```