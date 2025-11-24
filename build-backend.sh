#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript transpile only, no bundling)..."
mkdir -p dist

# Transpile server files with TypeScript
npx tsc --project tsconfig.json --outDir ./dist --declarationMap false --declaration false --sourceMap false

# Transpile just the entry point with proper module support
npx tsc server/index.ts --target ES2022 --module ES2022 --moduleResolution node --esModuleInterop true --skipLibCheck true --outDir ./dist --declarationMap false --declaration false --sourceMap false

echo "Backend build complete!"
