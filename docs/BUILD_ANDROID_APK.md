# 📱 How to Build Alga Android APK

## Complete Guide for Ethiopian Mobile Launch

---

## 🎯 Overview

Your Alga web app can be packaged as a native Android APK using Capacitor. This gives you:
- ✅ Real Android app (not just a web wrapper)
- ✅ Access to native features (camera, GPS, notifications)
- ✅ Can be distributed via Google Play Store or direct APK download
- ✅ Works offline with PWA capabilities

---

## 📋 Prerequisites

### 1. Android Studio (Required)
You'll need to install Android Studio on your local computer (not on Replit):

**Download:** https://developer.android.com/studio

**What it includes:**
- Android SDK
- Build tools
- Emulator for testing
- Gradle build system

### 2. Java Development Kit (JDK)
Android Studio includes JDK, but you can also install separately:
- JDK 11 or higher recommended

---

## 🚀 Step-by-Step Build Process

### Step 1: Build Your Web App

On Replit, run:
```bash
npm run build
```

This creates the optimized production build in `dist/public/`

**What happens:**
- Vite bundles and minifies your React code
- Assets are optimized
- Creates static files ready for mobile

---

### Step 2: Sync with Capacitor

On Replit, run:
```bash
npx cap sync android
```

**What this does:**
- Creates/updates `android/` folder
- Copies your web build to Android project
- Updates Capacitor plugins
- Configures native Android project

**First time running?** It will create the complete Android project structure.

---

### Step 3: Download Your Project

Since building Android APKs requires Android Studio (not available on Replit), you need to:

1. **Download your entire Replit project:**
   - Click on the three dots menu (⋮) in Replit
   - Select "Download as zip"
   - Extract on your local computer

2. **Or use Git:**
   ```bash
   git clone <your-replit-git-url>
   ```

---

### Step 4: Open in Android Studio (On Your Computer)

1. **Launch Android Studio**
2. **Open Project:**
   - File → Open
   - Navigate to `android/` folder in your project
   - Click "Open"

3. **Wait for Gradle Sync:**
   - Android Studio will automatically sync Gradle
   - This downloads dependencies (first time takes 5-10 minutes)
   - Wait for "Gradle build finished" message

---

### Step 5: Configure App Signing (For Release)

#### Generate Keystore (First time only):

In Android Studio terminal:
```bash
keytool -genkey -v -keystore alga-release-key.keystore -alias alga -keyalg RSA -keysize 2048 -validity 10000
```

**Enter details:**
- Password: Choose a strong password (SAVE THIS!)
- Name: Alga
- Organization: Your company name
- Location: Addis Ababa
- Country: ET

**IMPORTANT:** Save the keystore file and password securely!

#### Configure build.gradle:

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('path/to/alga-release-key.keystore')
            storePassword 'your-keystore-password'
            keyAlias 'alga'
            keyPassword 'your-key-password'
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

---

### Step 6: Build the APK

#### Option A: Debug APK (For Testing)

In Android Studio:
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Click "locate" in the notification
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Use for:** Testing on your device, sharing with testers

#### Option B: Release APK (For Distribution)

In Android Studio terminal:
```bash
cd android
./gradlew assembleRelease
```

**Or via menu:**
1. **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Choose your keystore
4. Enter passwords
5. Select **release** build variant
6. Click **Finish**

**APK location:** `android/app/build/outputs/apk/release/app-release.apk`

**Use for:** Google Play Store, direct distribution to users

---

### Step 7: Test Your APK

#### Install on Physical Device:

1. **Enable USB Debugging** on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

2. **Connect phone to computer** via USB

3. **In Android Studio:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

4. **Or transfer APK to phone and install directly**

#### Test on Emulator:

1. **In Android Studio:**
   - Tools → Device Manager
   - Create Virtual Device
   - Select device (e.g., Pixel 6)
   - Download system image (Android 13 recommended)
   - Launch emulator

2. **Install APK:**
   - Drag and drop APK onto emulator
   - Or use: `adb install app-release.apk`

---

## 📊 APK Optimization for Ethiopian Networks

