#!/bin/bash

echo "🚀 Building Gestion Porc Distribution..."

# Clean previous builds
rm -rf dist-app/
mkdir -p dist-app/assets

# Build frontend
echo "📦 Building frontend..."
npm run build
cp -r dist/ dist-app/

# Build backend
echo "🔧 Building backend..."
cd backend
npm run build
cd ..
mkdir -p dist-app/backend
cp -r backend/dist/ dist-app/backend/
cp -r backend/node_modules/ dist-app/backend/
cp -r backend/prisma/ dist-app/backend/
cp backend/package.json dist-app/backend/

# Copy main files
cp main.js dist-app/
cp package.json dist-app/

# Create a simple icon (SVG to PNG conversion would be better)
echo "🎨 Creating app icon..."
# For now, create a placeholder - replace with actual icon later
touch dist-app/assets/icon.png

echo "✅ Build preparation complete!"
echo "📁 Files ready in dist-app/"
echo "🚀 Ready to run: npm run dist"
