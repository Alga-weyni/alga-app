# Step-by-Step Guide: Build Alga Mobile App for INSA Submission
## For Mac Users (Android + iOS)

---

## ⚠️ PREREQUISITES (Install These First)

Before you start, install these tools on your Mac:

### 1. Install Homebrew (Package Manager)
Open **Terminal** app and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (Version 20+)
```bash
brew install node
```

Verify installation:
```bash
node --version  # Should show: v20.x.x or higher
npm --version   # Should show: 10.x.x or higher
```

### 3. Install Git
```bash
brew install git
```

Verify:
```bash
git --version  # Should show: git version 2.x.x
```

### 4. Install Android Studio
1. Download from: https://developer.android.com/studio
2. Open the downloaded `.dmg` file
3. Drag **Android Studio** to your **Applications** folder
4. Open **Android Studio** (first launch takes 5-10 minutes)
5. Follow the setup wizard:
   - Click "Next" → "Next" → "Finish"
   - Wait for SDK download (this takes 10-20 minutes)

### 5. Install Xcode (For iOS Build)
1. Open **App Store** on your Mac
2. Search for "Xcode"
3. Click **Get** (or **Install**) - This is a LARGE download (12+ GB, takes 30-60 minutes)
4. Once installed, open **Xcode**
5. Accept license agreement
6. Install additional components when prompted

### 6. Install Xcode Command Line Tools
Open Terminal:
```bash
xcode-select --install
```

Click **Install** when the popup appears.

---

## 📂 STEP 1: Get Your Code from Replit

Since your code is on Replit, here's how to download it:

### Option A: Download as ZIP (Easiest)

1. Go to your Replit project: https://replit.com/@your-username/alga-app
2. Click the **☰ menu** (three horizontal lines) in the top-left
3. Click **Download as ZIP**
4. The file will download to your **Downloads** folder
5. **Unzip the file:**
   - Go to **Downloads** folder
   - Double-click `alga-app.zip`
   - You'll get a folder called `alga-app`
6. **Move to Desktop:**
   - Drag the `alga-app` folder to your **Desktop**

### Option B: Clone from GitHub (If You Have GitHub Sync)

If you've synced your Replit to GitHub:

1. Open **Terminal** app on your Mac
2. Navigate to Desktop:
   ```bash
   cd ~/Desktop
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/alga-app.git
   ```
   *(Replace YOUR-USERNAME with your actual GitHub username)*
4. Enter the folder:
   ```bash
   cd alga-app
   ```

---

## 📦 STEP 2: Install Dependencies

1. **Open Terminal**
2. **Navigate to your project:**
   ```bash
   cd ~/Desktop/alga-app
   ```
3. **Install all packages:**
   ```bash
   npm install
   ```
   
   **What to expect:**
   - This takes 5-10 minutes
   - You'll see lots of text scrolling
   - Wait until you see: `added 1500 packages` (or similar)
   - When done, you'll see the terminal prompt again

