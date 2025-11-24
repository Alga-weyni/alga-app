#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server only (no Vite)..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --external:vite \
  --external:@vitejs/plugin-react \
  --external:vite-plugin-pwa \
  --bundle \
  --format=esm \
  --outdir=dist

echo "Backend build complete!"
