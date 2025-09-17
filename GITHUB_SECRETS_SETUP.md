# GitHub Secrets Configuration Guide

This document provides detailed instructions for setting up the required GitHub secrets for the CI/CD pipelines in your Area-25 project.

## Overview

The GitHub Actions workflows require several secrets to be configured in your repository settings. These secrets contain sensitive information like AWS credentials, database URLs, and application configuration.

## How to Add Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

## Required Secrets

### 🔐 AWS Configuration

| Secret Name | Description | Example Value | Required For |
|-------------|-------------|---------------|--------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM user access key | `AKIAIOSFODNN7EXAMPLE` | All deployments |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | All deployments |
| `AWS_REGION` | AWS region for resources | `us-east-1` | All deployments |

### 🗄️ Database Configuration

| Secret Name | Description | Example Value | Required For |
|-------------|-------------|---------------|--------------|
| `DATABASE_URL` | Production PostgreSQL connection string | `postgresql://username:password@hostname:5432/dbname` | Backend deployment |

### 🚀 Backend Deployment (Elastic Beanstalk)

| Secret Name | Description | Example Value | Required For |
|-------------|-------------|---------------|--------------|
| `EB_APPLICATION_NAME` | Elastic Beanstalk application name | `area25-backend` | Backend deployment |
| `EB_ENVIRONMENT_NAME` | Elastic Beanstalk environment name | `area25-backend-prod` | Backend deployment |
| `EB_ENVIRONMENT_URL` | Elastic Beanstalk environment URL | `http://area25-backend-prod.us-east-1.elasticbeanstalk.com` | Backend deployment |

### 🌐 Frontend Deployment (Amplify)

| Secret Name | Description | Example Value | Required For |
|-------------|-------------|---------------|--------------|
| `AMPLIFY_APP_ID` | AWS Amplify application ID | `d123456789abcd` | Frontend deployment |
| `AMPLIFY_DEPLOYMENT_BUCKET` | S3 bucket for Amplify deployments | `area25-amplify-deployments` | Frontend deployment |
| `AMPLIFY_CUSTOM_DOMAIN` | Custom domain for Amplify app | `app.area25.com` | Frontend deployment (optional) |

### 🎯 Application Configuration

| Secret Name | Description | Example Value | Required For |
|-------------|-------------|---------------|--------------|
| `VITE_API_URL` | Frontend API endpoint URL | `https://api.area25.com` | Frontend deployment |
| `VITE_APP_NAME` | Application display name | `Area25 Furniture Store` | Frontend deployment |
| `S3_BUCKET_NAME` | S3 bucket for image storage | `area25-images` | Backend deployment |

### 🔍 Optional Monitoring & Security

| Secret Name | Description | Example Value | Required For |
|-------------|-------------|---------------|--------------|
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI GitHub App token | `github_pat_...` | Performance monitoring (optional) |

## AWS Setup Instructions

### 1. Create IAM User

1. Log into AWS Console
2. Navigate to **IAM** → **Users**
3. Click **Create user**
4. Name: `github-actions-area25`
5. Attach policies directly:
   - `AWSElasticBeanstalkWebTier`
   - `AWSElasticBeanstalkWorkerTier`
   - `AWSElasticBeanstalkMulticontainerDocker`
   - `AmplifyBackendDeployFullAccess`
   - `AmazonS3FullAccess` (or create custom policy for specific bucket)
   - `AmazonRDSDataFullAccess`

### 2. Custom IAM Policy (Recommended)

Instead of broad permissions, create a custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "elasticbeanstalk:*",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "amplify:*",
                "rds:DescribeDBInstances",
                "configservice:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::area25-images/*",
                "arn:aws:s3:::area25-amplify-deployments/*"
            ]
        }
    ]
}
```

### 3. Create Access Keys

1. Select the created user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Choose **Command Line Interface (CLI)**
5. Save the Access Key ID and Secret Access Key

## Database Setup

### PostgreSQL on AWS RDS

1. Create RDS PostgreSQL instance
2. Note the connection details:
   - Hostname
   - Port (usually 5432)
   - Database name
   - Username
   - Password

3. Format the DATABASE_URL:
   ```
   postgresql://username:password@hostname:5432/database_name
   ```

## Elastic Beanstalk Setup

### 1. Create Application

```bash
# Using EB CLI
eb init area25-backend
eb create area25-backend-prod
```

### 2. Get Application Details

```bash
# Get application name
eb list