**If you see errors:**
```bash
# Clear cache and try again
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🤖 STEP 3: Build Android APK

### 3.1 Build the Web Assets

In Terminal (make sure you're in `~/Desktop/alga-app`):
```bash
npm run build
```

**What to expect:**
- Takes 1-2 minutes
- You'll see: `✓ built in 45s` (or similar)
- Creates a `dist` folder with your web files

### 3.2 Sync with Capacitor (Android)

```bash
npx cap sync android
```

**What to expect:**
- Takes 30 seconds
- You'll see: `✔ Copying web assets from dist to android/app/src/main/assets/public`
- You'll see: `✔ Updating Android plugins`

### 3.3 Open Android Studio

```bash
npx cap open android
```

**What to expect:**
- Android Studio will launch (takes 1-2 minutes)
- A popup may appear: "Gradle project sync in progress" - Wait for it to finish
- Wait until you see "BUILD SUCCESSFUL" in the bottom panel

**If Android Studio doesn't open:**
1. Open Android Studio manually (Applications folder)
2. Click **File** → **Open**
3. Navigate to: `Desktop/alga-app/android`
4. Click **Open**

### 3.4 Build the APK (Debug Version)

**In Android Studio:**

1. **Select Build Variant:**
   - Look at the left side panel
   - Click **Build Variants** tab (bottom-left corner)
   - Make sure **debug** is selected

2. **Build APK:**
   - Top menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait 2-5 minutes
   - You'll see: "Build completed successfully" (bottom-right corner)
   - Click **locate** in the notification

3. **Find Your APK:**
   - The APK is at: `Desktop/alga-app/android/app/build/outputs/apk/debug/app-debug.apk`
   - **Rename it to:** `alga-android-debug.apk`

### 3.5 Build the APK (Release Version)

**In Android Studio:**

1. **Select Build Variant:**
   - Click **Build Variants** tab (bottom-left)
   - Change **debug** to **release**

2. **Build APK:**
   - Top menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait 2-5 minutes

3. **Find Your APK:**
   - APK at: `Desktop/alga-app/android/app/build/outputs/apk/release/app-release-unsigned.apk`
   - **Rename it to:** `alga-android-release.apk`

**✅ You now have 2 Android APKs:**
- `alga-android-debug.apk` (~22 MB)
- `alga-android-release.apk` (~20 MB)

---

## 🍎 STEP 4: Build iOS IPA

### 4.1 Sync with Capacitor (iOS)

In Terminal:
```bash
npx cap sync ios
```

**What to expect:**
- Takes 30 seconds
- You'll see: `✔ Copying web assets from dist to ios/App/App/public`

### 4.2 Open Xcode

```bash
npx cap open ios
```

**What to expect:**
- Xcode will launch (takes 1-2 minutes)
- You'll see your project: **App.xcworkspace**

**If Xcode doesn't open:**
1. Open Xcode manually
2. Click **File** → **Open**
3. Navigate to: `Desktop/alga-app/ios/App`
4. Select **App.xcworkspace** (NOT App.xcodeproj)
5. Click **Open**

### 4.3 Configure Signing

**In Xcode:**

1. **Select the App target:**
   - Left panel: Click **App** (blue icon at the top)
   - Center panel: Make sure **App** is selected under TARGETS

2. **Set Team (Signing):**
   - Click **Signing & Capabilities** tab (top center)
   - Under **Team:** Click the dropdown
   - Select **Add an Account...** (if you haven't signed in)
   - Sign in with your Apple ID
   - After signing in, select your name from the Team dropdown

3. **Change Bundle Identifier:**
   - Under **Bundle Identifier:** Change from `et.alga.app` to something unique like:
     ```
     et.alga.app.yourname
     ```
   - Example: `et.alga.app.weyni`

**If you see "Signing for App requires a development team":**
- This is normal
- Just select your Apple ID from the Team dropdown

### 4.4 Build the IPA (Archive)

**In Xcode:**

1. **Select Device:**
   - Top bar: Click where it says "Any iOS Device (arm64)"
   - Select **Any iOS Device** (if not already selected)

2. **Archive the App:**
   - Top menu: **Product** → **Archive**
   - **Wait 5-10 minutes** (Xcode is compiling)
   - When done, the Organizer window opens

3. **Export the IPA:**
   - In Organizer window: Select your archive (should be at the top)
   - Click **Distribute App** button (right side)
   - Select **Development** → Click **Next**
   - Select **App Thinning: None** → Click **Next**
   - Check **Rebuild from Bitcode** → Click **Next**
   - Select **Automatically manage signing** → Click **Next**
   - Click **Export** → Choose location: **Desktop** → Click **Export**

4. **Find Your IPA:**
   - On your Desktop, you'll see a folder called **App**
   - Inside: `App.ipa`
   - **Rename it to:** `alga-ios-release.ipa`

**✅ You now have the iOS IPA:**
- `alga-ios-release.ipa` (~25 MB)

---

## 📋 STEP 5: Verify Your Builds

You should now have these files:

```
Desktop/
├── alga-android-debug.apk      (22 MB)
├── alga-android-release.apk    (20 MB)
└── alga-ios-release.ipa        (25 MB)
```

### Test the APK on Android Device (Optional)

1. **Connect Android phone to Mac** (USB cable)
2. **Enable USB Debugging on phone:**
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - Go back → **Developer Options** → Enable **USB Debugging**
3. **Install APK:**
   ```bash
   cd ~/Desktop
   adb install alga-android-debug.apk
   ```
4. **Open the app** on your phone and test login

### Test the IPA on iPhone (Optional, Requires Paid Apple Developer Account)

If you don't have a paid developer account ($99/year), **skip this**. INSA doesn't need you to test on a real iPhone—the IPA file is enough.

---

## 💿 STEP 6: Prepare for INSA Submission

### 6.1 Create a Folder with All Files

1. Create a new folder on Desktop: **INSA_Alga_Submission**
2. Copy these files into it:
   ```
   INSA_Alga_Submission/
   ├── alga-android-debug.apk
   ├── alga-android-release.apk
   ├── alga-ios-release.ipa
   ├── INSA_MOBILE_SUBMISSION_SHORT.pdf (convert from .md)
   └── Test_Accounts.txt (from test access guide)
   ```

### 6.2 Burn to CD/DVD

**Option A: Use Mac Built-in Disc Burner**

1. Insert blank CD/DVD into your Mac
2. Mac will ask: "Choose an action" → Select **Open Finder**
3. Name the disc: **ALGA_INSA_2025**
4. Drag all files from **INSA_Alga_Submission** folder to the CD window
5. Click **Burn** (top-right corner)
6. Wait 5-10 minutes
7. Eject disc

**Option B: Use External USB Drive (If No CD/DVD Drive)**

1. Insert USB drive (minimum 1 GB)
2. Copy **INSA_Alga_Submission** folder to USB
3. Eject USB safely

---

## 🚀 STEP 7: Submit to INSA

### Physical Delivery

Deliver the CD/DVD (or USB) to:
```
Information Network Security Administration (INSA)
Cyber Security Audit Division
Wollo Sefer, Addis Ababa, Ethiopia

