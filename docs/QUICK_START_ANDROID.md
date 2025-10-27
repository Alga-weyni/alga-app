# 🚀 Quick Start: Build Android APK

**For the full detailed guide, see:** `BUILD_ANDROID_APK.md`

---

## ⚡ Super Quick Version (5 Steps)

### 1. Build Web App (On Replit)
```bash
npm run build
```

### 2. Sync to Android (On Replit)
```bash
npx cap sync android
```

### 3. Download Project
- Click ⋮ menu in Replit
- Download as zip
- Extract on your computer

### 4. Open in Android Studio (On Your Computer)
- Install Android Studio from https://developer.android.com/studio
- Open the `android/` folder
- Wait for Gradle sync

### 5. Build APK
**For testing:**
```bash
./gradlew assembleDebug
```

**For release:**
```bash
./gradlew assembleRelease
```

**APK location:** `android/app/build/outputs/apk/`

---

## 📱 Ethiopian Optimization Tips

✅ **Keep APK < 25MB** (data costs!)
✅ **Test on budget devices** (Samsung A series)
✅ **Work offline** (PWA features)
✅ **Support Android 7.0+** (older phones)

---

## 🏪 Distribution Options

**Option 1:** Google Play Store ($25 one-time fee)
**Option 2:** Direct APK download (free)
**Option 3:** Alternative stores (Aptoide, APKPure)

---

**See full guide for:** signing, optimization, troubleshooting, Play Store publishing

**File:** `docs/BUILD_ANDROID_APK.md`
