# Build Instructions - Mobile & Web Applications
**Application:** Alga Property Rental Platform  
**Prepared for:** INSA Security Audit  
**Date:** November 7, 2025

---

## Overview

The Alga platform consists of three deployment targets:
1. **Web Application** - Responsive web interface
2. **Progressive Web App (PWA)** - Installable web app
3. **Native Mobile Apps** - Android (APK) and iOS (IPA) via Capacitor

All three share the same codebase and are built from the same source code.

---

## Prerequisites

### Development Environment
```bash
# Node.js (v20+)
node --version  # Should show v20.x.x or higher

# npm (comes with Node.js)
npm --version  # Should show v10.x.x or higher

# Git
git --version  # For version control
```

### Platform-Specific Requirements

**For Android:**
- Android Studio (latest)
- Android SDK 24+ (API Level 24)
- Java Development Kit (JDK) 17+
- Gradle 8.0+

**For iOS (macOS only):**
- Xcode 14+ (from Mac App Store)
- iOS SDK 13+
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer account ($99/year for distribution)

---

## 1. Initial Setup

### 1.1 Clone Repository
```bash
git clone https://github.com/yourusername/alga-platform.git
cd alga-platform
```

### 1.2 Install Dependencies
```bash
npm install
```

**This installs:**
- Frontend dependencies (React, Vite, Tailwind)
- Backend dependencies (Express, Drizzle ORM)
- Capacitor CLI and plugins
- PWA plugin

**Expected output:**
```
added 1234 packages in 45s
```

### 1.3 Environment Variables

Create `.env` file in project root:
```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-random-256-bit-secret-here

# Payment Providers
CHAPA_SECRET_KEY=your-chapa-secret-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email
SENDGRID_API_KEY=SG.your_sendgrid_key

# SMS
ETHIO_TELECOM_API_KEY=your_ethio_telecom_key

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Replit AI (optional)
REPLIT_AI_API_URL=https://api.replit.com/ai
```

**Security Notes:**
- ✅ Never commit `.env` file to Git
- ✅ Use `.env.example` for template
- ✅ Different secrets for development/staging/production

---

## 2. Building Web Application

### 2.1 Development Build

**Start development server:**
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5000/
  ➜  Network: http://192.168.1.100:5000/
  ➜  press h + enter to show help
```

**Features:**
- Hot Module Replacement (HMR)
- TypeScript type checking
- Live backend API
- Instant updates on code changes

**Access:** Open http://localhost:5000 in browser

---

### 2.2 Production Build

**Build optimized production bundle:**
```bash
npm run build
```

**What happens:**
1. TypeScript compilation
2. Vite bundles frontend (code splitting, minification)
3. CSS processing (Tailwind, PostCSS)
4. Asset optimization (images, fonts)
5. Service worker generation (PWA)

**Output directory:** `dist/`

**Expected output:**
```
vite v5.0.0 building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-abc123.js     234.56 kB │ gzip: 78.90 kB
dist/assets/index-def456.css     12.34 kB │ gzip: 3.45 kB
✓ built in 12.34s
```

**Test production build locally:**
```bash
npm run preview
```

---

### 2.3 Deploy to Production (Render)

**Option 1: Automatic Deploy via Git**
1. Push code to GitHub/GitLab
2. Render auto-deploys from `main` branch
3. Build command: `npm run build`
4. Start command: `npm start`

**Option 2: Manual Deploy via Render CLI**
```bash
# Install Render CLI
npm install -g @render/cli

# Deploy
render deploy
```

**Production URL:** `https://alga.onrender.com`

---

## 3. Building Progressive Web App (PWA)

### 3.1 PWA Configuration

**File:** `vite.config.ts`

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Alga - Ethiopian Property Rentals',
        short_name: 'Alga',
        description: 'Book unique stays across Ethiopia',
        theme_color: '#8B4513',
        background_color: '#F5F5DC',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
};
```

### 3.2 Build PWA

**Same as web production build:**
```bash
npm run build
```

**PWA assets generated:**
- `dist/manifest.webmanifest` - App manifest
- `dist/sw.js` - Service worker
- `dist/workbox-*.js` - Offline caching

### 3.3 Test PWA

**Chrome DevTools:**
1. Open production build: `npm run preview`
2. F12 → Application tab
3. Manifest: Check manifest loaded
4. Service Workers: Verify service worker registered
5. Install app: Click "+" in address bar

**Lighthouse Audit:**
```bash
# Install Lighthouse
npm install -g lighthouse

