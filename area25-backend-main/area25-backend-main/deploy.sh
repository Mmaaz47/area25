#!/bin/bash

# AWS Elastic Beanstalk Deployment Script
# This script helps deploy the furniture store backend to Elastic Beanstalk

set -e

echo "=== AWS Elastic Beanstalk Deployment Script ==="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if EB CLI is installed
if ! command_exists eb; then
    echo "❌ EB CLI is not installed. Please install it first:"
    echo "   pip install awsebcli"
    echo "   OR"
    echo "   brew install awsebcli (on macOS)"
    exit 1
fi

# Check if AWS CLI is configured
if ! command_exists aws; then
    echo "❌ AWS CLI is not installed. Please install and configure it first:"
    echo "   pip install awscli"
    echo "   aws configure"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Check if this is the first deployment
if [ ! -f .elasticbeanstalk/config.yml ]; then
    echo "🚀 This appears to be the first deployment. Let's create the environment..."
    echo ""
    echo "Please provide the following information:"

    read -p "Environment name (e.g., furniture-store-prod): " ENV_NAME
    read -p "Application name (e.g., furniture-store-backend): " APP_NAME
    read -p "AWS region (e.g., us-east-1): " AWS_REGION

    echo ""
    echo "Creating Elastic Beanstalk application and environment..."

    # Initialize EB in the current directory
    eb init "$APP_NAME" --region "$AWS_REGION" --platform "Node.js 18"

    # Create the environment
    eb create "$ENV_NAME" --instance-type t3.small --envvars NODE_ENV=production

    echo ""
    echo "🎉 Environment created successfully!"
    echo ""
    echo "⚠️  IMPORTANT: You need to set environment variables in the EB console:"
    echo "   1. Go to: https://console.aws.amazon.com/elasticbeanstalk/"
    echo "   2. Select your application and environment"
    echo "   3. Go to Configuration > Software > Environment properties"
    echo "   4. Add the following variables:"
    echo "      - DATABASE_URL: your RDS PostgreSQL connection string"
    echo "      - AWS_REGION: your AWS region"
    echo "      - AWS_ACCESS_KEY_ID: your AWS access key"
    echo "      - AWS_SECRET_ACCESS_KEY: your AWS secret key"
    echo "      - S3_BUCKET_NAME: your S3 bucket name"
    echo "      - CORS_ORIGIN: your frontend URL (e.g., https://yourdomain.com)"
    echo ""

else
    echo "🔄 Deploying to existing environment..."
    echo ""

    # Build the application
    echo "Building application..."
    npm run build

    # Deploy to EB
    echo "Deploying to Elastic Beanstalk..."
    eb deploy

    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
fi

# Show the application URL
echo "Application URL:"
eb status | grep "CNAME" | awk '{print $2}'

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Next steps:"
echo "1. Test your API endpoints"
echo "2. Check the health dashboard in AWS console"
echo "3. Monitor logs with: eb logs"
echo "4. Scale your environment if needed"