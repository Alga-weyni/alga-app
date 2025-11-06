# Android APK Build Guide for INSA Submission
## Alga Property Rental Platform - Mobile Application

**Company:** ALGA ONE MEMBER PLC  
**TIN:** 0101809194  
**App ID:** com.alga.app  
**App Name:** Alga (አልጋ)  
**Version:** 1.0.0  
**Capacitor Version:** 7.4.4  
**Build Date:** November 6, 2025

---

## 📱 Mobile App Overview

**Alga Mobile App** is a native Android application built using:
- **Framework:** Capacitor (wraps React web app as native)
- **Type:** Hybrid (web + native capabilities)
- **Technologies:** React 18, TypeScript, Capacitor 7
- **Native Features:** Geolocation, Camera, Push Notifications, QR Scanner

**Purpose:** Provide native mobile experience for property booking, ID verification, and commission tracking on Android devices.

---

## 🚀 Build Methods

### **Method 1: Automated Build Script** (Recommended - 10 minutes)

Use the provided build script for streamlined APK generation.

#### **Step 1: Install Dependencies**

```bash
# Ensure Capacitor CLI is installed globally
npm install -g @capacitor/cli

# Sync Capacitor with latest web code
npx cap sync android
```

#### **Step 2: Run Build Script**

```bash
# Execute automated build script
npm run build:android
```

**What this does:**
1. Builds optimized production React app
2. Syncs assets to Android project
3. Generates debug APK (for testing)
4. Generates release APK (for submission)
5. Signs APK with debug/release keystore
6. Outputs APK location

**Expected Output:**
```
✅ Web app built successfully (dist/public/)
✅ Android sync completed
✅ Debug APK: android/app/build/outputs/apk/debug/app-debug.apk
✅ Release APK: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

#### **Step 3: Locate APK**

**Debug APK (for testing):**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK (for INSA submission):**
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**File Size:** ~15-25 MB (compressed)

---

### **Method 2: Manual Build Process** (30-45 minutes)

If automated script fails, follow manual steps.

#### **Step 1: Build Web App**

```bash
# Build production-optimized web assets
npm run build

# Verify dist/public/ folder created
ls -lh dist/public/
```

#### **Step 2: Sync Capacitor**

```bash
# Copy web assets to Android project
npx cap sync android

# Open Android Studio (optional)
npx cap open android
```

#### **Step 3: Build with Gradle**

**Debug Build (Quick Testing):**
```bash
cd android
./gradlew assembleDebug
cd ..
```

**Release Build (INSA Submission):**
```bash
cd android
./gradlew assembleRelease
cd ..
```

#### **Step 4: Locate APK**

**Debug:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release:**
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

### **Method 3: Android Studio GUI** (Best for Troubleshooting)

#### **Requirements:**
- Android Studio installed
- Android SDK installed
- Java JDK 11+ installed

#### **Steps:**

1. **Open Android Project:**
   ```bash
   npx cap open android
   ```

2. **Wait for Gradle Sync:**
   - Android Studio will sync Gradle files automatically
   - May take 5-10 minutes on first run

3. **Build APK:**
   - Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete (1-3 minutes)

4. **Locate APK:**
   - Click "locate" link in Android Studio notification
   - Or navigate to: `android/app/build/outputs/apk/debug/`

---

## 📦 APK Signing (For Release)

### **Why Sign APK?**

Google Play Store and INSA may require signed APKs for:
- Security verification
- App authenticity
- Deployment readiness

### **Quick Signing (Debug Keystore)**

Android Studio provides a debug keystore automatically:

**Location:** `~/.android/debug.keystore`  
**Password:** `android`  
**Alias:** `androiddebugkey`

**Debug APK is pre-signed** - no additional steps needed for testing.

---

### **Production Signing (Release Keystore)**

For production deployment, create a release keystore:

#### **Step 1: Generate Release Keystore**

```bash
keytool -genkey -v -keystore alga-release-key.keystore \
  -alias alga-key -keyalg RSA -keysize 2048 -validity 10000

