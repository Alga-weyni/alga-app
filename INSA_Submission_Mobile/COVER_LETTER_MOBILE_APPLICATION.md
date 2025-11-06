# MOBILE APPLICATION SECURITY AUDIT REQUEST
## INSA Cyber Security Audit Division

---

**Document Type:** Mobile Application Security Testing Requirements  
**Submission Date:** November 2025  
**Company:** ALGA ONE MEMBER PLC (አልጋ ባለ አንድ አባል ኃላ/የተ/የግ/ማህበር)  
**TIN:** 0101809194  
**Registration:** AACATB/21/0236562/2018

---

## Submitted By:

**Company Name:** ALGA ONE MEMBER PLC  
**Business Type:** Ethiopian Property Rental Platform  
**Contact Person:** Mss. Weyni Abraha  
**Phone:** +251 99 603 4044  
**Email:** [company email]  
**Website:** https://alga.et

---

## Submitted To:

**Information Network Security Administration (INSA)**  
Cyber Security Audit Division  
Wollo Sefer, Addis Ababa, Ethiopia

**Contact Person:** Dr. Tilahun Ejigu (Ph.D.)  
**Title:** Cyber Security Audit Division Head  
📧 Email: tilahune@insa.gov.et  
📱 Phone: +251 937 456 374

---

## Application Overview

### **Platform Name:** Alga (አልጋ - meaning "bed" in Amharic)

### **Application Type:** Hybrid Mobile Application (Android & iOS)

### **Description:**
Alga mobile application provides native iOS and Android experiences for Ethiopia's leading property rental platform. Built using Capacitor framework, the app combines web technologies with native device capabilities for camera access, geolocation, push notifications, and offline functionality.

### **Mobile Framework:**
- **Type:** Hybrid Application (Capacitor 7.4.4)
- **Base Technology:** React 18 + TypeScript + Vite
- **iOS Support:** Capacitor iOS SDK
- **Android Support:** Capacitor Android SDK
- **PWA Support:** Progressive Web App capabilities included

### **Technology Stack:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js 20, Express.js (shared with web)
- **Database:** PostgreSQL (Neon Serverless - shared with web)
- **Deployment:** Native app stores + PWA deployment
- **Security:** INSA-hardened security controls, OWASP Mobile Top 10 compliance

### **Native Features:**
- 📸 Camera access (ID verification, property photos)
- 📍 Geolocation (property search, meal delivery)
- 🔔 Push notifications (booking confirmations, messages)
- 📤 Native sharing (share properties with friends)
- 🔐 Biometric authentication (fingerprint, Face ID)
- 📱 QR code scanning (access codes, verification)
- 💾 Offline storage (cached listings, service worker)

### **User Roles:**
1. **Guest** - Browse and book properties via mobile
2. **Host** - Manage properties on-the-go
3. **Agent (Delala)** - Track commissions from mobile app
4. **Operator** - Verify IDs using camera
5. **Admin** - Platform management (limited on mobile)

---

## Mobile Application Architecture

### **1. Business Architecture and Design** ✅

**Purpose:** Connect Ethiopian travelers with property owners through mobile-first experience

**Goals:**
- Provide seamless booking experience on mobile devices
- Enable hosts to manage properties from anywhere
- Allow agents to track commissions in real-time
- Support operators with mobile ID verification tools
- Offer offline-capable property browsing

**Main Services:**
- Property search and booking
- Secure payments (Chapa, TeleBirr, Stripe, PayPal)
- ID verification with camera
- Commission tracking for agents
- Real-time notifications
- Add-on services marketplace
- Location-based property discovery

**User Types:** 5 roles (Guest, Host, Agent, Operator, Admin)

**Core Processes:**
- User authentication (passwordless OTP)
- Property discovery (location-based)
- Booking workflow (date selection, payment)
- ID verification (camera + OCR)
- Commission calculation (agent dashboard)
- Review submission
- Service requests

---

### **2. Data Flow Diagram** ✅
**Folder:** `2_Architecture_Diagrams/`

Complete DFD showing:
- Mobile app as entry point
- Backend API communication
- Database interactions
- External service integrations
- Push notification flow
- Camera/location data handling
- Offline data synchronization

**Sensitive Data Flows:**
- User credentials (OTP verification)
- Payment information (encrypted in-transit)
- ID verification photos (temporary storage)
- Location data (permissions-based)
- Biometric data (device-only, not transmitted)

---

### **3. System Architecture with Database Relation** ✅
**Folder:** `2_Architecture_Diagrams/`