# Run PWA audit
lighthouse http://localhost:5000 --view
```

**Expected scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

---

## 4. Building Android App (APK)

### 4.1 Capacitor Setup (First Time Only)

```bash
# Add Android platform
npx cap add android

# This creates:
# - android/ directory with Android Studio project
# - android/app/src/main/AndroidManifest.xml
# - android/app/build.gradle
```

### 4.2 Configure Android App

**File:** `android/app/src/main/AndroidManifest.xml`

Update package name and permissions:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="et.alga.app">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    
    <application
        android:label="Alga"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="true"
        android:usesCleartextTraffic="true">
        <!-- Activities -->
    </application>
</manifest>
```

**File:** `android/app/build.gradle`

```gradle
android {
    namespace "et.alga.app"
    compileSdkVersion 34
    defaultConfig {
        applicationId "et.alga.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 4.3 Build Android APK

**Step 1: Build web assets**
```bash
npm run build
```

**Step 2: Sync to Android**
```bash
npx cap sync android
```

**What happens:**
- Copies `dist/` to `android/app/src/main/assets/public/`
- Updates Capacitor plugins
- Generates Android resources

**Step 3: Open in Android Studio**
```bash
npx cap open android
```

**Step 4: Build APK in Android Studio**

**For Debug APK (Testing):**
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Wait for "BUILD SUCCESSFUL"
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**For Release APK (Production):**

**4a. Generate signing key (first time only):**
```bash
cd android
keytool -genkey -v -keystore alga-release.keystore \
  -alias alga-key -keyalg RSA -keysize 2048 -validity 10000

# Answer prompts:
# - Password: (choose secure password)
# - Name: Alga One Member PLC
# - Organizational Unit: Engineering
# - City: Addis Ababa
# - Country: ET
```

**4b. Configure signing in `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../alga-release.keystore")
            storePassword "your-keystore-password"
            keyAlias "alga-key"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**4c. Build release APK:**
```bash
cd android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

**File size:** ~15-25 MB (depends on assets)

---

### 4.4 Test APK

**Install on Android device:**
```bash
# Via ADB (USB debugging enabled)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# OR transfer APK to device and install manually
```

**Test checklist:**
- [ ] App launches successfully
- [ ] Login with OTP works
- [ ] Property browsing works
- [ ] Images load correctly
- [ ] Lemlem chat functions
- [ ] Camera permission for ID upload
- [ ] Location permission for maps
- [ ] Push notifications (if enabled)

---

## 5. Building iOS App (IPA)

### 5.1 Capacitor Setup (First Time Only)

```bash
# Add iOS platform (macOS only)
npx cap add ios

# This creates:
# - ios/ directory with Xcode project
# - ios/App/App.xcodeproj
```

### 5.2 Configure iOS App

**File:** `ios/App/App/Info.plist`

Update app info and permissions:
```xml
<dict>
    <key>CFBundleDisplayName</key>
    <string>Alga</string>
    
    <key>CFBundleIdentifier</key>
    <string>et.alga.app</string>
    
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    
    <!-- Camera permission -->
    <key>NSCameraUsageDescription</key>
    <string>Alga needs camera access to scan ID documents</string>
    
    <!-- Location permission -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Alga needs your location to show nearby properties</string>
