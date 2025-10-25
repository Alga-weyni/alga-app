# Alga Mobile App Setup Guide

## 🎯 Overview

Alga now supports **three deployment modes**:

1. **PWA (Progressive Web App)** - Live NOW! ✅
   - Installable on any device via browser
   - Works offline with smart caching
   - $0 cost, instant updates
   - Perfect for Ethiopian mobile networks

2. **Android Native App** - Use this guide 📱
   - Google Play Store distribution
   - Full native features (GPS, camera, push notifications)
   - Better performance on Android devices

3. **iOS Native App** - Use this guide 🍎
   - Apple App Store distribution
   - Native iOS features and UI
   - Required for iPhone/iPad users

---

## 📋 Prerequisites

### For Android Development
- **Java Development Kit (JDK) 17+**
  ```bash
  # Check if installed
  java -version
  
  # Ubuntu/Linux
  sudo apt install openjdk-17-jdk
  
  # macOS
  brew install openjdk@17
  ```

- **Android Studio**
  - Download: https://developer.android.com/studio
  - Install Android SDK (API 33+)
  - Create Android Virtual Device (AVD) for testing

- **Gradle** (included with Android Studio)

### For iOS Development (macOS Only)
- **macOS computer** (required by Apple)
- **Xcode 14+**
  - Download from Mac App Store
  - Install Command Line Tools:
    ```bash
    xcode-select --install
    ```

- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```

- **Apple Developer Account**
  - Free tier: Test on your own devices
  - $99/year: Publish to App Store

---

## 🚀 Quick Start

### 1. Build Your Web App
```bash
npm run build
```

This creates production files in `dist/public/` that Capacitor will bundle into native apps.

### 2. Sync Web Assets to Native Projects
```bash
npx cap sync
```

This copies your built web app into both Android and iOS projects.

### 3. Open in Native IDE

**For Android:**
```bash
npx cap open android
```
This opens Android Studio with your Alga project.

**For iOS:**
```bash
npx cap open ios
```
This opens Xcode with your Alga project.

---

## 📱 Android Development

### Build & Run on Emulator

1. **Open Android Studio**
   ```bash
   npx cap open android
   ```

2. **Create Virtual Device** (if not exists)
   - Tools → Device Manager → Create Device
   - Choose: Pixel 6 Pro (or any device with API 33+)

3. **Run App**
   - Click green "Play" button
   - Select your emulator
   - Wait for app to launch

### Build APK for Testing

**Debug APK (for sharing with testers):**
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (for distribution):**
```bash
cd android
./gradlew assembleRelease
```

### Build AAB for Google Play Store

```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

Upload this `.aab` file to Google Play Console.

### Code Signing (Required for Release)

1. **Generate Keystore**
   ```bash
   keytool -genkey -v -keystore alga-release.keystore \
     -alias alga -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Create `android/key.properties`**
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=alga
   storeFile=/path/to/alga-release.keystore
   ```

3. **Update `android/app/build.gradle`**
   ```gradle
   def keystorePropertiesFile = rootProject.file("key.properties")
   def keystoreProperties = new Properties()
   keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

   android {
       signingConfigs {
           release {
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile file(keystoreProperties['storeFile'])
               storePassword keystoreProperties['storePassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

---

## 🍎 iOS Development

### Build & Run on Simulator

1. **Install Pod Dependencies**
   ```bash
   cd ios/App
   pod install
   ```

2. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

3. **Select Simulator**
   - Top bar: Choose "iPhone 14 Pro" (or any simulator)

4. **Run**
   - Click "Play" button (▶️)
   - Wait for simulator to boot and app to launch

### Build for Testing on Real Device

1. **Connect iPhone via USB**

2. **Trust Computer** (on iPhone)

3. **Select Device in Xcode**
   - Top bar: Choose your iPhone

4. **Configure Signing**
   - Select "App" target
   - Signing & Capabilities tab
   - Team: Select your Apple ID
   - Bundle Identifier: `com.alga.app`

5. **Run on Device**
   - Click "Play" button
   - First time: "Untrusted Developer" error on iPhone
   - iPhone Settings → General → VPN & Device Management → Trust developer

### Build for App Store

1. **Archive Build**
   - Xcode menu: Product → Archive
   - Wait for build to complete

2. **Distribute App**
   - Organizer window opens automatically
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow prompts

3. **Upload to App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Create app listing
   - Upload screenshots, description
   - Submit for review

---

## 🔌 Native Features (Already Configured!)

All these features are pre-installed and ready to use:

### 1. **Geolocation** (GPS)
```typescript
import { Geolocation } from '@capacitor/geolocation';

