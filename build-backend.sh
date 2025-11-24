#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server only (no Vite)..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Backend build complete!"
