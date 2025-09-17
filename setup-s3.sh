#!/bin/bash

echo "Area 25 S3 Setup Helper"
echo "======================="
echo ""

# Check if .env exists
if [ ! -f "area25-backend-main/area25-backend-main/.env" ]; then
    echo "Creating .env file from template..."
    cp area25-backend-main/area25-backend-main/.env.s3.example area25-backend-main/area25-backend-main/.env
    echo "✓ .env file created"
else
    echo "✓ .env file exists"
fi

echo ""
echo "Next Steps:"
echo "1. Edit area25-backend-main/area25-backend-main/.env and add your AWS credentials:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - S3_BUCKET_NAME (default: area25-furniture-images)"
echo "   - AWS_REGION (default: eu-north-1)"
echo ""
echo "2. Install backend dependencies:"
echo "   cd area25-backend-main/area25-backend-main"
echo "   npm install"
echo ""
echo "3. Create S3 bucket in AWS Console:"
echo "   - Name: area25-furniture-images"
echo "   - Region: eu-north-1 (Stockholm)"
echo "   - Enable public access for images"
echo ""
echo "4. Run migration to move existing images to S3:"
echo "   npm run migrate:images"
echo ""
echo "5. Restart backend server:"
echo "   npm run dev"
echo ""
echo "For detailed instructions, see S3_SETUP_GUIDE.md"