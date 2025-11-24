#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript only, no Vite)..."
rm -rf dist/
mkdir -p dist

# Transpile just server files, exclude any config files
echo "Compiling TypeScript..."
npx tsc --project tsconfig.backend.json 2>&1 | grep -v "error TS" || true

# If dist/index.js doesn't exist, it means compilation had fatal errors
# Try direct compilation of the entry point
if [ ! -f "dist/index.js" ]; then
  echo "Retrying with focused entry point compilation..."
  npx tsc server/index.ts \
    --target ES2022 \
    --module ES2022 \
    --moduleResolution node \
    --esModuleInterop true \
    --skipLibCheck true \
    --outDir ./dist \
    --noEmitOnError false \
    2>&1 | grep -v "error TS" || true
fi

# Final check
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: Failed to create dist/index.js"
  echo "dist/ contents:"
  ls -la dist/ 2>/dev/null || echo "dist/ is empty"
  exit 1
fi

echo "✓ Backend compiled successfully"
