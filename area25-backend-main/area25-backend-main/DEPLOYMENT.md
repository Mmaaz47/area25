# AWS Elastic Beanstalk Deployment Guide

This guide covers deploying the Furniture Store Backend API to AWS Elastic Beanstalk.

## Prerequisites

1. **AWS CLI** - Install and configure with your AWS credentials
   ```bash
   pip install awscli
   aws configure
   ```

2. **EB CLI** - Elastic Beanstalk Command Line Interface
   ```bash
   pip install awsebcli
   # OR on macOS
   brew install awsebcli
   ```

3. **AWS Account Setup**
   - AWS RDS PostgreSQL database (already configured)
   - AWS S3 bucket for image storage (already configured)
   - Appropriate IAM roles and permissions

## Deployment Steps

### 1. First-Time Deployment

Run the deployment script:
```bash
./deploy.sh
```

The script will:
- Check prerequisites
- Initialize EB application
- Create the environment
- Guide you through configuration

### 2. Environment Variables

After creating the environment, set these variables in the EB Console:

**Navigate to:** AWS Console > Elastic Beanstalk > Your Application > Environment > Configuration > Software

**Required Environment Variables:**
```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/furniture_store
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name
CORS_ORIGIN=https://yourdomain.com
```

**Security Note:** For production, use IAM roles instead of hardcoded AWS credentials.

### 3. Subsequent Deployments

For updates after the initial deployment:
```bash
./deploy.sh
```

OR use EB CLI directly:
```bash
eb deploy
```

## File Structure

The deployment includes these configuration files:

```
.
├── .ebextensions/
│   ├── nodecommand.config     # EB Node.js configuration
│   └── environment.config     # Environment and health check config
├── .platform/
│   └── hooks/
│       ├── prebuild/
│       │   └── 01_install_dependencies.sh
│       └── postdeploy/
│           └── 01_migrate_database.sh
├── Procfile                   # Process configuration
├── deploy.sh                  # Deployment script
├── .env.production           # Production environment template
└── DEPLOYMENT.md             # This guide
```

## Configuration Details

### `.ebextensions/nodecommand.config`
- Sets Node.js version and command
- Configures health checks
- Sets up build process
- Configures instance type and scaling

### `.ebextensions/environment.config`
- Sets production environment variables
- Configures post-deployment health checks
- Sets up application restart logic

### `.platform/hooks/`
- **prebuild**: Installs dependencies and builds the application
- **postdeploy**: Runs database migrations after deployment

### `Procfile`
- Defines the command to start the application
- Used by Elastic Beanstalk to run the Node.js app

## Database Migrations

Database migrations are automatically run during deployment via the postdeploy hook. The system:

1. Checks for `DATABASE_URL` environment variable
2. Runs `npx prisma migrate deploy` if URL is found
3. Skips migrations if no database URL is configured

## Monitoring and Troubleshooting

### View Logs
```bash
eb logs
```

### Check Application Health
```bash
eb health
```

### Monitor in AWS Console
1. Go to Elastic Beanstalk Console
2. Select your application and environment
3. Check the dashboard for health metrics

### Common Issues

1. **Build Failures**: Check that all dependencies are in `package.json` dependencies (not devDependencies)
2. **Database Connection**: Verify `DATABASE_URL` is correctly set in environment variables
3. **CORS Issues**: Ensure `CORS_ORIGIN` matches your frontend domain
4. **Health Check Failures**: The app includes a `/health` endpoint for EB health checks

## Scaling and Performance

### Instance Types
- Default: `t3.micro` (free tier eligible)
- Recommended for production: `t3.small` or higher

### Auto Scaling
Configure in EB Console under Configuration > Capacity:
- Minimum instances: 1
- Maximum instances: 4 (adjust based on needs)
- Scaling triggers: CPU utilization, network, etc.

## Security Considerations

1. **IAM Roles**: Use IAM roles instead of hardcoded AWS credentials
2. **Environment Variables**: Store sensitive data in EB environment variables
3. **HTTPS**: Configure SSL/TLS certificate for production
4. **Database Security**: Ensure RDS is in a private subnet with proper security groups

## Cost Optimization

1. **Instance Size**: Start with t3.micro and scale up as needed
2. **Auto Scaling**: Configure appropriate min/max instances
3. **Reserved Instances**: Consider for production workloads
4. **Monitoring**: Use CloudWatch to monitor resource usage

## Support

For issues or questions:
1. Check EB logs: `eb logs`
2. Review AWS CloudWatch metrics
3. Consult AWS Elastic Beanstalk documentation
4. Check application-specific logs in the EB environment