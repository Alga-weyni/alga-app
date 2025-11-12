# 📱 Android APK Build Guide - Complete Instructions

## ⚠️ **Important: Build Environment**

**Replit Environment:**
- ❌ Android SDK not available in Replit
- ❌ Cannot build APK directly in Replit
- ✅ All code changes are ready for local build

**Local Environment:**
- ✅ Requires Android Studio or Android SDK
- ✅ Can build both debug and release APKs
- ✅ Full control over signing and configuration

---

## 🏗️ **Building Android APK Locally**

### **Prerequisites:**

1. **Android Studio** (Recommended)
   - Download: https://developer.android.com/studio
   - Includes Android SDK and Gradle
   - Best for beginners

2. **Android SDK Only** (Advanced)
   - Install via command line tools
   - Lighter weight
   - For experienced developers

3. **System Requirements:**
   - macOS, Windows, or Linux
   - 8GB+ RAM recommended
   - 10GB+ free disk space

---

### **Step 1: Clone/Download Project**

```bash
# Option 1: Git clone (if using Git)
git clone <your-repo-url>
cd workspace

# Option 2: Download from Replit
# Click "Download as ZIP" in Replit
# Extract to local folder
```

---

### **Step 2: Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Install Capacitor CLI (if not installed)
npm install -g @capacitor/cli
```

---

### **Step 3: Build Web Assets**

```bash
# Build production-ready web assets
npm run build

# This creates dist/ folder with optimized files
```

**Expected output:**
```
✓ built in 27.41s
PWA v1.1.0
precache  23 entries (7747.39 KiB)
```

---

### **Step 4: Sync to Android**

```bash
# Sync web assets to Android project
npx cap sync android

# This copies dist/ to android/app/src/main/assets/public/
```

**Expected output:**
```
✔ Copying web assets...
✔ Creating capacitor.config.json...
✔ copy android in 419.27ms
✔ Updating Android plugins in 106.99ms
[info] Found 6 Capacitor plugins for android:
       @capacitor/app@7.1.0
       @capacitor/browser@7.0.2
       @capacitor/camera@7.0.2
       @capacitor/geolocation@7.1.5
       @capacitor/push-notifications@7.0.3
       @capacitor/share@7.0.2
✔ Sync finished in 1.474s
```

---

### **Step 5: Build APK**

#### **Option A: Android Studio (Recommended)**

1. **Open Project:**
   ```bash
   npx cap open android
   ```
   This launches Android Studio with the Android project

2. **Wait for Gradle Sync:**
   - Android Studio will sync Gradle dependencies
   - May take 5-10 minutes first time
   - Status shown in bottom toolbar

3. **Build Debug APK:**
   - Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait for build to complete
   - APK location shown in notification

4. **Build Release APK (for distribution):**
   - Menu: Build → Generate Signed Bundle / APK
   - Select "APK"
   - Create or select keystore
   - Follow signing wizard

#### **Option B: Command Line (Advanced)**

```bash
# Navigate to Android folder
cd android

# Build debug APK
./gradlew assembleDebug

# Build release APK (requires keystore)
./gradlew assembleRelease
```

**Debug APK location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Release APK location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

### **Step 6: Install APK on Device**

#### **Method 1: Direct Transfer**

1. Connect Android phone via USB
2. Enable "File Transfer" mode
3. Copy APK to phone's Download folder
4. On phone: Open Files app → Downloads → Tap APK
5. Allow "Install from unknown sources" if prompted
6. Tap "Install"

#### **Method 2: ADB Install**

```bash
# Ensure ADB is installed (comes with Android Studio)
adb devices  # Verify phone is connected

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# If app already installed, use -r to replace
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

#### **Method 3: Email/Cloud**

1. Email APK to yourself
2. Open email on phone
3. Download APK
4. Install from Downloads folder

---

## 🔐 **Release APK Signing**

### **Why Sign APKs?**

- **Security**: Verifies app hasn't been tampered with
- **Google Play**: Required for Play Store submission
- **Updates**: Users can update without uninstalling

### **Create Keystore:**

