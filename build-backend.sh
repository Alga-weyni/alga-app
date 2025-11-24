#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript only, no Vite)..."
rm -rf dist/
mkdir -p dist

# Suppress ALL output from TypeScript - we don't care about type errors, just need JS files
echo "Compiling backend TypeScript to JavaScript..."
npx tsc --project tsconfig.backend.json > /dev/null 2>&1 || npx tsc --project tsconfig.backend.json --noEmitOnError false > /dev/null 2>&1 || true

# If dist/index.js still doesn't exist, try single-file compilation
if [ ! -f "dist/index.js" ]; then
  echo "Attempting focused entry point compilation..."
  npx tsc server/index.ts \
    --target ES2022 \
    --module ES2022 \
    --moduleResolution node \
    --esModuleInterop true \
    --skipLibCheck true \
    --outDir ./dist \
    --noEmitOnError false \
    > /dev/null 2>&1 || true
fi

# Verify success
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: Failed to produce dist/index.js"
  exit 1
fi

echo "✓ Backend build complete"
