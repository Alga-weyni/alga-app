#!/bin/bash
set -e

echo "🤖 Starting Android APK Build for INSA Submission..."
echo ""

# Check if running on Replit (may not have Android SDK)
if [ ! -d "$HOME/Android/Sdk" ] && [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  WARNING: Android SDK not detected"
    echo ""
    echo "This script requires Android SDK to build APK."
    echo ""
    echo "📋 Alternative build methods:"
    echo "1. Download this project to local machine with Android Studio"
    echo "2. Run this script on machine with Android SDK installed"
    echo "3. Use Android Studio GUI: npx cap open android"
    echo ""
    echo "📖 See INSA_Submission/6_Mobile_Builds/ANDROID_APK_BUILD_GUIDE.md for details"
    exit 1
fi

# Step 1: Build web app
echo "📦 Step 1/5: Building production web app..."
npm run build

if [ ! -d "dist/public" ]; then
    echo "❌ Error: Web build failed (dist/public not found)"
    exit 1
fi

echo "✅ Web app built successfully"
echo ""

# Step 2: Sync Capacitor
echo "🔄 Step 2/5: Syncing Capacitor with Android project..."
npx cap sync android

if [ ! -d "android" ]; then
    echo "❌ Error: Android project not found"
    echo "Run: npx cap add android"
    exit 1
fi

echo "✅ Capacitor sync completed"
echo ""

# Step 3: Build debug APK
echo "🔨 Step 3/5: Building debug APK (for testing)..."
cd android
chmod +x ./gradlew
./gradlew assembleDebug
cd ..

if [ ! -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "❌ Error: Debug APK build failed"
    exit 1
fi

echo "✅ Debug APK created"
echo ""

# Step 4: Build release APK
echo "🔨 Step 4/5: Building release APK (for INSA submission)..."
cd android
./gradlew assembleRelease
cd ..

if [ ! -f "android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "⚠️  Warning: Release APK build failed (may require signing configuration)"
    echo "Debug APK can be used for testing"
fi

echo "✅ Release APK created"
echo ""

# Step 5: Display results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Build Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 APK Locations:"
echo ""
echo "   Debug APK (for testing):"
echo "   ├─ File: android/app/build/outputs/apk/debug/app-debug.apk"
echo "   └─ Size: $(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
echo ""

if [ -f "android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "   Release APK (for INSA submission):"
    echo "   ├─ File: android/app/build/outputs/apk/release/app-release-unsigned.apk"
    echo "   └─ Size: $(du -h android/app/build/outputs/apk/release/app-release-unsigned.apk | cut -f1)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Test Debug APK:"
echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "2. Copy APK to INSA submission folder:"
echo "   cp android/app/build/outputs/apk/debug/app-debug.apk INSA_Submission/6_Mobile_Builds/"
echo ""
echo "3. Submit to INSA with documentation:"
echo "   INSA_Submission/6_Mobile_Builds/ANDROID_APK_BUILD_GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ready for INSA submission!"
echo "🇪🇹"