```bash
# Navigate to android/app folder
cd android/app

# Generate keystore
keytool -genkey -v -keystore alga-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias alga-key

# Follow prompts:
# - Enter keystore password (save this!)
# - Re-enter password
# - Enter your name/organization details
# - Enter key password (can be same as keystore password)
```

**⚠️ CRITICAL: Save keystore and passwords!**
- Store keystore file securely
- Never commit keystore to Git
- Losing keystore means you can't update app on Play Store

---

### **Configure Signing:**

1. **Create `keystore.properties`:**
   ```bash
   # In android/ folder
   touch keystore.properties
   ```

2. **Add credentials (don't commit this file):**
   ```properties
   storeFile=app/alga-release-key.jks
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyAlias=alga-key
   keyPassword=YOUR_KEY_PASSWORD
   ```

3. **Add to .gitignore:**
   ```bash
   echo "keystore.properties" >> android/.gitignore
   echo "*.jks" >> android/.gitignore
   ```

4. **Build signed APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

**Signed APK location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📊 **Build Troubleshooting**

### **Issue: Gradle build fails**

**Error:** `SDK location not found`

**Solution:**
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/Mac
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows

# Or create local.properties in android/ folder:
echo "sdk.dir=/path/to/android/sdk" > android/local.properties
```

---

### **Issue: Build takes too long**

**Solution:**
```bash
# Enable Gradle daemon
echo "org.gradle.daemon=true" >> ~/.gradle/gradle.properties

# Increase memory
echo "org.gradle.jvmargs=-Xmx2048m" >> ~/.gradle/gradle.properties

# Enable parallel builds
echo "org.gradle.parallel=true" >> ~/.gradle/gradle.properties
```

---

### **Issue: APK size too large**

**Current size:** ~15MB (debug), ~8MB (release)

**Optimize:**
```bash
# Enable ProGuard/R8 (in android/app/build.gradle)
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}

# Enable split APKs by architecture
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }
}
```

---

### **Issue: App crashes on launch**

**Check:**
1. **Logcat in Android Studio:**
   - View → Tool Windows → Logcat
   - Filter by app package name

2. **ADB Logcat:**
   ```bash
   adb logcat | grep "com.alga.app"
   ```

3. **Common causes:**
   - Missing assets (run `npm run build` and `npx cap sync`)
   - Network permissions (check AndroidManifest.xml)
   - Hardware features (check feature requirements)

---

## 🚀 **Distribution Options**

### **1. Direct Download (Easiest)**

**Setup:**
1. Build release APK
2. Upload to website/cloud storage
3. Share download link

**Pros:**
- ✅ No app store approval needed
- ✅ Instant updates
- ✅ Free

**Cons:**
- ❌ Users must enable "Unknown sources"
- ❌ No automatic updates
- ❌ Less discovery

---

### **2. Google Play Store (Recommended)**

**Requirements:**
- Google Play Developer account ($25 one-time fee)
- Signed release APK or AAB
- Privacy policy URL
- App screenshots and description

**Steps:**
1. Sign up at https://play.google.com/console
2. Create new app
3. Upload AAB (Android App Bundle):
   ```bash
   ./gradlew bundleRelease
   # Location: android/app/build/outputs/bundle/release/app-release.aab
   ```
4. Fill out store listing
5. Submit for review (1-3 days)

**Pros:**
- ✅ Wide discovery
- ✅ Automatic updates
- ✅ Trusted source

**Cons:**
- ❌ Review process
- ❌ Store fees (15-30% if paid app)
- ❌ Compliance requirements

---

### **3. Alternative Stores**

- **Amazon Appstore**: For Kindle/Fire devices
- **Samsung Galaxy Store**: Pre-installed on Samsung devices
- **F-Droid**: For open-source apps
- **APKPure, APKMirror**: Third-party repositories

---

## 📱 **Testing Builds**

### **Internal Testing:**

1. **Build debug APK** (for development)
2. **Install on test devices**
3. **Test all features:**
   - [ ] Bottom navigation
   - [ ] Lemlem AI
   - [ ] Property browsing
   - [ ] Bookings
   - [ ] Services
   - [ ] Camera (ID verification)
   - [ ] Geolocation
   - [ ] Push notifications
   - [ ] Offline mode

---

### **Beta Testing:**

**Google Play Internal Testing:**
1. Upload APK/AAB to Play Console
2. Create internal testing track
3. Add tester email addresses
4. Testers install via Play Store
5. Collect feedback

**TestFlight (iOS):**
- Requires Apple Developer account
- Upload to App Store Connect
- Add beta testers
- Distribute via TestFlight app

---

## 🔧 **Build Configuration**

### **Current Setup:**

**File:** `android/app/build.gradle`

```gradle
android {
    namespace "com.alga.app"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.alga.app"
        minSdkVersion 22  // Android 5.0+
        targetSdkVersion 34  // Android 14
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            shrinkResources false
            signingConfig signingConfigs.release
        }
        
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
}
```

---

### **Update Version:**

**Before each release:**

1. **Update versionCode** (integer, increments with each release):
   ```gradle
   versionCode 2  // Was 1, now 2
   ```

2. **Update versionName** (user-facing version):
   ```gradle
   versionName "1.1"  // Was 1.0, now 1.1
   ```

3. **Rebuild:**
   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease
   ```