// Get current position
const position = await Geolocation.getCurrentPosition();
console.log('Lat:', position.coords.latitude);
console.log('Lng:', position.coords.longitude);

// Watch position changes
const watchId = await Geolocation.watchPosition({}, (position) => {
  console.log('New position:', position);
});
```

**Use Cases:**
- Property search near user
- Meal delivery location
- Distance calculations

### 2. **Camera** (ID Verification)
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

// Take photo
const image = await Camera.getPhoto({
  quality: 90,
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera,
});

console.log('Image URI:', image.webPath);
```

**Use Cases:**
- Ethiopian ID verification
- Property photos upload
- Host profile pictures

### 3. **Push Notifications**
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Request permission
await PushNotifications.requestPermissions();

// Register for notifications
await PushNotifications.register();

// Listen for registration token
PushNotifications.addListener('registration', (token) => {
  console.log('Push token:', token.value);
  // Send this token to your backend
});

// Handle incoming notifications
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Notification:', notification);
});
```

**Use Cases:**
- Booking confirmations
- Host messages
- Payment confirmations
- Meal delivery updates

### 4. **Share** (Viral Marketing)
```typescript
import { Share } from '@capacitor/share';

// Share property
await Share.share({
  title: 'Amazing Property in Addis Ababa',
  text: 'Check out this beautiful apartment!',
  url: 'https://alga.app/property/123',
  dialogTitle: 'Share with friends',
});
```

**Use Cases:**
- Share properties with friends
- Refer hosts
- Share bookings

### 5. **Browser** (External Links)
```typescript
import { Browser } from '@capacitor/browser';

// Open URL in in-app browser
await Browser.open({ url: 'https://chapa.co' });

// Close browser
await Browser.close();
```

**Use Cases:**
- Payment processors (Chapa, Telebirr)
- Terms & conditions
- External resources

---

## 🌐 Live Reload During Development

Test changes instantly without rebuilding!

### Android
```bash
# Get your computer's local IP
ipconfig getifaddr en0  # macOS
hostname -I | awk '{print $1}'  # Linux
ipconfig  # Windows

# Update capacitor.config.ts
server: {
  url: 'http://192.168.1.100:5000',  # Your IP
  cleartext: true
}

# Sync and run
npx cap sync android
npx cap run android -l
```

### iOS
```bash
# Update capacitor.config.ts
server: {
  url: 'http://YOUR_IP:5000',
  cleartext: true
}