**Application Layers:**
1. **Mobile Client Layer** (iOS/Android apps)
2. **Capacitor Bridge** (Native API access)
3. **React Application Layer** (UI/business logic)
4. **Backend API Layer** (Express.js)
5. **Database Layer** (PostgreSQL)
6. **External Services Layer** (Payments, notifications, maps)

**Database Relations:**
- 20+ tables shared with web application
- ERD included showing all entity relationships
- Sensitive fields marked with encryption requirements

**API Communication:**
- RESTful endpoints (40+)
- Session-based authentication
- HTTPS only (TLS 1.2+)
- Rate limiting applied

---

### **4. Native Applications** ✅

**Development Framework:** Capacitor 7.4.4 (Hybrid framework)

**Programming Languages:**
- **Frontend:** TypeScript (React)
- **iOS Native Bridge:** Swift (Capacitor plugins)
- **Android Native Bridge:** Kotlin (Capacitor plugins)

**SDKs and Versions:**
- Capacitor Core: 7.4.4
- Capacitor Android: Compatible with Android 5.1+ (SDK 22+)
- Capacitor iOS: Compatible with iOS 13+
- React: 18.x
- TypeScript: 5.x

**Platform-Specific Security Features:**
- **iOS:** Keychain storage for sensitive data, biometric authentication (Touch ID/Face ID)
- **Android:** Keystore system for credentials, biometric prompt API
- **Both:** HTTPS certificate pinning, secure storage plugins

**Native Libraries:**
- `@capacitor/camera` - Camera access for ID verification
- `@capacitor/geolocation` - Location-based property search
- `@capacitor/push-notifications` - Booking confirmations
- `@capacitor/share` - Share properties
- `@capacitor/browser` - Open external links securely

---

### **5. Hybrid Applications** ✅

**Framework:** Capacitor (Ionic team)

**Why Hybrid:**
- Code reuse with web application (90% shared codebase)
- Native device capabilities through plugins
- Faster development and maintenance
- Consistent UX across platforms
- Easy updates (web layer updates automatically)

**Architecture Pattern:**
```
┌──────────────────────────────────────┐
│   Native App Shell (iOS/Android)     │
│   ├─ Capacitor Runtime               │
│   └─ WebView (renders React app)     │
├──────────────────────────────────────┤
│   React Application Layer            │
│   ├─ Components (UI)                 │
│   ├─ State Management (React Query)  │
│   └─ Routing (Wouter)                │
├──────────────────────────────────────┤
│   Capacitor Bridge                   │
│   ├─ Camera Plugin                   │
│   ├─ Geolocation Plugin              │
│   ├─ Push Notifications Plugin       │
│   └─ Secure Storage Plugin           │
├──────────────────────────────────────┤
│   Backend API (Express.js)           │
│   └─ Shared with web application     │
└──────────────────────────────────────┘
```

**Native-Web Component Interaction:**
- JavaScript bridge (Capacitor)
- Plugin APIs for native features
- Event-based communication
- Promise-based async operations

**Supported Platforms:**
- Android: 5.1 Lollipop and above (95%+ devices)
- iOS: 13.0 and above (98%+ devices)
- Web: PWA fallback for unsupported devices

---

### **6. Progressive Web Apps (PWA)** ✅

**Deployment Method:**
- Service worker for offline caching
- Web App Manifest for installability
- Served via HTTPS
- Add to home screen capability

**Supported Browsers:**
- Chrome 90+ (Android, Desktop)
- Safari 14+ (iOS, macOS)
- Firefox 88+
- Edge 90+

**Offline Capabilities:**
- Cached property listings (last viewed)
- Offline booking draft (syncs when online)
- Service worker caches static assets
- IndexedDB for offline data storage

**Caching Strategy:**
- Static assets: Cache-first (CSS, JS, images)
- API responses: Network-first, fallback to cache
- Property images: Cache-then-update

**Service Workers:**
- `workbox-window` for service worker management
- Background sync for pending bookings
- Push notification support
- Automatic cache updates

**Push Notifications:**
- Booking confirmations
- Payment status updates
- New messages from hosts
- Commission earnings (agents)
- ID verification status (operators)

---

### **7. Threat Model Mapping** ✅
**Folder:** `3_Threat_Model/`

**Comprehensive STRIDE Analysis provided:**
- 42 threats identified across 6 categories
- Mobile-specific threats analyzed:
  - Insecure data storage on device
  - Insufficient transport layer protection
  - Unintended data leakage
  - Poor authentication/authorization
  - Broken cryptography
  - Client-side injection
  - Improper platform usage
  - Code tampering
  - Reverse engineering

