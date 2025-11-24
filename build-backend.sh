#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building backend server (TypeScript to JavaScript)..."
rm -rf dist/
npm run build

echo "✓ Backend build complete"