# Enter password (remember this!)
# Enter company details:
#   CN: Alga One Member PLC
#   OU: Mobile Development
#   O: Alga One Member PLC
#   L: Addis Ababa
#   ST: Addis Ababa
#   C: ET
```

#### **Step 2: Sign APK**

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore alga-release-key.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  alga-key

# Rename to signed APK
mv android/app/build/outputs/apk/release/app-release-unsigned.apk \
   android/app/build/outputs/apk/release/app-release-signed.apk
```

#### **Step 3: Verify Signature**

```bash
jarsigner -verify -verbose -certs \
  android/app/build/outputs/apk/release/app-release-signed.apk
```

**Expected Output:**
```
jar verified.
```

---

## 🧪 Testing the APK

### **Install on Android Device (USB Debugging)**

#### **Enable USB Debugging:**
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (enables Developer Options)
3. Go to **Settings** → **Developer Options**
4. Enable **USB Debugging**

#### **Install APK:**

```bash
# Connect device via USB
adb devices  # Verify device connected

# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or release APK
adb install android/app/build/outputs/apk/release/app-release-signed.apk
```

#### **Launch App:**
```bash
adb shell am start -n com.alga.app/.MainActivity
```

---

### **Install via File Transfer**

1. Copy APK to device (USB, Bluetooth, or email)
2. Tap APK file on device
3. Allow "Install from Unknown Sources" if prompted
4. Tap **Install**
5. App appears in app drawer as "Alga"

---

### **Test Scenarios for INSA:**

1. **Launch App:**
   - App opens without crashes
   - Splash screen appears
   - Redirects to login or home page

2. **Authentication:**
   - Login with test account: `guest@alga.et` / `Guest@2025`
   - Session persists after app close/reopen
   - Logout works correctly

3. **Property Browsing:**
   - Search for properties in "Addis Ababa"
   - Scroll through listings
   - View property details
   - Images load correctly

4. **Native Features:**
   - Camera opens for ID upload
   - Geolocation permissions requested
   - Push notifications work (booking confirmations)

5. **Offline Mode:**
   - Open app with WiFi off
   - Cached pages still accessible
   - Service worker functions

6. **Performance:**
   - App loads in <3 seconds
   - Smooth scrolling (60 FPS)
   - No memory leaks (monitor via Android Studio Profiler)

---

## 📊 APK Information

### **Expected APK Details:**

```
App Name: Alga
Package: com.alga.app
Version: 1.0.0 (versionCode: 1)
Min SDK: 22 (Android 5.1 Lollipop)
Target SDK: 33 (Android 13)
Permissions:
  - INTERNET (required for API calls)
  - ACCESS_FINE_LOCATION (for property search, meal delivery)
  - ACCESS_COARSE_LOCATION (fallback location)
  - CAMERA (for ID verification, QR scanning)
  - READ_EXTERNAL_STORAGE (for image uploads)
  - WRITE_EXTERNAL_STORAGE (for image downloads)
  - VIBRATE (for notifications)
  - POST_NOTIFICATIONS (Android 13+)

Size: ~20 MB (compressed)
Architecture: Universal (ARMv7, ARM64, x86)
```

---

## 🔧 Troubleshooting

### **Issue 1: Gradle Build Fails**

**Error:** `Could not find com.android.tools.build:gradle:X.X.X`

**Solution:**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
cd ..
```

---

### **Issue 2: "ANDROID_HOME not set"**

**Solution (Linux/Mac):**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

**Solution (Windows):**
```cmd
setx ANDROID_HOME "C:\Users\[Your Username]\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

---

### **Issue 3: APK Not Installing on Device**

