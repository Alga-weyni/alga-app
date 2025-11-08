#!/bin/bash
# ========================================
# ALGA MOBILE BUILD SCRIPT FOR INSA AUDIT
# ========================================
# This script builds Android APK and prepares iOS for building
# Run this on your LOCAL computer (Mac/Windows/Linux with Android Studio)

set -e

echo "🔐 Building Alga Mobile Apps for INSA Security Audit"
echo "====================================================="

# Check prerequisites
echo ""
echo "1️⃣ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js first"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Install Node.js first"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Install dependencies
echo ""
echo "2️⃣ Installing dependencies..."
npm install

# Build web assets first
echo ""
echo "3️⃣ Building web assets..."
npm run build

# Sync with Capacitor
echo ""
echo "4️⃣ Syncing with Capacitor..."
npx cap sync

# Android Build
echo ""
echo "5️⃣ Building Android APK..."

if command -v gradle &> /dev/null; then
    echo "✅ Gradle found: $(gradle --version | head -n 1)"
    
    echo "   Building debug APK..."
    cd android
    ./gradlew assembleDebug
    
    echo "   Building release APK..."
    ./gradlew assembleRelease
    cd ..
    
    # Copy APKs to builds folder
    mkdir -p builds/mobile
    cp android/app/build/outputs/apk/debug/app-debug.apk builds/mobile/ 2>/dev/null || echo "   ⚠️  Debug APK not found"
    cp android/app/build/outputs/apk/release/app-release.apk builds/mobile/ 2>/dev/null || echo "   ⚠️  Release APK not found (needs signing)"
    
    echo ""
    echo "✅ Android APKs built successfully!"
    echo "   Debug APK: builds/mobile/app-debug.apk"
    echo "   Release APK: builds/mobile/app-release.apk (if signed)"
else
    echo "⚠️  Gradle not found - opening Android Studio instead"
    echo "   Please build manually in Android Studio:"
    echo "   1. Open 'android' folder in Android Studio"
    echo "   2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    npx cap open android
fi

# iOS Build (Mac only)
echo ""
echo "6️⃣ Preparing iOS build..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode found"
        echo "   Opening Xcode for manual build..."
        echo ""
        echo "   In Xcode:"
        echo "   1. Select 'App' scheme"
        echo "   2. Product → Archive"
        echo "   3. Distribute App → Export"
        echo "   4. Save IPA to builds/mobile/Alga.ipa"
        
        npx cap open ios
    else
        echo "⚠️  Xcode not found. Install from Mac App Store"
    fi
else
    echo "⚠️  iOS builds require macOS with Xcode"
    echo "   Skip iOS for now, or use a Mac computer"
fi

# Generate checksums
echo ""
echo "7️⃣ Generating SHA256 checksums..."

if [ -f "builds/mobile/app-debug.apk" ]; then
    echo "Calculating checksum for app-debug.apk..."
    if command -v sha256sum &> /dev/null; then
        sha256sum builds/mobile/app-debug.apk > builds/mobile/checksums.txt
    elif command -v shasum &> /dev/null; then
        shasum -a 256 builds/mobile/app-debug.apk > builds/mobile/checksums.txt
    fi
fi

if [ -f "builds/mobile/app-release.apk" ]; then
    echo "Calculating checksum for app-release.apk..."
    if command -v sha256sum &> /dev/null; then
        sha256sum builds/mobile/app-release.apk >> builds/mobile/checksums.txt
    elif command -v shasum &> /dev/null; then
        shasum -a 256 builds/mobile/app-release.apk >> builds/mobile/checksums.txt
    fi
fi

if [ -f "builds/mobile/Alga.ipa" ]; then
    echo "Calculating checksum for Alga.ipa..."
    if command -v sha256sum &> /dev/null; then
        sha256sum builds/mobile/Alga.ipa >> builds/mobile/checksums.txt
    elif command -v shasum &> /dev/null; then
        shasum -a 256 builds/mobile/Alga.ipa >> builds/mobile/checksums.txt
    fi
fi

# Summary
echo ""
echo "========================================="
echo "✅ MOBILE BUILD COMPLETE!"
echo "========================================="
echo ""
echo "📦 Built files location: builds/mobile/"
echo ""

if [ -f "builds/mobile/app-debug.apk" ]; then
    echo "✅ app-debug.apk ($(du -h builds/mobile/app-debug.apk | cut -f1))"
fi

if [ -f "builds/mobile/app-release.apk" ]; then
    echo "✅ app-release.apk ($(du -h builds/mobile/app-release.apk | cut -f1))"
fi

if [ -f "builds/mobile/Alga.ipa" ]; then
    echo "✅ Alga.ipa ($(du -h builds/mobile/Alga.ipa | cut -f1))"
fi

if [ -f "builds/mobile/checksums.txt" ]; then
    echo "✅ checksums.txt"
fi

echo ""
echo "📋 Next steps:"
echo "1. Copy builds/mobile/* to INSA_Submission_Mobile/5_Mobile_Builds/"
echo "2. Run: npm run insa:package-mobile"
echo "3. Submit to INSA: tilahune@insa.gov.et"
echo ""
echo "🎉 Ready for INSA mobile app security audit!"
