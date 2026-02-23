#!/bin/bash
set -e

# AWS S3 Documentation Deployment Script
# Deploys the Docusaurus docs-site to AWS S3 static website hosting

BUCKET_NAME="receta-docs"
REGION="us-east-1"
AWS_PROFILE="${AWS_PROFILE:-default}"
DOCS_DIR="docs-site"

echo "🚀 Deploying Receta Documentation to AWS S3"
echo "============================================"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo "Profile: $AWS_PROFILE"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Install it with: brew install awscli"
    exit 1
fi

# Check if docs-site directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo "❌ Error: docs-site directory not found"
    exit 1
fi

# Navigate to docs-site directory
cd "$DOCS_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Build the documentation site
echo "🔨 Building documentation site..."
bun run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Error: Build directory not found"
    exit 1
fi

echo "☁️  Syncing to S3..."

# Upload HTML files with shorter cache (1 hour)
aws s3 sync build s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=3600" \
  --exclude "*" \
  --include "*.html" \
  --region $REGION \
  --profile $AWS_PROFILE

# Upload static assets with longer cache (1 year)
aws s3 sync build s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --region $REGION \
  --profile $AWS_PROFILE

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📖 Your docs are live at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