### Reduce APK Size (Important for Data Costs)

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    buildTypes {
        release {
            // Enable code shrinking
            minifyEnabled true
            shrinkResources true
            
            // Optimize
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    // Split APKs by architecture (reduces size by 30-40%)
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a'
            universalApk false
        }
    }
}
```

**Result:** Instead of one 50MB APK, you get:
- `app-armeabi-v7a-release.apk` (~20MB) - for older phones
- `app-arm64-v8a-release.apk` (~25MB) - for newer phones

---

## 🏪 Distribution Options

### Option 1: Google Play Store (Recommended)

**Benefits:**
- ✅ Automatic updates
- ✅ Trusted by users
- ✅ Better discoverability
- ✅ In-app payments integration

**Steps:**
1. Create Google Play Console account ($25 one-time fee)
2. Upload `app-release.aab` (Bundle, not APK)
3. Fill in app details, screenshots
4. Submit for review (1-3 days)

**Build Android App Bundle (AAB):**
```bash
cd android
./gradlew bundleRelease
```
Location: `android/app/build/outputs/bundle/release/app-release.aab`

### Option 2: Direct APK Distribution

**Benefits:**
- ✅ No Play Store fees
- ✅ Instant distribution
- ✅ Full control
- ✅ Useful for beta testing

**Steps:**
1. Upload APK to your website/cloud storage
2. Share download link
3. Users install with "Unknown Sources" enabled

**Security note:** Provide SHA-256 checksum so users can verify authenticity

### Option 3: Alternative App Stores

**Ethiopian/African options:**
- Aptoide
- APKPure
- GetJar
- Amazon Appstore

---

## 🔧 Common Build Issues & Fixes

### Issue 1: Gradle Build Failed
```
Error: Could not find com.android.tools.build:gradle:x.x.x
```

**Fix:**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

### Issue 2: SDK Not Found
```
Error: SDK location not found
```

**Fix:**
Create `android/local.properties`:
```
sdk.dir=/Users/YourName/Library/Android/sdk  # Mac
# or
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk  # Windows
```

### Issue 3: Capacitor Plugin Missing
```
Error: Plugin X not found
```

**Fix:**
```bash
npx cap sync android
```

### Issue 4: APK Size Too Large
```
APK is 80MB, too big for Ethiopian users
```

**Fix:**
- Enable code shrinking (see optimization section above)
- Use split APKs by architecture
- Compress images in `client/public/`
- Remove unused dependencies

---

## 📱 Ethiopian Market Considerations

### 1. App Size Optimization
- Target: < 25MB per APK
- Use split APKs (separate for old/new phones)
- Compress all images
- Lazy load features

### 2. Offline Support
- PWA features work offline
- Cache essential data
- Show offline indicators
- Queue actions when offline

### 3. Low-End Device Support
- Minimum SDK: Android 7.0 (API 24)
- Test on budget devices (Samsung A series)
- Optimize animations
- Reduce memory usage

### 4. Network Optimization
- Compress API responses
- Use image CDN with automatic compression
- Implement request retry logic
- Show loading states clearly

---

## 🎯 Quick Commands Cheat Sheet

```bash
# On Replit (before building)
npm run build                    # Build web app
npx cap sync android            # Sync to Android project

# On Local Computer (Android Studio terminal)
cd android
./gradlew clean                 # Clean build
./gradlew assembleDebug        # Build debug APK
./gradlew assembleRelease      # Build release APK
./gradlew bundleRelease        # Build AAB for Play Store

# Install on device
adb devices                     # List connected devices
adb install app-release.apk   # Install APK

# Check APK size
ls -lh app/build/outputs/apk/release/
```

---

## ✅ Pre-Launch Checklist

Before distributing your APK:

- [ ] Test on multiple Android versions (7.0+)
- [ ] Test on low-end device (2GB RAM)
- [ ] Test on slow network (3G)
- [ ] Verify all permissions work (camera, GPS, etc.)
- [ ] Test offline functionality
- [ ] Verify payments work (Chapa, TeleBirr)
- [ ] Check app size (< 25MB per split APK)
- [ ] Test deep links (if any)
- [ ] Verify push notifications
- [ ] Check app icon displays correctly
- [ ] Test on Ethiopian networks (Ethio Telecom)

---

## 🚀 Your Build Workflow

### Development Cycle:
```
1. Code on Replit → Test in browser
2. npm run build → npx cap sync android
3. Download project → Open in Android Studio
4. Build debug APK → Test on device
5. Fix bugs → Repeat
```

### Production Release:
```
1. Final code review
2. npm run build (production)
3. npx cap sync android
4. Download project
5. Build signed release APK
6. Test thoroughly
7. Upload to Play Store OR distribute APK
8. Launch! 🎉
```

---

## 📞 Need Help?

**Common Resources:**
- Capacitor Docs: https://capacitorjs.com/docs/android
- Android Studio Help: https://developer.android.com/studio/intro
- Stack Overflow: Tag with `capacitor` and `android`

**Ethiopian Developer Community:**
- Search for "Ethiopian Android Developers" groups
- Local tech meetups in Addis Ababa
- Ethiopian tech forums

---

## 🎉 You're Ready!

Your Alga app is now ready to become a native Android app for the Ethiopian market. The same codebase works on:
- ✅ Web browser
- ✅ PWA (installable)
- ✅ Android app
- ✅ iOS app (same process, just use Xcode)

**Next step:** Follow this guide to build your first APK and test on an Android device! 🇪🇹

---

**Created:** October 27, 2025
**For:** Alga Ethiopian Property Platform
**Platform:** Android via Capacitor 7.4.4
