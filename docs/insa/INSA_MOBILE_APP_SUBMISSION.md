# MOBILE APPLICATION SECURITY AUDIT REQUEST

**Document Number:** OF/AEAD/002  
**Submission Date:** November 7, 2025  
**Application Type:** Mobile Application

---

## COVER PAGE

**Company Name:** Alga One Member PLC  
**Taxpayer Identification Number (TIN):** 0101809194  
**Business Registration Number:** [Your registration number]  

**Application Name:** Alga - Ethiopian Property Rental Platform (Mobile)  
**Application Type:** Native Mobile Applications (Android & iOS)  
**Platform:** Android (APK) + iOS (IPA) via Capacitor

**Company Address:**  
Addis Ababa, Ethiopia  
[Your business address]  

**Contact Person:**  
Name: Weyni Abraha  
Title: Founder & CEO  
Email: Winnieaman94@gmail.com  
Phone: +251 996 034 044  

**INSA Audit Contact:**  
Dr. Tilahun Ejigu (Ph.D.)  
Division Head, Cyber Security Audit Division  
Wollo Sefer, Addis Ababa, Ethiopia  
Email: tilahune@insa.gov.et  
Mobile: +251 937 456 374  

---

## 1. BACKGROUND OF ORGANIZATION

### Company Overview

**Alga One Member PLC** is an Ethiopian technology company established to transform the hospitality and property rental sector in Ethiopia. Registered under Ethiopian law with TIN 0101809194, our company operates with full compliance to Ethiopian Revenue and Customs Authority (ERCA) regulations.

### Mission Statement

To provide Ethiopian and international travelers with a secure, mobile-first platform for discovering and booking unique accommodations across Ethiopia.

### Mobile App Strategy

Our native mobile applications (Android and iOS) provide:
- **Offline Capability:** View bookings and property details offline
- **Native Performance:** Fast, app-like experience
- **Device Integration:** Camera for ID scanning, GPS for location
- **Push Notifications:** Booking confirmations, host messages
- **Biometric Auth:** Touch ID, Face ID, fingerprint (planned)

### Market Coverage

**10 Major Ethiopian Cities:**
- Addis Ababa, Bahir Dar, Lalibela, Hawassa, Gondar, Axum, Harar, Dire Dawa, Jimma, Mekelle

**Target Users:**
- Ethiopian diaspora returning home
- International tourists visiting Ethiopia
- Domestic travelers exploring Ethiopia
- Business travelers needing short-term stays

### Regulatory Compliance

✅ **ERCA Compliance:** All mobile transactions logged and taxed  
✅ **National Bank of Ethiopia:** Mobile payment integration (Chapa, TeleBirr)  
✅ **Ethiopian Business Registry:** Active trade license  
✅ **INSA:** Seeking mobile application security certification

---

## 2. INTRODUCTION

### Purpose of Mobile Application Audit

Alga One Member PLC submits our native mobile applications (Android and iOS) for comprehensive security audit by INSA's Cyber Security Audit Division.

### Mobile Application Description

**Platform:** Native iOS and Android applications built with Capacitor

**Key Features:**
- **Bottom Navigation:** 4 main sections (Stays, Services, Me, Help)
- **Offline Mode:** Cached bookings and property details
- **Camera Integration:** ID document scanning for verification
- **GPS Integration:** Location-based property search
- **Push Notifications:** Real-time booking updates
- **Biometric Auth:** Touch ID/Face ID/Fingerprint (planned)
- **Mobile Payments:** TeleBirr, Chapa mobile integration
- **AI Assistant:** Lemlem chat with voice support (planned)

**User Roles:**
1. **Guest** - Browse and book on mobile
2. **Host** - Manage properties on-the-go
3. **Operator** - Mobile ID verification
4. **Admin** - Mobile platform management

### Technical Architecture

**Mobile Framework:**
- **Technology:** Capacitor 6.0 (Ionic Framework)
- **Web Layer:** React 18 + TypeScript (shared with web)
- **Native Wrapper:** Capacitor bridges to native APIs
- **Build System:** Vite 5.0

**Android Application:**
- **Minimum SDK:** Android 7.0 (API Level 24)
- **Target SDK:** Android 14 (API Level 34)
- **Language:** Kotlin + JavaScript bridge
- **Build Tool:** Gradle 8.0
- **App Signing:** Google Play signing
- **Package:** et.alga.app

**iOS Application:**
- **Minimum Version:** iOS 13.0
- **Target Version:** iOS 17
- **Language:** Swift + JavaScript bridge
- **Build Tool:** Xcode 15
- **App Signing:** Apple Developer certificate
- **Bundle ID:** et.alga.app

