#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript to JavaScript)..."
rm -rf dist/
npm run build || true

if [ -f "dist/server/index.js" ]; then
  echo "✓ Backend build complete - JavaScript generated"
  exit 0
else
  echo "✗ Backend build failed - no JavaScript output"
  exit 1
fi