Attention: Dr. Tilahun Ejigu (Ph.D.)
Mobile: +251 937 456 374
Email: tilahune@insa.gov.et
```

### Email Notification

After delivering physically, send this email:

```
To: tilahune@insa.gov.et
CC: Winnieaman94@gmail.com
Subject: ALGA Mobile App Security Audit Submission - TIN 0101809194

Dear Dr. Tilahun,

I have delivered the ALGA mobile application security audit materials 
to your office today.

Included on CD/DVD:
✅ Android APK (debug + release builds)
✅ iOS IPA (release build)
✅ INSA submission document (PDF)
✅ Test account credentials

Company: Alga One Member PLC
TIN: 0101809194

Please confirm receipt. I am available for any technical questions.

Best regards,
Weyni Abraha
Founder & CEO
+251 996 034 044
Winnieaman94@gmail.com
```

---

## 🆘 TROUBLESHOOTING

### Problem: "npm install" fails

**Solution:**
```bash
# Update Node.js to latest version
brew upgrade node

# Clear npm cache
npm cache clean --force

# Try again
npm install
```

---

### Problem: Android Studio shows "Gradle sync failed"

**Solution:**
1. Wait 5 minutes (Gradle downloads files in background)
2. If still failing:
   - Click **File** → **Invalidate Caches** → **Invalidate and Restart**
3. If still failing:
   - Delete `android/.gradle` folder
   - Restart Android Studio

---

### Problem: Xcode shows "Signing for App requires a development team"

**Solution:**
1. Click the dropdown under **Team**
2. Select **Add an Account...**
3. Sign in with your Apple ID (free account works)
4. Select your name from Team dropdown

---

### Problem: "Command not found: npx"

**Solution:**
```bash
# Reinstall Node.js
brew reinstall node

# Verify installation
which npx  # Should show: /opt/homebrew/bin/npx (or similar)
```

---

### Problem: APK build fails with "SDK not found"

**Solution:**
1. Open Android Studio
2. Top menu: **Android Studio** → **Preferences**
3. Search for "SDK"
4. Click **Android SDK**
5. Make sure these are checked:
   - Android 13.0 (API 33)
   - Android SDK Build-Tools 33.0.0
6. Click **Apply** → Wait for download
7. Click **OK**
8. Try building again

---

### Problem: IPA export fails with "No signing certificate"

**Solution:**
1. In Xcode: **Xcode** → **Preferences** → **Accounts**
2. Make sure your Apple ID is listed
3. Click **Manage Certificates...**
4. Click the **+** button → **Apple Development**
5. Close and try exporting again

**OR** (if above doesn't work):
1. During export, select **Development** (not Distribution)
2. This works with free Apple ID

---

## 📞 NEED HELP?

**Contact Weyni:**
- Email: Winnieaman94@gmail.com
- Phone: +251 996 034 044
- Available: Mon-Fri, 9:00 AM - 5:00 PM Ethiopian Time

**Common Questions:**

**Q: Do I need a paid Apple Developer account ($99/year)?**  
A: No! A free Apple ID is enough to build the IPA for INSA submission.

**Q: Can I use Windows instead of Mac?**  
A: You can build Android APK on Windows, but **iOS IPA requires Mac + Xcode**.

**Q: How long does the entire process take?**  
A: 
- Prerequisites installation: 1-2 hours (one-time)
- Building APKs: 15-30 minutes
- Building IPA: 15-30 minutes
- **Total: ~2-3 hours** (first time)

**Q: What if I don't have a CD/DVD burner?**  
A: Use a USB drive instead. INSA will accept USB delivery.

**Q: Do I need to test on a real phone?**  
A: No, not required for INSA submission. They will test on their devices.

---

## ✅ FINAL CHECKLIST

Before submitting to INSA, verify:

- [ ] Node.js installed (`node --version` shows v20+)
- [ ] Android Studio installed and opened successfully
- [ ] Xcode installed (Mac only)
- [ ] `npm install` completed without errors
- [ ] `npm run build` succeeded
- [ ] Android debug APK built (~22 MB)
- [ ] Android release APK built (~20 MB)
- [ ] iOS IPA built (~25 MB) - Mac only
- [ ] All files copied to **INSA_Alga_Submission** folder
- [ ] CD/DVD burned (or USB prepared)
- [ ] Test accounts document included
- [ ] INSA submission PDF included
- [ ] Email notification sent to Dr. Tilahun

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2025  
**For:** INSA Mobile App Security Audit Submission  
**Platform:** Mac (Android Studio + Xcode)