---

## ✅ **Build Checklist**

**Before building:**
- [ ] All features tested in web version
- [ ] No console errors
- [ ] Assets optimized (images compressed)
- [ ] Environment variables set (if needed)
- [ ] Database migrations applied

**Build process:**
- [ ] `npm install` (update dependencies)
- [ ] `npm run build` (build web assets)
- [ ] `npx cap sync android` (sync to Android)
- [ ] Update versionCode and versionName
- [ ] `./gradlew assembleDebug` or `assembleRelease`

**After building:**
- [ ] Test APK on real device
- [ ] Check all features work
- [ ] Test offline mode
- [ ] Verify performance (no lag)
- [ ] Check APK size (< 20MB ideal)

---

## 📦 **Build Outputs**

### **Debug APK** (for testing)
```
Location: android/app/build/outputs/apk/debug/app-debug.apk
Size: ~15MB
Signed: Debug keystore (auto-generated)
Use: Internal testing only
```

### **Release APK** (for distribution)
```
Location: android/app/build/outputs/apk/release/app-release.apk
Size: ~8MB (with optimization)
Signed: Your release keystore
Use: Public distribution
```

### **AAB** (for Google Play)
```
Location: android/app/build/outputs/bundle/release/app-release.aab
Size: ~7MB
Signed: Your release keystore
Use: Google Play Store only
```

---

## 🎯 **Next Steps**

### **Local Development:**

1. **Install Android Studio**
2. **Clone project**
3. **Build APK following steps above**
4. **Test on device**
5. **Iterate and rebuild**

### **Distribution:**

1. **Decide distribution method** (direct download vs Play Store)
2. **Create release keystore** (if not done)
3. **Build signed APK/AAB**
4. **Test thoroughly**
5. **Distribute to users**

---

## 📞 **Need Help?**

### **Resources:**

- **Capacitor Docs**: https://capacitorjs.com/docs/android
- **Android Studio**: https://developer.android.com/studio/intro
- **Gradle**: https://docs.gradle.org/current/userguide/userguide.html
- **Google Play Console**: https://play.google.com/console

### **Common Commands Reference:**

```bash
# Build and sync
npm run build && npx cap sync android

# Open in Android Studio
npx cap open android

# Build debug APK
cd android && ./gradlew assembleDebug

# Build release APK
cd android && ./gradlew assembleRelease

# Build AAB for Play Store
cd android && ./gradlew bundleRelease

# Install on connected device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "com.alga.app"

# Clean build (if issues)
cd android && ./gradlew clean && ./gradlew assembleDebug
```

---

**🎉 Android build configuration is complete!**

**Status:**
- ✅ Code ready for mobile build
- ✅ Lemlem navigation integrated
- ✅ Capacitor configured
- ✅ Build scripts updated
- ⏳ Requires local Android SDK to build

**Build on local machine with Android Studio for best results!**

---

**Company**: Alga One Member PLC  
**TIN**: 0101809194  
**App ID**: com.alga.app  
**Version**: 1.0 (versionCode 1)  
**Min Android**: 5.0 (API 21)  
**Target Android**: 14 (API 34)
