#!/bin/bash

# PRYSM Backend Deployment Script
# This script deploys the PRYSM backend to Railway

set -e

echo "=========================================="
echo "PRYSM Backend Deployment Script"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if logged in
echo "Checking Railway login status..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    echo "1. Open this URL: https://railway.com/activate"
    echo "2. Login with your Railway account"
    echo "3. Run this script again"
    exit 1
fi

echo "Logged in to Railway"

# Set project directory
PROJECT_DIR="/workspace/prysm-test/server"
cd "$PROJECT_DIR"

echo "Current directory: $(pwd)"

# Initialize Railway project if not already initialized
if [ ! -f ".railwayignore" ]; then
    echo "Initializing Railway project..."
    railway init --project-id auto
fi

# Link to existing project or create new
echo "Linking to Railway project..."
railway link

# Set environment variables
echo "Setting OpenAI API key..."
echo "OPENAI_API_KEY: $OPENAI_API_KEY"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"

# Deploy
echo "Deploying to Railway..."
railway up

# Get the domain
echo "Getting deployment URL..."
DOMAIN=$(railway domain)
echo "Backend deployed at: $DOMAIN"

# Save the URL for frontend update
echo "$DOMAIN" > ../backend_url.txt

echo "=========================================="
echo "Deployment complete!"
echo "Backend URL: $DOMAIN"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update frontend with backend URL:"
echo "   VITE_TEST_API_URL=https://$DOMAIN"
echo "2. Redeploy frontend"
echo ""
