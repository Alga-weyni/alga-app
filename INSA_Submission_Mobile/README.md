# INSA Mobile Application Security Audit Submission
## Alga Property Rental Platform

**Company:** ALGA ONE MEMBER PLC  
**TIN:** 0101809194  
**Submission Date:** November 2025  
**Platform:** Hybrid Mobile App (Capacitor - Android & iOS)

---

## 📦 Package Contents

### **1. Legal Documents** (6 PDFs)
- Same as web submission (shared company documentation)

### **2. Architecture Diagrams** (4 diagrams - to be exported)
- DFD with mobile app as entry point
- System Architecture with mobile layer
- ERD Database Schema (shared with web)
- Mobile-specific data flows

### **3. Threat Model** (MANDATORY for Mobile!)
- STRIDE Analysis (42 threats analyzed)
- Mobile-specific attack vectors
- Security control mitigations
- Risk assessment and recommendations

### **4. Test Credentials** (5 Accounts)
- Same accounts work in mobile app
- Test on physical devices recommended
- All native features testable

### **5. Mobile Builds**
- Android APK build guide
- Build automation script
- Installation instructions
- APK file (if built locally)

### **6. API Documentation**
- Same 40+ endpoints as web
- Mobile-specific push notification endpoints
- Offline sync documentation

### **7. Source Code Documentation**
- Capacitor configuration
- Project structure
- Key native plugins
- Third-party SDKs list

---

## 📱 Mobile App Details

**Framework:** Capacitor 7.4.4 (Hybrid)  
**Platforms:** Android 5.1+, iOS 13+, PWA  
**Base Technology:** React 18 + TypeScript

**Native Features:**
- 📸 Camera (ID verification)
- 📍 Geolocation (property search)
- 🔔 Push Notifications
- 🔐 Biometric Auth
- 📱 QR Scanning

---

## 🧪 Testing Instructions

**1. Install APK:**
```bash
adb install 5_Mobile_Builds/app-debug.apk
```

**2. Login with Test Account:**
- Email: guest@alga.et
- Password: Guest@2025

**3. Test Native Features:**
- Camera access for ID upload
- Location-based property search
- Push notifications
- Offline property browsing

---

## 📧 Contact

**Audit Coordinator:** Mss. Weyni Abraha  
**Phone:** +251 99 603 4044  
**Technical Support:** dev@alga.et

---

🇪🇹 **Ethiopia's First Native Property Rental Mobile App**
