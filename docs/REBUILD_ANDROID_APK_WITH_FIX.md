# Rebuild Android APK with Backend Connection Fix

**Issue Fixed:** Mobile app now connects to production backend instead of localhost

**Date:** November 11, 2025

---

## 🔧 What Was Fixed

**Problem:** The mobile APK was trying to connect to `localhost` which doesn't exist on phones, causing login/registration to fail.

**Solution:** Added automatic API URL configuration:
- **On Mobile:** Uses full production URL (`https://...replit.dev`)
- **On Web:** Uses relative URLs (works as before)

**Files Changed:**
1. `client/src/lib/api-config.ts` (NEW) - Detects mobile platform and returns correct API URL
2. `client/src/lib/queryClient.ts` (UPDATED) - Uses new API config
3. `vite.config.ts` (UPDATED) - Fixed PWA build issue

---

## 📱 REBUILD YOUR APK (Local Machine)

### Step 1: Download Updated Code from Replit

**Option A: Download ZIP**
1. Go to your Replit project
2. Click **☰ menu** → **Download as ZIP**
3. Extract to `~/Projects/alga-app` (replace existing files)

**Option B: Git Pull (If using GitHub sync)**
```bash
cd ~/Projects/alga-app
git pull origin main
```

### Step 2: Install Dependencies & Rebuild

```bash
cd ~/Projects/alga-app

# Install any new dependencies
npm install

# Build frontend with new API configuration
npm run build

# Sync Capacitor (updates Android project with new build)
npx cap sync
```

### Step 3: Build New APK

**For Debug APK (Quick Testing):**
```bash
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**For Release APK (Production-Ready):**
```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Install & Test on Phone

1. **Transfer new APK** to your Android phone (Google Drive, USB, email)
2. **Uninstall old version** first:
   - Settings → Apps → Alga → Uninstall
3. **Install new APK**:
   - Open APK file on phone
   - Allow "Install from Unknown Sources" if prompted
   - Tap "Install"

### Step 5: Test Login/Registration

1. Open Alga app
2. Try **passwordless login** with email:
   - Email: `test-guest@alga.et`
   - It will send OTP request to backend
   - Enter OTP: `1234` (test account)
3. Should successfully log in! ✅

If login still fails, check:
- Phone has internet connection
- Replit backend is running
- No firewall blocking connection

---

## 🔍 How to Verify It's Working

### Check Backend Logs on Replit

When you log in from the mobile app, you should see in Replit console:

```
[express] POST /api/auth/request-otp/email/login 200
[PASSWORDLESS AUTH] Login OTP for test-guest@alga.et: 1234
[express] POST /api/auth/verify-otp 200
```

This confirms the mobile app is successfully connecting to the backend!

---

## 📊 Build Size Estimate

After this fix:
- **Debug APK:** ~25-30 MB (with debugging symbols)
- **Release APK:** ~12-15 MB (optimized)

---

## 🚨 Troubleshooting

### "Build failed: module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### "App installs but crashes on launch"
Check Android logs:
```bash
# Connect phone via USB
adb logcat | grep -i alga
```

### "Login works on web but not on mobile"
1. Check Replit backend is running (not sleeping)
2. Check phone has internet connection
3. Check backend CORS allows all origins in development

---

## 🎯 Next Steps After Testing

Once login/registration works on mobile:

1. **Test all features:**
   - Property browsing
   - Booking creation
   - Payment flow
   - Camera/location permissions
   - Offline functionality

2. **Build signed release APK** for distribution:
   - Generate keystore (see `docs/BUILD_PRODUCTION_APK.md`)
   - Build signed APK: `./gradlew assembleRelease`

3. **Prepare for Google Play Store:**
   - Build AAB instead: `./gradlew bundleRelease`
   - Create Play Console account ($25 one-time)
   - Upload AAB and submit for review

---

## 📞 Need Help?

If you encounter issues:
1. Share error messages from Replit console
2. Share Android logcat output
3. Describe exact steps that fail

---

**Happy Testing! 🚀**
