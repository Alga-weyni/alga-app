#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server with esbuild..."
rm -rf dist/
mkdir -p dist

# Use esbuild to bundle backend WITHOUT vite
# Mark all dev dependencies as external so they're not bundled
npx esbuild server/index.ts \
  --platform=node \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:vite-plugin-pwa \
  --bundle \
  --format=esm \
  --outdir=dist \
  --packages=external

echo "✓ Backend build complete"
