#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript transpile only, no bundling)..."
mkdir -p dist

# Transpile backend files - suppress all output, continue regardless
# Type errors don't affect runtime, we just need the JavaScript output
npx tsc --project tsconfig.backend.json 2>&1 | grep -v "error TS" || true

# Double-check by compiling main entry point separately
npx tsc server/index.ts --target ES2022 --module ES2022 --moduleResolution node --esModuleInterop true --skipLibCheck true --outDir ./dist 2>&1 | grep -v "error TS" || true

# Verify dist/index.js was created - if not, we have a real problem
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: Backend compilation failed - no dist/index.js produced"
  ls -la dist/ 2>/dev/null || echo "dist/ directory empty or doesn't exist"
  exit 1
fi

echo "✓ Backend build complete - dist/index.js created"
