# Elastic Beanstalk Deployment Guide

## Prerequisites
- AWS CLI installed
- EB CLI installed
- IAM user with Elastic Beanstalk permissions

## 1. Install EB CLI
```bash
pip install awsebcli
```

## 2. Initialize Elastic Beanstalk

### Backend Deployment

```bash
cd area25-backend-main/area25-backend-main
eb init

# Select:
# - Region: eu-north-1 (Stockholm)
# - Application name: area25-backend
# - Platform: Node.js 18
# - CodeCommit: No
# - SSH: Yes (optional)
```

## 3. Create Environment

```bash
# Create production environment
eb create area25-backend-prod --instance-type t3.micro

# Set environment variables
eb setenv DATABASE_URL="postgresql://area25:area25-post@area25-postgres.cxsa8ie2myjc.eu-north-1.rds.amazonaws.com:5432/area25" \
  PORT=8080 \
  CORS_ORIGIN="https://your-frontend-domain.com" \
  MANAGER_USERNAME="admin" \
  MANAGER_PASSWORD_HASH="8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" \
  AWS_REGION="eu-north-1" \
  S3_BUCKET_NAME="area25-furniture-images" \
  NODE_ENV="production"
```

## 4. Configure for Deployment

### Create `.ebextensions/nodecommand.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
```

### Create `.platform/nginx/conf.d/client_max_body_size.conf`:
```nginx
client_max_body_size 50M;
```

### Update `package.json`:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

## 5. Deploy

```bash
# Deploy to Elastic Beanstalk
eb deploy

# Check status
eb status

# Open in browser
eb open

# View logs
eb logs
```

## 6. Frontend Deployment with Amplify

### Initialize Amplify
```bash
cd area25-main/area25-main/frontend
npm install -g @aws-amplify/cli
amplify init

# Configure:
# - Name: area25frontend
# - Environment: prod
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source: src
# - Distribution: dist
# - Build: npm run build
# - Start: npm run dev
```

### Add Hosting
```bash
amplify add hosting

# Select:
# - Hosting with Amplify Console
# - Manual deployment

amplify publish
```

### Environment Variables in Amplify Console:
```
VITE_API_URL=https://area25-backend-prod.eu-north-1.elasticbeanstalk.com/api
```

## 7. Update Backend CORS

After deployment, update backend CORS to include Amplify URL:
```bash
eb setenv CORS_ORIGIN="https://your-amplify-url.amplifyapp.com"
```

## 8. Database Security Group

Update RDS security group to allow Elastic Beanstalk:
1. Go to RDS console
2. Select your database
3. Modify security group
4. Add inbound rule:
   - Type: PostgreSQL
   - Source: Elastic Beanstalk security group

## 9. Monitoring

### CloudWatch
- Set up alarms for CPU, memory
- Enable detailed monitoring

### Health Check
```bash
eb health
```

## 10. Useful Commands

```bash
# SSH into instance
eb ssh

# Restart environment
eb restart

# Scale environment
eb scale 2

# Terminate environment
eb terminate

# List environments
eb list
```

## Troubleshooting

### Build Fails
- Check `eb logs` for errors
- Ensure all dependencies in package.json
- Verify Node.js version compatibility

### Database Connection Issues
- Check security group rules
- Verify DATABASE_URL is correct
- Test connection from EC2 instance

### CORS Issues
- Update CORS_ORIGIN environment variable
- Check Amplify domain is whitelisted

## Cost Optimization

- Use t3.micro for development
- Enable auto-scaling for production
- Set up lifecycle policies for logs
- Use CloudFront for static assets

## Security Best Practices

1. Enable HTTPS with ACM certificate
2. Use IAM roles instead of access keys
3. Enable AWS WAF for protection
4. Regular security patches
5. Encrypt environment variables
6. Use VPC for database access