</dict>
```

### 5.3 Build iOS IPA

**Step 1: Build web assets**
```bash
npm run build
```

**Step 2: Sync to iOS**
```bash
npx cap sync ios
```

**Step 3: Open in Xcode**
```bash
npx cap open ios
```

**Step 4: Configure in Xcode**

1. Select project in navigator
2. General tab:
   - Bundle Identifier: `et.alga.app`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: iOS 13.0+
3. Signing & Capabilities:
   - Team: (Select your Apple Developer account)
   - Automatically manage signing: ✅
   - Provisioning Profile: Auto-generated

**Step 5: Build IPA**

**For Debug (Testing):**
1. Select device/simulator
2. Product → Build (⌘B)
3. Product → Run (⌘R)

**For Release (App Store):**
1. Product → Archive
2. Wait for archive to complete
3. Organizer opens automatically
4. Validate App → Next → Validate
5. Distribute App → App Store Connect → Next
6. Export IPA (for manual testing)

**Output:** `~/Library/Developer/Xcode/Archives/.../Alga.ipa`

**File size:** ~20-30 MB

---

### 5.4 Test IPA

**TestFlight (Recommended):**
1. Upload IPA to App Store Connect
2. Create internal testing group
3. Add INSA auditor emails
4. Testers receive email invite
5. Install via TestFlight app

**Manual Install (Development):**
```bash
# Via Xcode
# 1. Connect iPhone via USB
# 2. Select device in Xcode
# 3. Product → Run
```

---

## 6. App Store Submission (Future)

### 6.1 Google Play Store (Android)

**Requirements:**
- Signed APK or AAB (Android App Bundle)
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2, max 8)
- Privacy policy URL
- Content rating questionnaire

**Steps:**
1. Create Google Play Console account ($25 one-time fee)
2. Create new application
3. Upload AAB: `./gradlew bundleRelease`
4. Fill in store listing
5. Set pricing (Free)
6. Submit for review (1-7 days)

---

### 6.2 Apple App Store (iOS)

**Requirements:**
- Apple Developer account ($99/year)
- App Store icon (1024x1024 PNG)
- Screenshots (5.5" and 6.5" displays)
- Privacy policy URL
- App description (4000 chars max)

**Steps:**
1. Create App Store Connect app
2. Archive in Xcode
3. Upload via Xcode Organizer
4. Fill in metadata
5. Submit for review (1-7 days)

---

## 7. Build Artifacts for INSA

### 7.1 Required Files

**For Android:**
```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk (signed)
```

**For iOS:**
```
Alga.ipa (exported from Xcode)
```

**For Web:**
```
dist/ (entire directory, zipped)
```

### 7.2 Checksums (Verification)

**Generate checksums:**
```bash
# Android APK
sha256sum android/app/build/outputs/apk/debug/app-debug.apk > checksums.txt

# iOS IPA
shasum -a 256 Alga.ipa >> checksums.txt

# Web build
tar -czf alga-web-build.tar.gz dist/
sha256sum alga-web-build.tar.gz >> checksums.txt
```

**Share `checksums.txt` with INSA for integrity verification**

---

## 8. Troubleshooting

### Common Android Issues

**Issue:** `JAVA_HOME not set`
```bash
# macOS
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Windows
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

**Issue:** `SDK not found`
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Issue:** `Gradle build failed`
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

---

### Common iOS Issues

**Issue:** `Code signing error`
- Solution: Xcode → Preferences → Accounts → Sign in with Apple ID
- Enable "Automatically manage signing"

**Issue:** `Provisioning profile not found`
- Solution: Xcode → Signing & Capabilities → Team → Select team

**Issue:** `Pod install failed`
```bash
cd ios/App
pod repo update
pod install
```

---

## 9. Version Management

### Semantic Versioning

**Format:** MAJOR.MINOR.PATCH (e.g., 1.0.0)

**Update version:**
```bash
# Update package.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

# Update Android
# Edit android/app/build.gradle:
versionName "1.1.0"
versionCode 2  # Increment by 1

# Update iOS
# Edit ios/App/App.xcodeproj in Xcode
# Version: 1.1.0
# Build: 2
```

---

## 10. Build Automation (Future)

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/build.yml
name: Build Apps
on: [push]
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npx cap sync android
      - name: Build APK
        run: cd android && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

---

## Summary

| Build Target | Command | Output | Size |
|--------------|---------|--------|------|
| Web (Dev) | `npm run dev` | Development server | N/A |
| Web (Prod) | `npm run build` | `dist/` | ~2 MB |
| PWA | `npm run build` | `dist/` + service worker | ~2 MB |
| Android APK | `./gradlew assembleRelease` | `app-release.apk` | ~20 MB |
| iOS IPA | Xcode → Archive | `Alga.ipa` | ~25 MB |

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Build System:** Vite 5.0 + Capacitor 6.0  
**Tested On:** macOS 14, Windows 11, Ubuntu 22.04
