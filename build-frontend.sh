#!/bin/bash
set -e
echo "🔨 Building Alga frontend with Vite..."
npx vite build
echo "✓ Frontend build complete - static files ready for deployment"