**Attack Vectors:**
- Man-in-the-middle attacks → Mitigated with TLS + certificate pinning
- Data leakage via logs → Mitigated with production log sanitization
- Insecure storage → Mitigated with Capacitor Secure Storage
- Session hijacking → Mitigated with httpOnly cookies + short timeouts
- APK tampering → Mitigated with code signing + integrity checks

**Security Controls:**
- HTTPS only (TLS 1.2+)
- Certificate pinning for API calls
- Secure storage for sensitive data
- Biometric authentication option
- Root/jailbreak detection (recommended)
- Code obfuscation (ProGuard for Android)
- Regular security updates

---

### **8. System Functionality** ✅
**Folder:** `4_Test_Credentials/TEST_ACCOUNT_DOCUMENTATION.md`

**Key Functionalities:**

**Authentication:**
- Passwordless OTP (phone/email)
- Biometric authentication (fingerprint/Face ID)
- Session persistence (secure storage)
- Auto-logout after 24 hours

**Payments:**
- Chapa (Ethiopian payment gateway)
- TeleBirr (mobile money)
- Stripe (international cards)
- PayPal (international)
- In-app payment UI with 3D Secure support

**Notifications:**
- Push notifications (booking confirmations, messages)
- In-app notifications
- SMS notifications (via Ethiopian Telecom)

**Integrations:**
- Fayda ID (Ethiopian national ID verification)
- Google Maps (location services)
- Camera (ID uploads, property photos)
- Geolocation (nearby properties)

**Security-Critical Features:**
- Payment processing (PCI DSS sensitive)
- ID verification (personal data handling)
- Location sharing (privacy-sensitive)
- Biometric authentication (device security)
- Session management (secure storage)

---

### **9. Role / System Actor Relationship** ✅
**Folder:** `4_Test_Credentials/TEST_ACCOUNT_DOCUMENTATION.md`

**RBAC Model:**

| Role | Permissions | Restrictions |
|------|------------|--------------|
| **Guest** | Browse properties, make bookings, submit reviews | Cannot list properties, access admin features |
| **Host** | List properties, manage bookings, respond to reviews | Cannot access other hosts' data, no admin features |
| **Agent** | Link properties, view commissions, track earnings | Cannot modify property details, no payout control |
| **Operator** | Verify IDs, moderate reviews, approve listings | Cannot access payments, limited to assigned tasks |
| **Admin** | Full platform control, user management, system config | All permissions (mobile app shows limited admin features) |

**Least Privilege:**
- Each role has minimum necessary permissions
- Server-side enforcement (not client-side)
- Role changes require admin approval
- All permission checks logged

**Separation of Duties:**
- Agents cannot approve their own properties
- Operators cannot access financial data
- Hosts cannot verify their own IDs
- Admins actions are audited

---

### **10. Test Account** ✅
**Folder:** `4_Test_Credentials/`

**5 Production-Ready Test Accounts:**

| Role | Email | Password | Phone |
|------|-------|----------|-------|
| Guest | guest@alga.et | `Guest@2025` | +251911000001 |
| Host | host@alga.et | `Host@2025` | +251911000002 |
| Agent | agent@alga.et | `Dellala#2025` | +251911000003 |
| Operator | operator@alga.et | `Operator#2025` | +251911000004 |
| Admin | admin@alga.et | `AlgaAdmin#2025` | +251911000005 |

**Test Data:**
- Sample properties with images
- Test bookings across date ranges
- Review data (various ratings)
- Commission records (agent account)
- No actual customer PII used

---

### **11. Source Code & Build Files** ✅
**Folder:** `5_Mobile_Builds/` and `7_Source_Code_Documentation/`

**Latest Build Files:**
- **Android APK:** `app-debug.apk` (for testing) or `app-release-signed.apk` (for production)
- **iOS IPA:** Available upon request (requires macOS build)
- **Build Guide:** Complete instructions in `ANDROID_APK_BUILD_GUIDE.md`

**Source Code:**
- Full source available on request (CD/DVD delivery to INSA office)
- Project structure documented
- Key modules:
  - `/client/src/` - React frontend (mobile UI)
  - `/server/` - Express backend (shared API)
  - `/capacitor.config.ts` - Capacitor configuration
  - `/android/` - Android native project
  - `/ios/` - iOS native project (if available)

**Build Instructions:**
- Automated build script: `scripts/build-android-apk.sh`
- Manual build process documented
- Android Studio method included
- iOS build requirements documented

---

### **12. API Documentation & Access** ✅
**Folder:** `6_API_Documentation/`

**Backend API:**
- **Base URL:** https://staging.alga.et/api
- **Authentication:** Session-based (cookies)
- **Endpoints:** 40+ RESTful endpoints
- **Documentation:** Swagger/OpenAPI format included

