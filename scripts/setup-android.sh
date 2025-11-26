#!/bin/bash

# Alga Android Build Setup Script
# This script prepares the Android build environment

set -e

echo "🔧 Alga Android Build Setup"
echo "==========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

# Check if Capacitor CLI is available
if ! npx cap --version &> /dev/null; then
    echo "❌ Error: Capacitor CLI not found"
    exit 1
fi

echo "✅ Capacitor version: $(npx cap --version)"

# Sync Capacitor
echo "🔄 Syncing Capacitor with Android..."
npx cap sync android

# Make gradlew executable
if [ -f "android/gradlew" ]; then
    chmod +x android/gradlew
    echo "✅ Gradle wrapper is executable"
fi

# Check for JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    echo "⚠️  Warning: JAVA_HOME is not set"
    echo "   Please set JAVA_HOME to your JDK 21 installation"
else
    echo "✅ JAVA_HOME: $JAVA_HOME"
fi

# Check for ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  Warning: ANDROID_HOME is not set"
    echo "   Please set ANDROID_HOME to your Android SDK directory"
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To build the APK, run:"
echo "  cd android && ./gradlew assembleDebug"
echo ""
echo "The APK will be at:"
echo "  android/app/build/outputs/apk/debug/app-debug.apk"
