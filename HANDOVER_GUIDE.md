# Area-25 Furniture Store - Project Handover Guide

## Prerequisites Your Friend Needs

### 1. **Accounts Required**
- [ ] AWS Account with billing enabled
- [ ] GitHub Account
- [ ] Domain name (optional, for custom domain)

### 2. **Local Development Setup**
```bash
# Install these on their computer:
- Node.js 18+ and npm
- Git
- VS Code or any code editor
```

## Step-by-Step Setup Process

### Step 1: AWS Initial Setup
1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Sign up with credit card (for verification)
   - Enable free tier

2. **Get AWS Credentials**
   - AWS Console → IAM → Users → Create User
   - Attach policy: `AdministratorAccess` (or specific policies)
   - Save Access Key ID and Secret Access Key

### Step 2: AWS Services Setup

#### A. RDS Database (PostgreSQL)
```
1. Go to AWS RDS Console
2. Create database → PostgreSQL
3. Choose Free tier (db.t3.micro)
4. Settings:
   - DB instance identifier: area25-database
   - Master username: postgres
   - Master password: [create strong password]
5. Additional config:
   - Initial database name: area25_furniture
6. Save the connection string:
   postgresql://postgres:[password]@[endpoint]:5432/area25_furniture
```

#### B. S3 Bucket (Already Created)
```
Bucket name: area25-furniture-images
Region: eu-north-1
- Already configured for public read access
- No additional setup needed
```

#### C. Elastic Beanstalk
```
1. Go to Elastic Beanstalk Console
2. Create Application:
   - Name: area25-furniture-backend
   - Platform: Node.js 22
3. Create Environment:
   - Name: area25-production
   - Upload code: Use provided ZIP or connect GitHub
4. Configure Environment Variables:
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[RDS connection string from step A]
   AWS_REGION=eu-north-1
   AWS_ACCESS_KEY_ID=[from step 1]
   AWS_SECRET_ACCESS_KEY=[from step 1]
   S3_BUCKET_NAME=area25-furniture-images
   CORS_ORIGIN=*
```

### Step 3: GitHub Setup

#### A. Create Repository
```bash
1. Create new private repository on GitHub
2. Name: area25-furniture-store (or any name)
```

#### B. Push Code
```bash
# In project directory
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[username]/[repo-name].git
git push -u origin main
```

#### C. Configure GitHub Secrets
Go to Repository → Settings → Secrets → Actions → Add these secrets:
```
AWS_ACCESS_KEY_ID=[your AWS key]
AWS_SECRET_ACCESS_KEY=[your AWS secret]
AWS_REGION=eu-north-1
DATABASE_URL=[RDS connection string]
EB_APPLICATION_NAME=area25-furniture-backend
EB_ENVIRONMENT_NAME=area25-production
EB_ENVIRONMENT_URL=[from Elastic Beanstalk]
S3_BUCKET_NAME=area25-furniture-images
VITE_API_URL=[Elastic Beanstalk URL]
```

### Step 4: Frontend Deployment (Amplify)

```
1. Go to AWS Amplify Console
2. Host web app → GitHub
3. Connect repository and branch
4. Build settings are auto-detected
5. Environment variables:
   VITE_API_URL=[Elastic Beanstalk URL]
   VITE_APP_NAME=Area 25 Furniture
6. Deploy
```

## Maintenance Tasks

### Daily/Weekly
- Check AWS billing dashboard
- Monitor application health in EB console
- Review error logs if issues occur

### Monthly
- Update dependencies: `npm update`
- Check for security updates
- Review AWS costs

### Database Maintenance
```bash
# Backup database
pg_dump [connection-string] > backup.sql

# Run migrations after updates
npx prisma migrate deploy
```

## Cost Estimates

### AWS Free Tier (First 12 months)
- RDS: Free (db.t3.micro - 750 hrs/month)
- EC2 (via EB): Free (t3.micro - 750 hrs/month)
- S3: Free (5GB storage, 20K GET, 2K PUT)
- Total: ~$0/month

### After Free Tier
- RDS: ~$15/month
- EC2: ~$10/month
- S3: ~$2/month
- Total: ~$27/month

### Cost Optimization Tips
1. Stop EB environment when not in use
2. Use S3 lifecycle policies for old images
3. Set up billing alerts at $50
4. Use CloudWatch to monitor usage

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in EB environment variables
   - Ensure RDS security group allows EB instances

2. **Images Not Uploading**
   - Verify S3 bucket permissions
   - Check AWS credentials in EB

3. **Application Won't Start**
   - Check EB logs: `eb logs`
   - Verify all environment variables are set

4. **High AWS Bills**
   - Check for running instances in all regions
   - Set up billing alerts
   - Use AWS Cost Explorer

## Support Contacts

### AWS Support
- Free tier support: AWS Forums
- Paid support: AWS Console → Support

### Documentation
- Backend: See README.md in area25-backend-main
- Frontend: See README.md in area25-main/frontend
- Deployment: See DEPLOYMENT.md

## Credentials Needed from You

Your friend will need these from you:
1. AWS Access Keys (or transfer AWS account)
2. Database password you set
3. Any API keys used
4. GitHub repository access

## Final Checklist Before Handover

- [ ] All code pushed to GitHub
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] AWS services running
- [ ] Test deployment working
- [ ] Billing alerts configured
- [ ] Admin account created in app
- [ ] Client training scheduled

---

## Quick Start Commands

```bash
# Clone repository
git clone [repository-url]

# Backend setup
cd area25-backend-main
npm install
npm run dev

# Frontend setup
cd area25-main/frontend
npm install
npm run dev

# Deploy backend
eb deploy

# Database operations
npx prisma studio  # View database
npx prisma migrate dev  # Create migration
npx prisma migrate deploy  # Apply migration
```

## Important Notes

1. **Never commit secrets** to GitHub
2. **Always use environment variables** for sensitive data
3. **Monitor AWS costs** weekly at first
4. **Keep backups** of database regularly
5. **Test locally** before deploying

---

*Generated on: September 15, 2025*
*Project: Area-25 Furniture Store*
*Stack: Node.js, React, PostgreSQL, AWS*