# 🤖 Android APK Local Build Guide - Step-by-Step

## 🎯 **Quick Overview**

This guide will help you build the Alga Android APK on your local machine.

**Why Local?** Replit doesn't have Android SDK, so you need to build on your computer.

**Time Required:** 20-30 minutes (first time), 5 minutes (subsequent builds)

**Prerequisites:** Computer (Windows/Mac/Linux), 8GB+ RAM, 10GB+ disk space

---

## 📋 **Before You Start**

### **What You'll Need:**

1. ✅ **Your project files** (download from Replit or clone repo)
2. ✅ **Android Studio** (includes Android SDK and Gradle)
3. ✅ **Node.js** (v18 or v20)
4. ✅ **Git** (optional, for version control)

### **Download Project:**

**Option 1: Download from Replit**
```
1. In Replit, click the three dots menu
2. Select "Download as ZIP"
3. Extract ZIP to a folder on your computer
4. Open terminal in that folder
```

**Option 2: Clone Repository (if using Git)**
```bash
git clone <your-repo-url>
cd workspace
```

---

## 🛠️ **Step 1: Install Android Studio**

### **Download and Install:**

1. **Visit:** https://developer.android.com/studio
2. **Download** Android Studio for your OS (Windows/Mac/Linux)
3. **Install** following the installer wizard
4. **Launch** Android Studio
5. **Complete setup wizard:**
   - Choose "Standard" installation
   - Accept licenses
   - Download SDK components (this takes 10-20 minutes)

### **Verify Installation:**

```bash
# Check Android Studio is installed
which studio  # Mac/Linux
where studio  # Windows

# Check Android SDK location
echo $ANDROID_HOME  # Mac/Linux
echo %ANDROID_HOME%  # Windows
```

**Default SDK locations:**
- Mac: `~/Library/Android/sdk`
- Windows: `C:\Users\YourName\AppData\Local\Android\Sdk`
- Linux: `~/Android/Sdk`

---

## 🛠️ **Step 2: Install Node.js Dependencies**

### **In your project folder:**

```bash
# Check Node.js version
node --version
# Should be v18.x or v20.x

# Install dependencies
npm install

# This installs:
# - React and build tools
# - Capacitor CLI and plugins
# - All project dependencies
# Takes 2-5 minutes
```

**Expected output:**
```
added 1500+ packages in 3m
```

---

## 🛠️ **Step 3: Build Web Assets**

### **Create production build:**

```bash
npm run build
```

**This command:**
- Builds React app with Vite
- Optimizes and minifies code
- Creates PWA service worker
- Outputs to `dist/` folder
- Takes 30-60 seconds

**Expected output:**
```
✓ built in 27.41s

PWA v1.1.0
mode      generateSW
precache  23 entries (7747.39 KiB)
files generated
  ../dist/public/sw.js
  ../dist/public/workbox-f6a91684.js

  dist/index.js  431.3kb

⚡ Done in 55ms
```

**Success:** You should see `dist/` folder created with web assets

---

## 🛠️ **Step 4: Sync to Android**

### **Copy web assets to Android project:**

```bash
npx cap sync android
```

**This command:**
- Copies `dist/` to Android assets folder
- Updates Capacitor plugins
- Generates Android config
- Takes 5-10 seconds

**Expected output:**
```
✔ Copying web assets from public to android/app/src/main/assets/public in 56.37ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 3.20ms
✔ copy android in 419.27ms
✔ Updating Android plugins in 106.99ms
[info] Found 6 Capacitor plugins for android:
       @capacitor/app@7.1.0
       @capacitor/browser@7.0.2
       @capacitor/camera@7.0.2
       @capacitor/geolocation@7.1.5
       @capacitor/push-notifications@7.0.3
       @capacitor/share@7.0.2
✔ update android in 600.96ms
[info] Sync finished in 1.474s
```

**Success:** Android project is now ready to build! ✅

---

## 🛠️ **Step 5: Build Android APK**

### **Option A: Android Studio (Recommended for Beginners)**

#### **Open Project:**
```bash
npx cap open android
```

This launches Android Studio with the Android project.

#### **Wait for Gradle Sync:**
- Android Studio will sync Gradle dependencies
- Look for "Gradle sync finished" in status bar
- First time: 5-10 minutes
- Subsequent times: 30 seconds

#### **Build Debug APK:**
1. **Menu:** Build → Build Bundle(s) / APK(s) → **Build APK(s)**
2. **Wait** for build to complete (1-3 minutes)
3. **Notification** appears: "APK(s) generated successfully"
4. **Click** "locate" in notification

**APK Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Success:** You have an installable APK! ✅

---

### **Option B: Command Line (Advanced)**

#### **Build from terminal:**