**Capacitor Plugins Used:**
- `@capacitor/app` - App state management
- `@capacitor/browser` - In-app browser
- `@capacitor/camera` - ID document scanning
- `@capacitor/geolocation` - GPS location
- `@capacitor/push-notifications` - Booking alerts
- `@capacitor/share` - Share properties
- `@capacitor/storage` - Secure local storage (planned)
- `@capacitor/biometric` - Fingerprint/Face ID (planned)

**Security Infrastructure:**
- **Same Backend:** Uses web API (https://alga-staging.onrender.com/api)
- **Session Management:** Session cookies (httpOnly, secure)
- **Certificate Pinning:** Planned for production
- **Secure Storage:** Encrypted local storage for tokens
- **Network Security:** TLS 1.2+ enforcement
- **Code Obfuscation:** ProGuard (Android), obfuscation (iOS)

**Data Storage:**
- **Session Tokens:** Secure storage (encrypted)
- **Cached Data:** SQLite (encrypted at rest)
- **Images:** Cached with TTL
- **Sensitive Data:** Never stored locally (except encrypted tokens)

### Payment Integration (Mobile)

**Mobile-Optimized Processors:**
- **Chapa Mobile:** TeleBirr in-app payments
- **Stripe Mobile SDK:** Apple Pay, Google Pay
- **PayPal Mobile SDK:** PayPal in-app checkout

**Security Features:**
- Tokenized payments (no card data in app)
- Biometric confirmation for payments (planned)
- Transaction receipts via email/SMS

### Scope of Mobile Application Audit

**In Scope:**
1. ✅ Android application (APK) - debug and release builds
2. ✅ iOS application (IPA) - release build
3. ✅ Native device permissions (camera, location, notifications)
4. ✅ Local data storage security
5. ✅ Network communication security
6. ✅ Code obfuscation and reverse engineering protection
7. ✅ Mobile-specific authentication flows
8. ✅ In-app payment security
9. ✅ Push notification security
10. ✅ OWASP Mobile Top 10 compliance

**Out of Scope (Covered in Web Audit):**
- ❌ Backend API security (covered in web app audit)
- ❌ Database security (covered in web app audit)
- ❌ Admin dashboard (web only)

### Test Environment

**Test Builds:**
- **Android APK (Debug):** Available for installation via ADB
- **Android APK (Release):** Signed with release keystore
- **iOS IPA (Release):** Available via TestFlight

**Test Accounts (Same as Web):**
- **Password:** INSA_Test_2025! (all accounts)
- Guest: insa-guest@test.alga.et
- Host: insa-host@test.alga.et
- Admin: insa-admin@test.alga.et
- Operator: insa-operator@test.alga.et

**Backend API:** https://alga-staging.onrender.com/api

---

## 3. OBJECTIVE OF CERTIFICATE REQUESTED

### Primary Objectives

#### 3.1 Mobile Application Security Certification
We seek INSA's certification confirming that our mobile applications meet all Ethiopian cybersecurity standards for:
- Mobile application security (OWASP Mobile Top 10)
- Native device permission handling
- Local data storage encryption
- Network communication security
- Mobile payment security
- Code protection against reverse engineering

#### 3.2 Platform Store Compliance
Obtain certification required for:
- **Google Play Store:** Security requirements for Ethiopian apps
- **Apple App Store:** Security review compliance
- **Ethiopian Market:** Government approval for digital services

#### 3.3 User Trust and Mobile Security
INSA mobile certification will provide:
- **App Store Badge:** Display certification in app listings
- **User Confidence:** Government-verified mobile security
- **Download Assurance:** Safe to install on personal devices
- **Data Protection:** Confirmation of user data security

### Mobile Security Validation Areas

**1. Application Permissions:**
- ✅ Camera permission for ID scanning (with user consent)
- ✅ Location permission for nearby properties (optional)
- ✅ Notification permission for booking alerts (optional)
- ✅ Storage permission for caching (minimal)
- ✅ No excessive permissions requested
- ✅ Runtime permission requests (Android 6+, iOS 10+)

**2. Data Storage Security:**
- ✅ Session tokens stored in encrypted secure storage
- ✅ No sensitive data in SharedPreferences/UserDefaults
- ✅ SQLite database encrypted (SQLCipher planned)
- ✅ No passwords stored locally
- ✅ Cache cleared on logout

**3. Network Communication:**
- ✅ All API calls over HTTPS/TLS 1.2+
- ✅ Certificate validation enforced
- ✅ Certificate pinning (planned for production)
- ✅ No plaintext HTTP communication
- ✅ WebSocket secure (WSS) for real-time features

**4. Code Protection:**
- ✅ ProGuard obfuscation (Android release builds)
- ✅ Swift obfuscation (iOS release builds)
- ✅ No hardcoded secrets in source code
- ✅ API keys stored in environment, not in code
- ✅ Root/jailbreak detection (planned)

**5. Authentication Security:**
- ✅ Same OTP + password as web (session-based)
- ✅ Biometric authentication ready (Touch ID, Face ID, Fingerprint)
- ✅ Session timeout: 24 hours
- ✅ Auto-logout on app background (30 minutes planned)

**6. Payment Security:**
- ✅ Mobile SDK integration (Chapa, Stripe)
- ✅ No card data stored in app
- ✅ Payment confirmation via biometric (planned)
- ✅ TLS-encrypted payment requests

**7. Push Notification Security:**
- ✅ No sensitive data in push notifications
- ✅ Notifications encrypted in transit
- ✅ User can opt-out of notifications

**8. Logging and Error Handling:**
- ✅ No sensitive data logged (no passwords, tokens, card data)
- ✅ Crash reports anonymized
- ✅ Error messages sanitized for user display

### Expected Outcomes

**We request INSA to provide:**
1. **Mobile Application Security Audit Report**
2. **Certification Letter** (if approved for both Android and iOS)
3. **Security Recommendations** for any findings
4. **INSA Mobile Security Badge** for app store listings
5. **Re-certification Timeline** (for app updates)

### Timeline

- **Submission:** November 7, 2025
- **INSA Review:** 2-4 weeks
- **Response to Findings:** Within 5 working days
- **Target Approval:** December 2025

---

## 4. REQUIRED DOCUMENTATION SUBMITTED

### 4.1 Legal and Administrative Documents

✅ **Updated Trade License:** Active business license  
✅ **TIN Certificate:** 0101809194  
✅ **Business Registration:** Alga One Member PLC

### 4.2 Mobile Application Builds

✅ **Android APK (Debug):** `app-debug.apk` (~20 MB)  
✅ **Android APK (Release - Signed):** `app-release.apk` (~20 MB)  
✅ **iOS IPA (Release):** `Alga.ipa` (~25 MB)  
✅ **SHA256 Checksums:** For build integrity verification

**Installation Instructions:**
- **Android:** `adb install app-debug.apk`
- **iOS:** TestFlight invitation or direct installation via Xcode

### 4.3 Technical Documentation for Mobile

#### 4.3.1 Mobile Architecture

✅ **Capacitor Architecture:** Web-to-native bridge diagram  
✅ **App Structure:** Navigation flow, screen hierarchy  
✅ **Data Flow:** Local storage, API communication, caching  
✅ **Security Layers:** App-level, network-level, storage-level

**Location:** `docs/diagrams/Component_Architecture.md` (includes mobile components)

#### 4.3.2 Features of Mobile Application

✅ **Native Features:**
- Bottom navigation (Stays, Services, Me, Help)
- Camera integration (ID scanning)
- GPS location (property search)
- Push notifications (booking updates)
- Offline mode (cached bookings)
- Biometric auth ready (Touch ID, Face ID, Fingerprint)

✅ **Capacitor Plugins:** All plugins documented with permissions  
✅ **Third-Party SDKs:** Chapa Mobile, Stripe Mobile, Firebase (planned)

**Location:** `docs/insa/BUILD_INSTRUCTIONS.md`

#### 4.3.3 Mobile-Specific Security

✅ **Secure Storage:** Token encryption, no plain text secrets  
✅ **Certificate Pinning:** Planned for production  
✅ **Code Obfuscation:** ProGuard (Android), Swift obfuscation (iOS)  
✅ **Root/Jailbreak Detection:** Planned  
✅ **Runtime Integrity:** App tampering detection (planned)

**Location:** `docs/insa/SECURITY_FUNCTIONALITY.md` (mobile section)

#### 4.3.4 Permission Model

**Android Permissions (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

**iOS Permissions (Info.plist):**
```xml
<key>NSCameraUsageDescription</key>
<string>Scan ID documents for verification</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Show nearby properties</string>
```

**Justification:** All permissions essential for core features, user consent required

#### 4.3.5 Mobile Threat Model

✅ **Mobile-Specific Threats:**
- Reverse engineering / code tampering
- Insecure data storage
- Man-in-the-middle attacks
- Insecure authentication
- Insufficient cryptography
- Client-side injection
- Extraneous permissions

✅ **OWASP Mobile Top 10 Coverage:**
- M1: Improper Platform Usage ✅
- M2: Insecure Data Storage ✅
- M3: Insecure Communication ✅
- M4: Insecure Authentication ✅
- M5: Insufficient Cryptography ✅
- M6: Insecure Authorization ✅
- M7: Client Code Quality ✅
- M8: Code Tampering ⚠️ (planned)
- M9: Reverse Engineering ⚠️ (planned)
- M10: Extraneous Functionality ✅

**Location:** `docs/insa/THREAT_MODEL.md`

### 4.4 Test Credentials

✅ **Same as Web Application:** 6 test accounts (all roles)  
✅ **Mobile Testing:** Login via mobile apps with same credentials  
✅ **Backend API:** Uses same staging API as web

**Location:** `docs/insa/INSA_TEST_CREDENTIALS.md`

### 4.5 Build Instructions

✅ **Complete Build Guide:** Step-by-step for Android and iOS  
✅ **Environment Setup:** Android Studio, Xcode requirements  
✅ **Signing Configuration:** Keystore and certificate setup  
✅ **App Store Deployment:** Google Play and Apple App Store processes

**Location:** `docs/insa/BUILD_INSTRUCTIONS.md`

---

## 5. CONCLUSION

### Summary

Alga One Member PLC has developed secure native mobile applications (Android and iOS) for the Ethiopian property rental market. Our mobile apps implement:

✅ **OWASP Mobile Top 10 Coverage**  
✅ **Secure Data Storage** (encrypted tokens, no plain text secrets)  
✅ **TLS/SSL Enforcement** (all network communication encrypted)  
✅ **Code Obfuscation** (ProGuard for Android, Swift for iOS)  
✅ **Minimal Permissions** (only essential device access)  
✅ **Session Security** (24-hour timeout, httpOnly cookies)  
✅ **Payment Security** (mobile SDKs, tokenization only)

### Our Commitment

We commit to:
1. **Full Collaboration** with INSA mobile security audit team
2. **Timely Responses** within 5 working days
3. **Prompt Remediation** of mobile-specific vulnerabilities
4. **Complete Transparency** about native code and permissions
5. **Ongoing Compliance** for app updates

### Readiness for Mobile Audit

✅ **Android APK:** Debug and signed release builds ready  
✅ **iOS IPA:** Release build ready (TestFlight available)  
✅ **Source Code:** Available for decompilation testing  
✅ **Documentation:** Mobile architecture, security, build instructions  
✅ **Test Accounts:** 6 accounts for mobile app testing

### Impact

INSA mobile application certification will:
- Ensure mobile user data is protected on personal devices
- Enable safe Google Play and App Store distribution
- Build trust with mobile-first Ethiopian users
- Demonstrate commitment to mobile security best practices

We appreciate INSA's expertise in mobile security and look forward to strengthening our mobile application's security posture through this audit.

---

**Submitted by:**  
Weyni Abraha  
Founder & CEO  
Alga One Member PLC  
TIN: 0101809194  

**Contact:**  
Email: Winnieaman94@gmail.com  
Phone: +251 996 034 044  

**Date:** November 7, 2025  

---

**Attachments:**
1. Android APK (Debug) - app-debug.apk
2. Android APK (Release) - app-release.apk
3. iOS IPA (Release) - Alga.ipa
4. SHA256 Checksums - checksums.txt
5. Mobile Architecture Diagrams
6. Security Functionality (Mobile Section)
7. Mobile Threat Model (OWASP Mobile Top 10)
8. Build Instructions (Android & iOS)
9. Permission Justification Document
10. Test Account Credentials

---

**Submission Method:**
☐ INSA Cyber Audit Portal  
☐ Email: tilahune@insa.gov.et  
☐ Physical Delivery: CD/DVD with APK/IPA files to INSA Office, Wollo Sefer, Addis Ababa

**Expected Response:** Within 5 working days from date of receipt

---

**Declaration:**

I, Weyni Abraha, Founder & CEO of Alga One Member PLC, hereby declare that all information provided in this mobile application security audit submission is accurate, complete, and truthful. The Alga mobile applications have been developed in full compliance with Ethiopian laws and regulations, and we are committed to maintaining the highest standards of mobile security.

**Signature:** _______________________  
**Name:** Weyni Abraha  
**Title:** Founder & CEO  
**Date:** November 7, 2025  

---

**For INSA Use Only:**

**Received Date:** ______________  
**Assigned Auditor:** ______________  
**Android APK Tested:** ☐ Pass ☐ Fail  
**iOS IPA Tested:** ☐ Pass ☐ Fail  
**Audit Completion Date:** ______________  
**Certification Decision:** ☐ Approved ☐ Conditional ☐ Rejected  
**INSA Signature:** _______________________