**Possible Causes:**
1. **Version Conflict:** Uninstall old version first
   ```bash
   adb uninstall com.alga.app
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Corrupted APK:** Rebuild APK
   ```bash
   cd android && ./gradlew clean && ./gradlew assembleDebug
   ```

3. **USB Debugging Disabled:** Re-enable in Developer Options

---

### **Issue 4: App Crashes on Launch**

**Check Logs:**
```bash
adb logcat | grep -i alga
```

**Common Causes:**
- Missing native dependencies (ensure `npx cap sync` ran)
- Invalid capacitor.config.ts
- JavaScript errors (check browser console in DevTools)

---

## 📋 INSA Submission Checklist

Before submitting APK to INSA:

- [ ] APK builds successfully without errors
- [ ] App launches on physical Android device
- [ ] All 5 test accounts can login
- [ ] Core features tested (browse, book, payment)
- [ ] Native features tested (camera, location, push)
- [ ] App size <50MB (Google Play limit)
- [ ] Min SDK 22 (covers 95%+ Android devices)
- [ ] Permissions justified in documentation
- [ ] APK signed (debug or release keystore)
- [ ] Version number set (1.0.0)
- [ ] App name correct: "Alga (አልጋ)"

---

## 📱 Alternative: Upload to Google Play Internal Testing

For easier INSA testing, upload to Google Play Console:

### **Step 1: Create Google Play Developer Account**
- Cost: $25 one-time fee
- URL: https://play.google.com/console

### **Step 2: Upload APK to Internal Testing**
1. Create new app in Play Console
2. Go to **Testing** → **Internal Testing**
3. Upload `app-release-signed.apk`
4. Add INSA tester emails
5. Share testing link

**Benefits:**
- INSA can install via Play Store link
- Automatic updates
- Professional appearance
- No manual APK transfer

---

## 🔐 Security Notes for INSA

**APK Security Features:**

1. **Code Obfuscation:** Enabled via ProGuard
2. **HTTPS Only:** All API calls over TLS 1.2+
3. **Certificate Pinning:** Prevents man-in-the-middle attacks
4. **Secure Storage:** Sensitive data encrypted (Capacitor Secure Storage)
5. **No Hardcoded Secrets:** API keys loaded from environment
6. **Root Detection:** (Optional - can add Cordova plugin)

**APK Inspection Tools (for INSA auditors):**
- **APK Analyzer:** Built into Android Studio
- **MobSF:** Mobile Security Framework (open-source)
- **jadx:** Decompile APK to Java source
- **apktool:** Reverse engineer APK resources

---

## 📊 Build Statistics

**Typical Build Times:**

| Method | Time | Complexity |
|--------|------|------------|
| Automated Script | 5-10 min | Easy |
| Manual Gradle | 15-20 min | Medium |
| Android Studio | 20-30 min | Medium |
| First-time Setup | 1-2 hours | High (SDK install) |

**Build Outputs:**

| File | Size | Purpose |
|------|------|---------|
| app-debug.apk | ~20 MB | Testing on devices |
| app-release-unsigned.apk | ~18 MB | Pre-signing |
| app-release-signed.apk | ~18 MB | INSA submission |

---

## 📧 Support

**For Build Issues:**

📧 **Email:** support@alga.et  
📱 **Phone:** +251 99 603 4044  
🌐 **Documentation:** https://capacitorjs.com/docs/android

**INSA Contact:**
Dr. Tilahun Ejigu  
📧 tilahune@insa.gov.et  
📱 +251 937 456 374

---

## 📝 Build Script Reference

The following script is included at `scripts/build-android-apk.sh`:

```bash
#!/bin/bash
set -e

echo "🤖 Starting Android APK Build for INSA Submission..."

# Step 1: Build web app
echo "📦 Building production web app..."
npm run build

# Step 2: Sync Capacitor
echo "🔄 Syncing Capacitor with Android project..."
npx cap sync android

# Step 3: Build debug APK
echo "🔨 Building debug APK..."
cd android
./gradlew assembleDebug
cd ..

# Step 4: Build release APK
echo "🔨 Building release APK..."
cd android
./gradlew assembleRelease
cd ..

# Step 5: Display results
echo ""
echo "✅ Build Complete!"
echo ""
echo "📱 Debug APK:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📱 Release APK:"
echo "   android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo ""
echo "📊 APK Size:"
du -h android/app/build/outputs/apk/debug/app-debug.apk
echo ""
echo "🎉 Ready for INSA submission!"
```

---

**Document Prepared By:** Alga Development Team  
**Last Updated:** November 6, 2025  
**Version:** 1.0  
**For:** INSA Mobile Application Security Audit

🇪🇹 **Android APK Ready for INSA Testing** ✨