```bash
# Navigate to android folder
cd android

# Build debug APK
./gradlew assembleDebug

# On Windows:
gradlew.bat assembleDebug
```

**Build process:**
- Downloads Gradle dependencies (first time: 5 minutes)
- Compiles Java/Kotlin code
- Packages resources
- Creates APK
- Takes 1-3 minutes

**Expected output:**
```
> Task :app:assembleDebug
BUILD SUCCESSFUL in 2m 15s
```

**APK Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Check APK size:**
```bash
ls -lh android/app/build/outputs/apk/debug/app-debug.apk
# Should be ~12-18 MB
```

---

## 📱 **Step 6: Install APK on Android Device**

### **Method 1: USB Transfer (Easiest)**

1. **Connect phone via USB**
2. **Enable File Transfer mode** on phone
3. **Copy APK** to phone's Download folder:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
4. **On phone:**
   - Open Files app
   - Navigate to Downloads
   - Tap `app-debug.apk`
5. **Allow installation from unknown sources** (if prompted)
6. **Tap "Install"**
7. **Open** Alga app

**Success:** App installed and running! ✅

---

### **Method 2: ADB Install (Advanced)**

#### **Check device connected:**
```bash
adb devices
```

**Expected output:**
```
List of devices attached
ABC123XYZ    device
```

#### **Install APK:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**If app already installed:**
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Expected output:**
```
Performing Streamed Install
Success
```

---

### **Method 3: Email/Cloud (Alternative)**

1. **Email APK to yourself**
2. **Open email on phone**
3. **Download APK**
4. **Install** from Downloads folder

---

## 🧪 **Step 7: Test APK on Device**

### **Test Checklist:**

Once installed, test these features:

#### **Launch & Splash Screen:**
- [ ] App launches successfully
- [ ] Splash screen appears
- [ ] No crashes

#### **Mobile Navigation:**
- [ ] Bottom navigation visible
- [ ] All 4 tabs present: Stays, Services, Me, Lemlem
- [ ] Lemlem tab has sparkles icon (✨)
- [ ] Lemlem label says "Lemlem" (not "Help")

#### **Navigation Functionality:**
- [ ] Stays tab works (shows properties)
- [ ] Services tab works (shows marketplace)  
- [ ] Me tab works (shows dashboard)
- [ ] **Lemlem tab works** (shows Ask Lemlem) ⭐

#### **Lemlem Features:**
- [ ] Ask Lemlem page loads
- [ ] Text queries work
- [ ] Voice commands work (click mic)
- [ ] Responses appear correctly

#### **Native Features:**
- [ ] Camera access works (for ID verification)
- [ ] Geolocation works (for property search)
- [ ] Offline mode works (turn off wifi, test Lemlem)
- [ ] App doesn't crash

**Success:** All features work on device! ✅

---

## 🐛 **Troubleshooting**

### **Issue: Gradle sync fails**

**Error:** "SDK location not found"

**Fix:**
```bash
# Set ANDROID_HOME environment variable

# Mac/Linux:
export ANDROID_HOME=$HOME/Library/Android/sdk
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bash_profile

# Windows (CMD):
set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk

# Or create local.properties in android/ folder:
echo "sdk.dir=/path/to/android/sdk" > android/local.properties
```

---

### **Issue: Build fails with "build.gradle" error**

**Error:** "path may not be null or empty string"

**Fix:** This is already fixed in our build.gradle. If you still see it:
```bash
# Ensure keystore.properties doesn't exist
# (Only needed for release builds)
rm android/keystore.properties
```

---

### **Issue: APK too large**

**Current size:** ~15MB (debug)

**To optimize:**
1. Build release APK (optimized):
   ```bash
   cd android && ./gradlew assembleRelease
   ```
   Size: ~8MB

2. Enable ProGuard (in `android/app/build.gradle`):
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
       }
   }
   ```

---

### **Issue: App crashes on launch**

**Check logs:**
```bash
adb logcat | grep "com.alga.app"
```

**Common fixes:**
1. Rebuild web assets: `npm run build`
2. Re-sync: `npx cap sync android`
3. Clean build: `cd android && ./gradlew clean assembleDebug`
4. Check for console errors in web version first

---

### **Issue: Can't install on phone**

**Error:** "App not installed"

**Fix:**
1. Enable "Unknown sources" in phone settings:
   - Settings → Security → Unknown sources → Enable
2. Or enable for Files app specifically (Android 8+)
3. Uninstall old version first (if exists)
4. Ensure enough storage space (need 50MB+)

---

## 🔐 **Building Release APK (For Distribution)**

### **Create Keystore (One-Time Setup):**

```bash
cd android/app