**Mobile-Specific Endpoints:**
- Push notification registration
- Device token management
- Location-based property search
- Offline sync endpoints
- Background task APIs

**Test API Access:**
- All test accounts have API access
- Rate limiting: 100 requests per 15 minutes
- API keys not required (session-based)
- Staging environment: https://staging.alga.et

---

### **13. Third-Party Services & SDKs** ✅
**Folder:** `7_Source_Code_Documentation/`

**Payment Processors:**
- **Chapa** (v1.x) - Ethiopian payment gateway
  - Security: API keys in environment variables
  - Sandbox mode enabled for testing
- **Stripe** (v14.x) - International payments
  - Security: PCI DSS compliant, server-side processing
- **PayPal** (Server SDK v1.x) - International payments
  - Security: OAuth 2.0, server-side only
- **TeleBirr** (Custom integration) - Ethiopian mobile money
  - Security: HMAC signature verification

**Identity Verification:**
- **Fayda ID** (Ethiopian national ID API)
  - Security: Government-approved, encrypted communication

**Communication:**
- **SendGrid** (v7.x) - Email notifications
  - Security: API keys in environment, no PII in logs
- **Ethiopian Telecom SMS** - SMS notifications
  - Security: Encrypted transmission

**Maps & Location:**
- **Google Maps Geocoding API**
  - Security: API key restrictions (domain/IP whitelist)
  - Privacy: Location data not stored permanently

**File Storage:**
- **Replit Object Storage** (Google Cloud Storage)
  - Security: IAM roles, signed URLs, encrypted at-rest

**Analytics (if applicable):**
- Not currently implemented (privacy-focused)

---

### **14. Authentication & Authorization Details** ✅
**Folder:** `4_Test_Credentials/TEST_ACCOUNT_DOCUMENTATION.md`

**Authentication Mechanisms:**

1. **Passwordless OTP (Primary):**
   - Phone/Email OTP (4-digit code)
   - Bcrypt hashing for codes
   - 5-minute expiration
   - Rate limiting (3 attempts per 15 minutes)

2. **Password-based (Fallback):**
   - Bcrypt hashing (10 rounds)
   - Minimum 8 characters, complexity requirements
   - Account lockout after 5 failed attempts

3. **Biometric (Mobile-only):**
   - Fingerprint (Android/iOS)
   - Face ID (iOS)
   - Device-only storage (not transmitted)
   - Fallback to OTP if biometric fails

**Session Management:**
- PostgreSQL session store
- httpOnly cookies (JavaScript cannot access)
- Secure flag (HTTPS only)
- SameSite: Lax (CSRF protection)
- 24-hour timeout
- Sliding expiration (extends on activity)

**Authorization Controls:**
- Role-Based Access Control (RBAC)
- Server-side permission checks on every request
- Granular permissions per endpoint
- Session includes user role (server-validated)
- No client-side role enforcement

---

### **15. Compliance & Regulatory Requirements** ✅
**Folder:** `3_Threat_Model/THREAT_MODEL_STRIDE_ANALYSIS.md`

**Ethiopian Compliance:**
- ✅ Fayda ID integration (national ID verification)
- ✅ ERCA tax compliance (VAT, withholding tax)
- ✅ TeleBirr integration (local payment method)
- ✅ Chapa integration (Ethiopian payment gateway)
- ✅ Ethiopian Telecom SMS (local SMS provider)

**International Standards:**
- ✅ OWASP Mobile Top 10 (2016)
- ✅ OWASP Top 10 (2021) - Backend API
- ✅ PCI DSS considerations (payment handling)
- ✅ GDPR principles (data minimization, right to deletion)

**Internal Security Policies:**
- Password policy (complexity, rotation)
- Session management policy
- Data retention policy (90 days for logs)
- Incident response plan
- Secure coding standards (OWASP practices)

---

### **16. Secure Communication Details** ✅

**Encryption Methods:**

**In-Transit (Network):**
- TLS 1.2+ for all API calls (HTTPS only)
- Certificate pinning for API endpoints (prevents MitM)
- Secure WebSocket (WSS) for real-time features
- No HTTP allowed (automatic redirect to HTTPS)

**At-Rest (Device Storage):**
- Capacitor Secure Storage plugin (iOS Keychain, Android Keystore)
- Sensitive data encrypted before storage
- Session tokens in secure storage only
- No plain-text passwords stored

**At-Rest (Server/Database):**
- AES-256 encryption for database (Neon)
- Bcrypt for passwords (10 rounds)
- Encrypted backups
- TLS for database connections

