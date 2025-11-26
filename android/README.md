# Alga Android Build Instructions

## Prerequisites

1. **Java Development Kit (JDK) 21**
   - Download from: https://adoptium.net/temurin/releases/?version=21
   - Set `JAVA_HOME` environment variable to JDK installation path

2. **Android Studio** (recommended) or Android SDK Command Line Tools
   - Download from: https://developer.android.com/studio

3. **Environment Variables** (set in your shell profile):
   ```bash
   export JAVA_HOME=/path/to/jdk-21
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Setup Steps

### 1. Clone and Setup

```bash
# Clone the repository (avoid folder names with spaces!)
git clone <repository-url> alga-app
cd alga-app

# Install dependencies
npm install

# Build the frontend
npm run build

# Sync Capacitor with Android
npx cap sync android
```

### 2. Configure local.properties

Create or update `android/local.properties` with your SDK path:

**macOS:**
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Windows:**
```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

**Linux:**
```properties
sdk.dir=/home/YOUR_USERNAME/Android/Sdk
```

### 3. Build APK

**Debug APK:**
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (signed):**
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### "cordova.variables.gradle does not exist"

Run Capacitor sync:
```bash
npx cap sync android
```

### Path contains spaces

Avoid folder paths with spaces (e.g., "alga-app-main 4"). Move the project to a path without spaces:
```bash
mv "alga-app-main 4" alga-app
```

### Gradle wrapper not executable

```bash
chmod +x android/gradlew
```

### Clear Gradle cache

```bash
cd android
./gradlew clean
rm -rf ~/.gradle/caches
```

## Build Variants

- **debug**: Development build with debugging enabled
- **release**: Production build, signed and optimized

## App Signing

The release build uses the keystore at `android/alga-release-key.jks`.
For security, signing credentials are managed via environment variables in CI/CD.