keytool -genkey -v -keystore alga-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias alga-key
```

**Follow prompts:**
- Enter keystore password (save this!)
- Re-enter password
- Enter your details (name, organization, etc.)
- Enter key password (can be same as keystore password)

**⚠️ CRITICAL: Save keystore file and passwords!**
- Store `alga-release-key.jks` securely
- Never commit keystore to Git
- Losing keystore means you can't update app on Play Store

---

### **Configure Signing:**

Create `android/keystore.properties`:
```properties
storeFile=app/alga-release-key.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=alga-key
keyPassword=YOUR_KEY_PASSWORD
```

**Add to .gitignore:**
```bash
echo "keystore.properties" >> android/.gitignore
echo "*.jks" >> android/.gitignore
```

---

### **Build Signed Release APK:**

```bash
cd android
./gradlew assembleRelease
```

**APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

**Size:** ~8MB (optimized)

**This APK is ready for:**
- ✅ Direct download from website
- ✅ Google Play Store submission
- ✅ Distribution to users

---

## 📦 **Build Checklist**

Use this checklist each time you build:

```
Android APK Build Checklist
============================

PREREQUISITES:
[ ] Android Studio installed
[ ] Project downloaded/cloned
[ ] Node.js dependencies installed (npm install)

BUILD PROCESS:
[ ] Web assets built (npm run build)
[ ] Synced to Android (npx cap sync android)
[ ] Version code incremented (if update)
[ ] Version name updated (if update)
[ ] Gradle build successful

DEBUG APK:
[ ] APK built successfully
[ ] APK size reasonable (~15MB)
[ ] APK located at: android/app/build/outputs/apk/debug/app-debug.apk

DEVICE TESTING:
[ ] APK installed on device
[ ] App launches without crash
[ ] Splash screen appears
[ ] Bottom navigation visible
[ ] All 4 tabs work (Stays, Services, Me, Lemlem)
[ ] Lemlem tab has sparkles icon (✨)
[ ] Ask Lemlem features work
[ ] Native features work (camera, location)
[ ] Offline mode works

RELEASE APK (Optional):
[ ] Keystore created and secured
[ ] Signing configured
[ ] Release APK built
[ ] Release APK tested
[ ] Ready for distribution ✅
```

---

## 🎯 **Quick Commands Reference**

### **Complete Build Flow:**
```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK (choose one):

# Option A: Open in Android Studio
npx cap open android
# Then: Build → Build APK(s)

# Option B: Command line
cd android && ./gradlew assembleDebug

# 4. Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

### **Rebuild After Changes:**
```bash
# After changing code:
npm run build && npx cap sync android

# Then rebuild APK:
cd android && ./gradlew assembleDebug
```

---

### **Clean Build (If Issues):**
```bash
# Clean everything
cd android && ./gradlew clean

# Rebuild
./gradlew assembleDebug
```

---

## 📊 **Build Times**

### **First Build:**
- Android Studio download & install: 20 minutes
- Gradle sync & dependencies: 10 minutes
- APK build: 3 minutes
- **Total: ~35 minutes**

### **Subsequent Builds:**
- Web assets: 30 seconds
- Capacitor sync: 5 seconds
- APK build: 1-2 minutes
- **Total: ~3 minutes**

---

## 🎉 **Success!**

If you completed all steps, you now have:

✅ **Working development environment** (Android Studio + SDK)  
✅ **Built Android APK** (app-debug.apk)  
✅ **Tested on device** (all features working)  
✅ **Ready to distribute** (share APK or publish)

---

## 📱 **Next Steps**

### **For Testing:**
- Share APK with testers
- Collect feedback
- Iterate and rebuild

### **For Distribution:**
- Build release APK (signed)
- Upload to Google Play Store
- Or distribute via direct download

### **For Updates:**
1. Make code changes
2. Increment version: `android/app/build.gradle`
   ```gradle
   versionCode 2  // Was 1
   versionName "1.1"  // Was 1.0
   ```
3. Rebuild: `npm run build && npx cap sync android`
4. Build APK: `./gradlew assembleRelease`
5. Distribute to users

---

## 📞 **Need Help?**

### **Resources:**
- **Capacitor Docs**: https://capacitorjs.com/docs/android
- **Android Studio**: https://developer.android.com/studio/intro
- **Complete Guide**: `docs/ANDROID_BUILD_GUIDE.md` (3,100 lines)

### **Common Commands:**
```bash
# Check environment
node --version
adb devices

# Build flow
npm run build
npx cap sync android
npx cap open android

# Troubleshooting
cd android && ./gradlew clean
rm -rf node_modules && npm install
```

---

**🎊 You're ready to build Android APKs!**

**Build Time:** 3 minutes (after setup)  
**APK Size:** ~15MB (debug), ~8MB (release)  
**Features:** All working including Lemlem navigation ✅

**Company**: Alga One Member PLC  
**App ID**: com.alga.app  
**Version**: 1.0 (Update before each release)
