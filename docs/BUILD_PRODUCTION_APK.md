# Building Production APK/AAB for Google Play Store

**Last Updated:** October 25, 2025

---

## 📦 What You Need to Build

Google Play Store requires **Android App Bundle (AAB)** format for new app submissions (not APK).

**File Types:**
- **AAB (Required):** For Google Play Store upload
- **APK (Optional):** For testing or direct distribution

---

## 🔑 Step 1: Generate Upload Keystore (One-Time Setup)

You need a keystore to sign your app. **NEVER LOSE THIS FILE** - you can't update your app without it!

```bash
# Navigate to android folder
cd android/app

# Generate keystore (replace with your info)
keytool -genkey -v -keystore alga-upload-key.keystore \
  -alias alga-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (save this securely!)
# - Key password (can be same as keystore password)
# - Your name, organization, location (use real info)
```

**Important:**
- Save the keystore password in a password manager
- Backup `alga-upload-key.keystore` to secure cloud storage
- Never commit keystore to git (already in .gitignore)

---

## 🔧 Step 2: Configure Gradle Signing

Edit `android/app/build.gradle` to add release signing configuration:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            storeFile file('alga-upload-key.keystore')
            storePassword System.getenv("ALGA_KEYSTORE_PASSWORD") ?: 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'alga-key-alias'
            keyPassword System.getenv("ALGA_KEY_PASSWORD") ?: 'YOUR_KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Security Tip:**
For production builds, use environment variables instead of hardcoding passwords:

```bash
export ALGA_KEYSTORE_PASSWORD="your-keystore-password"
export ALGA_KEY_PASSWORD="your-key-password"
```

---

## 📱 Step 3: Update Version Number

Before each build, increment version in `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.alga.app"
    minSdkVersion 23
    targetSdkVersion 34
    versionCode 1          // Increment this for each release (1, 2, 3...)
    versionName "1.0.0"    // User-facing version (1.0.0, 1.0.1, 1.1.0...)
}
```

**Version Rules:**
- **versionCode:** Must increase with each upload (Google Play requirement)
- **versionName:** Semantic versioning for users (MAJOR.MINOR.PATCH)

---

## 🏗️ Step 4: Build Release AAB

### Option A: Build AAB (For Google Play Store)

```bash
# Navigate to android folder
cd android

# Clean previous builds
./gradlew clean

# Build signed AAB
./gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Option B: Build APK (For Testing)

```bash
# Navigate to android folder
cd android

# Build signed APK
./gradlew assembleRelease

# Output location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## ✅ Step 5: Verify Build

### Check AAB was signed correctly:

```bash
# Install bundletool (one-time setup)
# Download from: https://github.com/google/bundletool/releases
# Or use npm:
npm install -g bundletool

# Verify AAB signature
jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab

# Should output: "jar verified."
```

### Test AAB locally before uploading:

```bash
# Generate APKs from AAB for testing
bundletool build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=alga-test.apks \
  --ks=app/alga-upload-key.keystore \
  --ks-pass=pass:YOUR_KEYSTORE_PASSWORD \
  --ks-key-alias=alga-key-alias \
  --key-pass=pass:YOUR_KEY_PASSWORD

# Install on connected device
bundletool install-apks --apks=alga-test.apks
```

---

## 📤 Step 6: Upload to Google Play Console

1. Go to https://play.google.com/console
2. Select your app
3. Go to "Release" → "Production"
4. Click "Create new release"
5. Upload `app-release.aab`
6. Add release notes (see example below)
7. Click "Review release"
8. Click "Start rollout to Production"

**Example Release Notes:**
```
🎉 Introducing Alga v1.0!

✨ NEW FEATURES:
• Browse authentic Ethiopian stays across 8+ cities
• Book safely with verified hosts
• Pay securely with Alga Pay
• Chat with Lemlem, your 24/7 multilingual AI assistant
• Works offline with low bandwidth
• Available in English, Amharic, Tigrinya, Afaan Oromoo, and Chinese

🛡️ SECURITY:
• ID verification for all hosts
• Encrypted payment processing
• 6-digit access codes for keyless entry

Welcome to Ethiopian hospitality! 🇪🇹

Questions? Ask Lemlem in the app or visit our Help Center.
```

---

## 🔍 Troubleshooting

### Error: "Keystore was tampered with, or password was incorrect"
**Solution:** Check your keystore password is correct

### Error: "Execution failed for task ':app:bundleRelease'"
**Solution:** Run `./gradlew clean` first, then rebuild

### Error: "versionCode must be greater than previous"
**Solution:** Increment `versionCode` in `build.gradle`

### Error: "Failed to install APK: Signatures do not match"
**Solution:** Uninstall existing app first, then reinstall

### Build takes too long
**Solution:** Add to `gradle.properties`:
```
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

---

## 📊 Build Optimization

### Reduce APK/AAB Size

1. **Enable R8 shrinking** (already configured in release build)
2. **Remove unused resources:**
   ```gradle
   buildTypes {
       release {
           shrinkResources true
           minifyEnabled true
       }
   }
   ```

3. **Split APKs by ABI** (optional - for advanced users):
   ```gradle
   splits {
       abi {
           enable true
           reset()
           include 'armeabi-v7a', 'arm64-v8a'
           universalApk false
       }
   }
   ```

### Current Build Size Estimate:
- **AAB:** ~15-25 MB
- **Installed APK:** ~30-40 MB

---

## 🔐 Security Checklist

Before uploading to Play Store:

- [ ] Keystore password saved securely
- [ ] Keystore file backed up to cloud storage
- [ ] Keystore never committed to git
- [ ] ProGuard enabled for code obfuscation
- [ ] No hardcoded API keys in code
- [ ] Debug logs removed
- [ ] HTTPS enforced for all API calls
- [ ] Certificate pinning configured (optional)

---

## 📅 Release Schedule Recommendations

**Patch Releases (1.0.1, 1.0.2):**
- Bug fixes
- Security patches
- Release: As needed (within 48 hours for critical bugs)

**Minor Releases (1.1.0, 1.2.0):**
- New features
- UI improvements
- Performance enhancements
- Release: Every 4-6 weeks

**Major Releases (2.0.0, 3.0.0):**
- Major feature overhauls
- Breaking changes
- Complete redesigns
- Release: Every 6-12 months

---

## 🎯 Quick Command Reference

```bash
# Clean build
cd android && ./gradlew clean

# Build AAB for Play Store
./gradlew bundleRelease

# Build APK for testing
./gradlew assembleRelease

# Verify signature
jarsigner -verify -verbose app/build/outputs/bundle/release/app-release.aab

# Check build size
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

## 📞 Need Help?

- **Gradle Build Issues:** https://developer.android.com/build/builds-overview
- **Signing Issues:** https://developer.android.com/studio/publish/app-signing
- **Play Store Upload:** https://support.google.com/googleplay/android-developer

---

**Happy Building! 🚀**
