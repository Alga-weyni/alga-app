#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server with esbuild (transpile only)..."
rm -rf dist/
mkdir -p dist

# Transpile entry point only - let Node.js resolve other imports at runtime
# This avoids bundling vite code
npx esbuild server/index.ts \
  --outdir=dist \
  --platform=node \
  --format=esm

echo "✓ Backend build complete"
