# HTTPS Setup Guide for Area25

## Quick Solution: CloudFront (No Domain Needed)

### 1. Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Click "Create Distribution"
3. Configure:
   ```
   Origin Domain: area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com
   Protocol: HTTP only
   Origin Path: /api
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Allowed Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   Cache Policy: Managed-CachingDisabled
   Origin Request Policy: Managed-AllViewer
   ```
4. Click "Create Distribution"
5. Wait 5-10 minutes for deployment
6. Copy the CloudFront domain (e.g., `d123abc.cloudfront.net`)

### 2. Update Frontend Code

Replace in all API files:
```javascript
// OLD
const BACKEND_URL = 'http://area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com'

// NEW (use your CloudFront URL)
const BACKEND_URL = 'https://d123abc.cloudfront.net'
```

### 3. Files to Update
- `/frontend/src/api/products.ts`
- `/frontend/src/api/categories.ts`
- `/frontend/src/api/s3Images.ts`
- `/frontend/src/api/s3Upload.ts`
- `/frontend/amplify.yml`
- `/frontend/.env.production`

### 4. Deploy
```bash
git add -A
git commit -m "Enable HTTPS via CloudFront"
git push origin main
```

## Custom Domain Solution (Professional)

### 1. Buy Domain
- AWS Route 53: ~$12/year
- Example: `area25shop.com`

### 2. Request Certificate
```
1. AWS Certificate Manager → Request certificate
2. Domain names:
   - area25shop.com
   - *.area25shop.com
3. DNS validation
4. Add CNAME records to Route 53
5. Wait for "Issued" status
```

### 3. Configure Elastic Beanstalk
```
1. EB Console → Configuration → Load Balancer
2. Add listener:
   - Port: 443
   - Protocol: HTTPS
   - Certificate: Select your ACM certificate
3. Apply changes
```

### 4. Setup DNS
```
Route 53 → Create records:
- Type: A
- Name: api.area25shop.com
- Alias: Yes
- Target: Your EB load balancer
```

### 5. Update Frontend
```javascript
const BACKEND_URL = 'https://api.area25shop.com'
```

## Costs Comparison

| Solution | Cost | HTTPS | Custom Domain | Setup Time |
|----------|------|-------|---------------|------------|
| CloudFront | Free* | ✅ | ❌ | 15 mins |
| Custom Domain | ~$12/year | ✅ | ✅ | 30 mins |
| Current (HTTP) | Free | ❌ | ❌ | 0 mins |

*CloudFront has free tier: 1TB transfer/month, 10M requests/month

## Recommended: Start with CloudFront
1. Quick to set up
2. No domain purchase needed
3. Provides HTTPS immediately
4. Can add custom domain later