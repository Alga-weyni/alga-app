#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript transpile only, no bundling)..."
mkdir -p dist

# Transpile backend files with backend-specific TypeScript config
npx tsc --project tsconfig.backend.json

echo "Backend build complete!"
