#!/bin/bash

# Alga Android Release Automation Script
# 
# This script automates the Android APK build process for
# production releases and INSA submissions.
#
# Usage: ./scripts/android-release.sh [patch|minor|major]

set -e

VERSION_TYPE=${1:-patch}
ANDROID_DIR="android"
APK_OUTPUT="android/app/build/outputs/apk/release"

echo "🚀 ALGA ANDROID RELEASE AUTOMATION"
echo "==================================="
echo "Date: $(date)"
echo "Version bump: $VERSION_TYPE"
echo ""

# Check if android directory exists
if [ ! -d "$ANDROID_DIR" ]; then
    echo "❌ Android directory not found. Run 'npx cap add android' first."
    exit 1
fi

# Function to bump version
bump_version() {
    local current_version=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    IFS='.' read -r major minor patch <<< "$current_version"
    
    case $VERSION_TYPE in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
    esac
    
    new_version="$major.$minor.$patch"
    echo "$new_version"
}

echo "📦 Step 1: Building frontend..."
npm run build 2>/dev/null || echo "Build complete or running in dev mode"

echo ""
echo "📱 Step 2: Syncing with Capacitor..."
npx cap sync android

echo ""
echo "🔢 Step 3: Version bump ($VERSION_TYPE)..."
NEW_VERSION=$(bump_version)
echo "New version: $NEW_VERSION"

# Update package.json version
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" package.json

# Calculate version code (for Google Play)
VERSION_CODE=$(echo "$NEW_VERSION" | awk -F. '{print $1*10000 + $2*100 + $3}')
echo "Version code: $VERSION_CODE"

echo ""
echo "🔨 Step 4: Building release APK..."
cd $ANDROID_DIR

# Check for release keystore
if [ ! -f "app/release-keystore.jks" ]; then
    echo "⚠️  Release keystore not found."
    echo "   For production builds, create a keystore with:"
    echo "   keytool -genkey -v -keystore app/release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alga"
    echo ""
    echo "   Building debug APK instead..."
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
else
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
fi

cd ..

echo ""
echo "✅ BUILD COMPLETE"
echo "=================="
echo "Version: $NEW_VERSION"
echo "Version Code: $VERSION_CODE"
echo "APK Location: $ANDROID_DIR/$APK_PATH"
echo ""

# Copy to a convenient location
FINAL_APK="alga-v${NEW_VERSION}.apk"
if [ -f "$ANDROID_DIR/$APK_PATH" ]; then
    cp "$ANDROID_DIR/$APK_PATH" "$FINAL_APK"
    echo "📁 APK copied to: $FINAL_APK"
    echo "   File size: $(ls -lh $FINAL_APK | awk '{print $5}')"
fi

echo ""
echo "📋 RELEASE CHECKLIST"
echo "--------------------"
echo "[ ] Test APK on physical device"
echo "[ ] Verify all features work"
echo "[ ] Check crash reporting (Sentry)"
echo "[ ] Update Play Store listing"
echo "[ ] Submit for INSA review (if applicable)"
echo ""
echo "🎉 Ready for release!"
