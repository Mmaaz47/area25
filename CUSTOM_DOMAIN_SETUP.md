# Custom Domain HTTPS Setup Guide

## Step 1: Buy Your Domain

### Option A: AWS Route 53 (Recommended - Easier DNS setup)
1. Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Click "Register domain"
3. Search for your domain (e.g., `area25shop.com`)
4. Add to cart and complete purchase (~$12/year)
5. DNS will be automatically configured in Route 53

### Option B: External Registrar (GoDaddy, Namecheap, etc.)
1. Purchase domain from your preferred registrar
2. You'll need to configure DNS manually later

## Step 2: Request SSL Certificate (After Domain Purchase)

1. Go to AWS Certificate Manager (ACM) in **eu-north-1** region
2. Click "Request certificate"
3. Choose "Request a public certificate"
4. Add domain names:
   ```
   yourdomain.com
   *.yourdomain.com
   api.yourdomain.com
   ```
5. Choose **DNS validation**
6. Click "Request"

### Validate Certificate:
- **If using Route 53**: Click "Create records in Route 53" button (automatic)
- **If external DNS**: Manually add the CNAME records shown to your DNS

Wait for status to change to **"Issued"** (5-30 minutes)

## Step 3: Configure Elastic Beanstalk

1. Go to Elastic Beanstalk → `area25-simple` environment
2. Click **Configuration** → **Load balancer** → **Edit**
3. In the **Listeners** section:
   - Click "Add listener"
   - Port: **443**
   - Protocol: **HTTPS**
   - SSL certificate: **Select your ACM certificate**
4. Click **Apply** (takes 2-5 minutes)

## Step 4: Configure DNS

### If using Route 53:
1. Go to Route 53 → Hosted zones → Your domain
2. Create new record:
   - Name: `api` (this creates api.yourdomain.com)
   - Type: **CNAME**
   - Value: `area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com`
   - TTL: 300

### If using external DNS:
1. Go to your DNS provider
2. Add CNAME record:
   - Host: `api`
   - Points to: `area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com`

## Step 5: Update Frontend Code

Once DNS propagates (5-30 minutes), update all API files:

### Files to update:
- `/frontend/src/api/products.ts`
- `/frontend/src/api/categories.ts`
- `/frontend/src/api/s3Images.ts`
- `/frontend/src/api/s3Upload.ts`
- `/frontend/amplify.yml`
- `/frontend/.env.production`

### Change from:
```javascript
const BACKEND_URL = 'https://area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com'
```

### To:
```javascript
const BACKEND_URL = 'https://api.yourdomain.com'
```

## Step 6: Deploy Frontend

```bash
git add -A
git commit -m "Update API URL to custom domain"
git push origin main
```

## Step 7: Configure Amplify Custom Domain (Optional)

1. In Amplify Console → Domain management
2. Add domain: `yourdomain.com`
3. Configure:
   - Root: `yourdomain.com` → main branch
   - www: `www.yourdomain.com` → main branch
4. Update DNS as instructed

## Verification Checklist

- [ ] Domain purchased and active
- [ ] SSL certificate shows "Issued" in ACM
- [ ] Elastic Beanstalk has HTTPS listener configured
- [ ] DNS records created and propagated
- [ ] Frontend updated with new API URL
- [ ] Test HTTPS backend: `https://api.yourdomain.com/api/products`
- [ ] Test frontend: `https://yourdomain.com`

## Timeline
- Domain purchase: Immediate
- Certificate validation: 5-30 minutes
- DNS propagation: 5 minutes - 48 hours (usually < 1 hour)
- Total setup time: ~1-2 hours

## Costs
- Domain: ~$12/year
- SSL Certificate: FREE (AWS ACM)
- No additional charges for HTTPS

## Support
If the certificate validation fails:
1. Double-check CNAME records are exactly as shown
2. Wait 30 minutes and check again
3. Try email validation instead of DNS validation