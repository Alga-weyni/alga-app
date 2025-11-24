#!/bin/bash
set -e
echo "🔨 Building Alga frontend with Vite..."
npx vite build --outDir dist/public
echo "✓ Frontend build complete - static files ready for deployment"