**Key Management:**
- API keys in environment variables (not in code)
- Certificate rotation (annual)
- Database credentials rotated quarterly
- No hardcoded secrets

**Protocols:**
- HTTPS (TLS 1.2+) for all communication
- WSS (WebSocket Secure) for real-time features
- OAuth 2.0 for third-party integrations
- HMAC signatures for payment webhooks

---

### **17. Logging & Monitoring Setup** ✅

**User Activity Logging:**
- Login attempts (success/failure)
- Booking creation/modification
- Payment transactions
- ID verification attempts
- Role changes (admin actions)
- Property listings/updates

**Security Event Logging:**
- Failed authentication attempts
- Rate limit violations
- Suspicious activity patterns
- API errors (4xx, 5xx)
- Permission denial attempts

**Log Storage:**
- PostgreSQL (structured logs)
- 90-day retention policy
- Indexed for fast querying
- Sensitive data masked (no passwords logged)

**Monitoring Systems:**
- Real-time error tracking (console.error captured)
- Performance monitoring (API response times)
- Uptime monitoring (Replit infrastructure)
- Database performance metrics (Neon dashboard)

**Alerting:**
- Email alerts for critical errors
- Admin dashboard for security events
- Rate limit breach notifications
- Payment failure alerts

---

## Mobile-Specific Security Features

### **Android Security:**
- ProGuard code obfuscation (release builds)
- APK signing with release keystore
- Minimum SDK 22 (Android 5.1+)
- Target SDK 33 (Android 13)
- Runtime permissions (camera, location)
- SafetyNet API (device integrity checks - recommended)

### **iOS Security:**
- App Transport Security (ATS) enforced
- Keychain for sensitive data
- Minimum deployment target: iOS 13
- Face ID/Touch ID integration
- App sandbox (data isolation)
- Code signing with Apple certificate

### **PWA Security:**
- HTTPS required (no HTTP allowed)
- Service worker scope restrictions
- Content Security Policy (CSP)
- Secure context requirements
- IndexedDB encryption (sensitive data)

---

## Submission Package Contents

This submission includes all mandatory requirements as per INSA's "Mobile Application Security Testing Requirements Document v2":

✅ **1. Legal Documents** (6 PDFs)  
✅ **2. Architecture Diagrams** (DFD, System Arch, ERD)  
✅ **3. Threat Model** (MANDATORY - STRIDE analysis)  
✅ **4. Test Accounts** (5 roles with credentials)  
✅ **5. Mobile Builds** (APK + build guide)  
✅ **6. API Documentation** (40+ endpoints)  
✅ **7. Source Code Documentation** (structure + key modules)  

---

## Testing Environment Access

**Mobile App Installation:**
- Android APK provided in `5_Mobile_Builds/app-debug.apk`
- iOS IPA available upon request
- Install instructions in build guide

**Backend API:**
- Base URL: https://staging.alga.et/api
- Test accounts functional
- Staging database populated

**Test Devices Recommended:**
- Android: 5.1+ (physical device or emulator)
- iOS: 13+ (physical device or simulator)
- Screen sizes: 5-6.5 inches optimal

---

## Contact Information for Audit

**Primary Contact:** Mss. Weyni Abraha  
**Phone:** +251 99 603 4044  
**Email:** [your email]  
**Availability:** Monday-Friday, 9:00 AM - 6:00 PM EAT

**Technical Contact:** Development Team  
**Email:** dev@alga.et  
**For:** Build issues, API access, technical clarifications

---

## Acknowledgment

We, ALGA ONE MEMBER PLC, hereby submit this Mobile Application Security Audit Request to INSA in compliance with the "Mobile Application Security Testing Requirements Document v2". We confirm that:

✅ All mandatory documents are included  
✅ APK file is functional and ready for testing  
✅ Test accounts are active and accessible  
✅ Technical documentation is complete and accurate  
✅ We authorize INSA to conduct security testing on our mobile application  
✅ We commit to addressing any identified vulnerabilities promptly  

We look forward to INSA's professional mobile security assessment.

---

**Submitted By:**

**Name:** _________________________________  
**Title:** _________________________________  
**Date:** _________________________________  
**Signature:** _________________________________

---

**For INSA Use Only:**

**Case Number:** _________________________________  
**Received By:** _________________________________  
**Received Date:** _________________________________  
**Assigned Auditor:** _________________________________

---

🇪🇹 **Building Ethiopia's First Native Property Rental Mobile App**

**Document Prepared By:** Alga Development Team  
**Package Version:** 1.0  
**Last Updated:** November 6, 2025