# Get environment URL
eb status
```

## Amplify Setup

### 1. Create Amplify App

1. Go to AWS Amplify Console
2. Click **Create app** → **Deploy without Git provider**
3. Note the App ID from the URL: `https://console.aws.amazon.com/amplify/home#/apps/[APP_ID]/overview`

### 2. Create S3 Bucket for Deployments

```bash
aws s3 mb s3://area25-amplify-deployments
```

## S3 Bucket Setup

### Create Image Storage Bucket

```bash
# Create bucket
aws s3 mb s3://area25-images

# Set bucket policy for public read access to images
aws s3api put-bucket-policy --bucket area25-images --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::area25-images/*"
    }
  ]
}'

# Enable CORS for web access
aws s3api put-bucket-cors --bucket area25-images --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'
```

## Environment Configuration

### Development vs Production

The workflows automatically handle different environments:

- **Development/Testing**: Uses test database and staging configurations
- **Production**: Uses production secrets and live services

### Environment Variables in Code

Update your application configuration to use environment variables:

#### Backend (.env)
```env
DATABASE_URL=postgresql://...
AWS_REGION=us-east-1
S3_BUCKET_NAME=area25-images
PORT=3000
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.area25.com
VITE_APP_NAME=Area25 Furniture Store
```

## Security Best Practices

### 1. Principle of Least Privilege

- Use specific IAM policies instead of broad permissions
- Regularly audit and rotate access keys
- Use IAM roles where possible

### 2. Secret Rotation

- Rotate AWS access keys every 90 days
- Update database passwords regularly
- Monitor access logs for unusual activity

### 3. Environment Separation

- Use different AWS accounts for production and development
- Separate S3 buckets for different environments
- Use different database instances

## Verification Steps

### 1. Test Backend Deployment

1. Push changes to main branch
2. Check GitHub Actions logs
3. Verify Elastic Beanstalk deployment
4. Test API endpoints

### 2. Test Frontend Deployment

1. Push frontend changes
2. Check Amplify deployment logs
3. Verify application loads correctly
4. Test functionality end-to-end

### 3. Test Database Migrations

1. Create test migration
2. Push to trigger CI/CD
3. Verify migration runs successfully
4. Check database schema changes

## Troubleshooting

### Common Issues

#### 1. AWS Permission Errors
```
Error: Access Denied
```
**Solution**: Check IAM policies and ensure all required permissions are granted.

#### 2. Database Connection Issues
```
Error: Connection refused
```
**Solution**: Verify DATABASE_URL format and RDS security group settings.

#### 3. Elastic Beanstalk Deployment Failures
```
Error: Application version does not exist
```
**Solution**: Check EB application and environment names match secrets.

#### 4. Amplify Deployment Issues
```
Error: App not found
```
**Solution**: Verify AMPLIFY_APP_ID is correct and app exists.

### Debug Commands

```bash
# Test AWS credentials
aws sts get-caller-identity

# Check Elastic Beanstalk status
eb status

# Test database connection
psql $DATABASE_URL -c "SELECT NOW();"

# Check S3 bucket access
aws s3 ls s3://area25-images
```

## Support

For additional help:

1. Check GitHub Actions logs for detailed error messages
2. Review AWS CloudWatch logs for service-specific issues
3. Verify all secrets are correctly formatted and accessible
4. Ensure IAM permissions are properly configured

## Security Notice

🚨 **Important**: Never commit secrets to your repository. Always use GitHub Secrets or environment variables for sensitive information.