# Receta Documentation Site

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
bun install
```

## Local Development

```bash
bun start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
bun run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment to AWS S3

The documentation is hosted on AWS S3 as a static website.

### Prerequisites

1. **AWS CLI installed**
   ```bash
   brew install awscli
   ```

2. **AWS credentials configured**
   ```bash
   aws configure --profile default
   ```

### Deploy Commands

**From root directory:**
```bash
# Build and deploy in one command
bun run docs:deploy

# Or build separately, then deploy
bun run docs:build
bun run docs:deploy
```

**Using NX:**
```bash
# Deploy (includes build step)
nx run receta:docs:deploy

# Build only
nx run receta:docs:build
```

**Direct script execution:**
```bash
bash scripts/deploy-docs.sh
```

### Live Site

The documentation is available at:
- **Production**: http://receta-docs.s3-website-us-east-1.amazonaws.com

### Deployment Details

- **Bucket**: `receta-docs`
- **Region**: `us-east-1`
- **Profile**: `default` (configurable via `AWS_PROFILE` env var)

The deployment script:
1. Installs dependencies (if needed)
2. Builds the Docusaurus site
3. Syncs to S3 with optimized cache headers:
   - HTML files: 1 hour cache
   - Static assets: 1 year cache
4. Uses `--delete` flag to remove old files

### Manual S3 Setup (First Time Only)

If you need to set up a new bucket:

```bash
# Create bucket
aws s3 mb s3://receta-docs --region us-east-1

# Enable static website hosting
aws s3 website s3://receta-docs \
  --index-document index.html \
  --error-document 404.html

# Disable Block Public Access
aws s3api put-public-access-block \
  --bucket receta-docs \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Apply public read policy
aws s3api put-bucket-policy --bucket receta-docs --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::receta-docs/*"
  }]
}'
```
