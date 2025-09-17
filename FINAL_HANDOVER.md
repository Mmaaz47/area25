# Area 25 Furniture Store - Complete Handover Guide

## 🌐 Live URLs
- **Frontend (Customer Site)**: https://6th-space.com
- **Backend API**: https://api.6th-space.com
- **AWS Console**: https://console.aws.amazon.com

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [AWS Services Used](#aws-services-used)
4. [Deployment Process](#deployment-process)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)
7. [Costs & Monitoring](#costs--monitoring)

## 🚀 Quick Start

### Access Your Application
1. **Customer Website**: Visit https://6th-space.com
2. **API Health Check**: Visit https://api.6th-space.com/api/products
3. **Admin Dashboard**: Visit https://6th-space.com/manager (password: admin123)

### GitHub Repository
- **Repository**: https://github.com/Mmaaz47/area25
- **Main Branch**: `master`
- **Auto-deployment**: Enabled for both frontend and backend

## 🏗️ Architecture Overview

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│                 │ ◄──────────────►│                  │
│  AWS Amplify    │                 │  Elastic         │
│  (Frontend)     │                 │  Beanstalk       │
│  6th-space.com  │                 │  (Backend API)   │
│                 │                 │  api.6th-space.com│
└─────────────────┘                 └──────────────────┘
        │                                    │
        │                                    │
        ▼                                    ▼
┌─────────────────┐                 ┌──────────────────┐
│                 │                 │                  │
│  Route 53       │                 │  RDS PostgreSQL  │
│  (DNS)          │                 │  (Database)      │
│                 │                 │                  │
└─────────────────┘                 └──────────────────┘
                                            │
                                            ▼
                                    ┌──────────────────┐
                                    │                  │
                                    │  S3 Bucket       │
                                    │  (Images)        │
                                    │                  │
                                    └──────────────────┘
```

## 🛠️ AWS Services Used

### 1. AWS Amplify (Frontend)
- **App Name**: area25
- **Branch**: master (production)
- **Custom Domain**: 6th-space.com
- **Auto-deploy**: Yes, from GitHub
- **Region**: eu-north-1 (Stockholm)

### 2. Elastic Beanstalk (Backend)
- **Application**: area25-simple
- **Environment**: area25-simple
- **Platform**: Node.js 18
- **Custom Domain**: api.6th-space.com
- **Region**: eu-north-1 (Stockholm)

### 3. RDS PostgreSQL (Database)
- **Instance**: area25-furniture-db
- **Engine**: PostgreSQL 15.4
- **Instance Class**: db.t3.micro
- **Storage**: 20 GB
- **Region**: eu-north-1 (Stockholm)

### 4. S3 Bucket (Image Storage)
- **Bucket Name**: area25-furniture-images
- **Public Access**: Enabled for images
- **CORS**: Configured for frontend
- **Region**: eu-north-1 (Stockholm)

### 5. Route 53 (DNS)
- **Domain**: 6th-space.com
- **DNS Records**:
  - A record: 6th-space.com → Amplify
  - CNAME: api.6th-space.com → Elastic Beanstalk

### 6. Certificate Manager
- **Certificate**: *.6th-space.com
- **Status**: Verified
- **Region**: eu-north-1 (Stockholm)

## 📦 Deployment Process

### Frontend Deployment (Automatic)
1. Make changes to frontend code in `area25-main/area25-main/frontend/`
2. Commit and push to GitHub master branch
3. Amplify automatically builds and deploys (3-5 minutes)
4. Changes appear at https://6th-space.com

### Backend Deployment (Manual - for now)
1. Make changes to backend code in `area25-backend-main/area25-backend-main/`
2. Create deployment package:
   ```bash
   cd area25-backend-main/area25-backend-main
   zip -r deploy.zip . -x "*.git*" -x "node_modules/*" -x "*.log" -x ".env"
   ```
3. Upload to Elastic Beanstalk:
   - Go to AWS Console → Elastic Beanstalk
   - Select "area25-simple" environment
   - Click "Upload and Deploy"
   - Upload the deploy.zip file

### Backend CI/CD Setup (Optional)
GitHub Actions workflow is ready in `.github/workflows/deploy-backend.yml`
To enable:
1. Go to GitHub → Settings → Secrets
2. Add these secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY

## 📝 Common Tasks

### Adding New Products
1. Visit https://6th-space.com/manager
2. Login with password: admin123
3. Use the dashboard to add/edit products

### Viewing Application Logs

#### Frontend Logs (Amplify)
1. AWS Console → Amplify → area25
2. Click on "Monitoring" → "Logs"

#### Backend Logs (Elastic Beanstalk)
1. AWS Console → Elastic Beanstalk → area25-simple
2. Click "Logs" → "Request Logs" → "Last 100 Lines"

### Database Access
1. AWS Console → RDS → Databases → area25-furniture-db
2. Connection endpoint is in the configuration
3. Use pgAdmin or psql to connect

### Updating Environment Variables

#### Frontend (.env)
- Edit `area25-main/area25-main/frontend/.env.production`
- Push to GitHub for auto-deployment

#### Backend (Elastic Beanstalk)
1. AWS Console → Elastic Beanstalk → area25-simple
2. Configuration → Software → Edit
3. Add/modify environment variables
4. Apply changes

## 🔧 Troubleshooting

### Frontend Not Loading
1. Check Amplify deployment status
2. View browser console for errors
3. Check if API is accessible

### API Errors
1. Test API directly: https://api.6th-space.com/api/products
2. Check Elastic Beanstalk health
3. View EB logs for errors

### Database Connection Issues
1. Check RDS instance status
2. Verify security group rules
3. Check DATABASE_URL in EB environment variables

### Image Upload Issues
1. Check S3 bucket permissions
2. Verify CORS configuration
3. Check AWS credentials in EB

## 💰 Costs & Monitoring

### Estimated Monthly Costs (AWS Free Tier)
- **Amplify**: ~$5-10 (hosting & bandwidth)
- **Elastic Beanstalk**: Free (t3.micro eligible)
- **RDS**: Free tier for 12 months, then ~$15/month
- **S3**: ~$1-5 (storage & bandwidth)
- **Route 53**: $0.50 (hosted zone) + $12/year (domain)
- **Total**: ~$20-30/month after free tier

### Monitoring
1. **AWS Cost Explorer**: Monitor spending
2. **CloudWatch**: Application metrics
3. **Amplify Analytics**: Frontend performance
4. **RDS Metrics**: Database performance

## 🔐 Security Notes

### Important Files (Keep Secure)
- Database credentials
- AWS access keys
- Admin password
- SSL certificates

### Regular Maintenance
1. Update Node.js packages monthly
2. Review AWS security recommendations
3. Backup database weekly
4. Monitor for unusual activity

## 📞 Support & Resources

### AWS Support
- AWS Documentation: https://docs.aws.amazon.com
- AWS Support Center: In AWS Console

### Application Support
- GitHub Issues: https://github.com/Mmaaz47/area25/issues
- Frontend Framework: React + Vite
- Backend Framework: Node.js + Express + Prisma

## 🎉 Congratulations!

Your furniture store is now fully deployed with:
- ✅ HTTPS everywhere
- ✅ Custom domain
- ✅ Auto-deployment for frontend
- ✅ Scalable architecture
- ✅ Professional setup

For any questions or issues, refer to this guide or check the AWS Console for detailed information about each service.