# Sync and run
npx cap sync ios
npx cap run ios -l
```

**Remember:** Remove `server` config before production builds!

---

## 🚢 Deployment Checklist

### Before Publishing

- [ ] Remove development server config from `capacitor.config.ts`
- [ ] Update app version in `package.json`
- [ ] Test on real Android device
- [ ] Test on real iPhone
- [ ] Update screenshots for stores
- [ ] Prepare app description (Amharic + English)
- [ ] Set up privacy policy URL
- [ ] Configure app permissions (location, camera, notifications)

### Google Play Store

- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Generate signed AAB file
- [ ] Upload to Play Console
- [ ] Fill store listing:
  - Title: "Alga - Ethiopian Property Rentals"
  - Short description (80 chars)
  - Full description (4000 chars)
  - Screenshots (8 required)
  - Feature graphic (1024x500)
  - App icon (512x512)
- [ ] Set up pricing (Free)
- [ ] Select countries (Ethiopia + international)
- [ ] Submit for review (1-3 days)

### Apple App Store

- [ ] Create Apple Developer account ($99/year)
- [ ] Create App Store Connect app
- [ ] Generate app signing certificate
- [ ] Archive and upload build
- [ ] Fill App Store listing:
  - Name: "Alga"
  - Subtitle: "Ethiopian Property Rentals"
  - Description (4000 chars)
  - Keywords (100 chars): "ethiopia,rent,property,hotel,airbnb,booking"
  - Screenshots (6.5", 5.5" iPhones + iPad)
  - App icon (1024x1024)
- [ ] Set up pricing (Free)
- [ ] Select availability (Ethiopia + global)
- [ ] Submit for review (1-7 days)

---

## 🐛 Troubleshooting

### Android Build Fails

**Error: SDK not found**
```bash
# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk  # Linux
```

**Error: Gradle version mismatch**
```bash
cd android
./gradlew wrapper --gradle-version 8.0
```

### iOS Build Fails

**Error: Pod install failed**
```bash
cd ios/App
pod repo update
pod install --repo-update
```

**Error: Code signing**
- Xcode → Preferences → Accounts → Add Apple ID
- Select target → Signing & Capabilities → Select Team

### App Crashes on Launch

1. Check `capacitor.config.ts` - remove `server.url` for production
2. Clear app data and reinstall
3. Check Android Studio Logcat / Xcode Console for errors

---

## 📊 App Store Optimization (ASO)

### Title Optimization
- **English**: "Alga - Ethiopian Property Rentals"
- **Amharic**: "አልጋ - የኢትዮጵያ ንብረት ኪራይ"

### Keywords (Ethiopian Focus)
```
ethiopia,ethiopian,addis ababa,gondar,bahir dar,
property,rent,rental,apartment,hotel,lodge,
booking,stay,accommodation,travel,vacation,
airbnb,vrbo,homestay,guesthouse
```

### Screenshots Text Overlays
1. "Find Your Perfect Stay in Ethiopia"
2. "Book Safely with Alga Pay"
3. "Support Local Ethiopian Hosts"
4. "24/7 Help with Lemlem AI"
5. "Available in Amharic & English"

---

## 💡 Best Practices

### Update Workflow
```bash
# 1. Make code changes
# 2. Build web app
npm run build

# 3. Sync to native projects
npx cap sync

# 4. Test on device
npx cap run android -l  # Android
npx cap run ios -l      # iOS

# 5. Build release
cd android && ./gradlew bundleRelease  # Android
# Or use Xcode for iOS
```

### Version Management
Keep versions in sync:
- `package.json` version: `1.0.0`
- `android/app/build.gradle` versionName: `1.0.0`
- `android/app/build.gradle` versionCode: `1` (increment each release)
- `ios/App/App.xcodeproj` Version: `1.0.0`
- `ios/App/App.xcodeproj` Build: `1` (increment each release)

### Testing Checklist
- [ ] PWA works in browser
- [ ] Android app installs and launches
- [ ] iOS app installs and launches
- [ ] Offline mode works
- [ ] Geolocation permissions granted
- [ ] Camera permissions granted
- [ ] Push notifications registered
- [ ] Deep links work
- [ ] Share functionality works

---

## 🎯 Next Steps

1. **Test PWA First** - Make sure web app works perfectly
2. **Set up Android** - Easier to develop and test
3. **Test on Android Device** - Real-world performance
4. **Set up iOS** - Requires macOS
5. **Submit to Stores** - Follow deployment checklist
6. **Monitor Reviews** - Respond to user feedback
7. **Iterate** - Push updates based on analytics

---

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## ✅ Summary

**You now have:**
- ✅ PWA (working now!)
- ✅ Android native project (ready to build)
- ✅ iOS native project (ready to build)
- ✅ 6 native plugins configured
- ✅ Ethiopian-optimized caching
- ✅ Complete deployment workflow

**Cost breakdown:**
- PWA: **$0** ✅
- Google Play Developer: **$25 one-time**
- Apple Developer: **$99/year**

Start with the PWA (it's live!), then add native apps when you need app store distribution! 🚀
