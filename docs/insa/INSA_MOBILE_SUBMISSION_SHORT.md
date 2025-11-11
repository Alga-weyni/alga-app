# INSA Mobile Application Security Audit Submission
## Alga (አልጋ) - Ethiopian Property Booking Platform

---

**Applicant Company:** Alga One Member PLC  
**TIN:** 0101809194  
**Submission Date:** January 11, 2025  
**Contact:** Weyni Abraha | Winnieaman94@gmail.com | +251 996 034 044

---

## 1. INTRODUCTION

### Purpose
Request INSA security certification for Alga mobile application (Android, iOS, PWA) to enable Google Play Store and Apple App Store distribution.

### Company Overview
Alga is a **women-run, women-owned, women-operated** Ethiopian property rental platform connecting travelers with verified accommodations across 10 major Ethiopian cities.

### Scope
- **Android App:** API 24+ (Android 7.0+)
- **iOS App:** iOS 13.0+
- **Progressive Web App (PWA):** Chrome, Safari, Edge, Firefox
- **Framework:** React + Capacitor (hybrid native/web)

---

## 2. REQUIREMENT 1: Business Architecture ✅

### Core Business Model
- **Platform:** Property booking marketplace (Ethiopian Airbnb alternative)
- **Users:** Guests (travelers), Hosts (property owners), Delala Agents (brokers), Operators, Admins
- **Revenue:** 10% platform commission + 5% agent commission
- **Tax:** 15% VAT, 5% withholding tax (ERCA compliant, TIN: 0101809194)

### Key Features
1. Property listings with verification (10 cities: Addis Ababa, Lalibela, Gondar, Bahir Dar, Axum, Harar, Hawassa, Dire Dawa, Mekelle, Jimma)
2. Passwordless authentication (OTP via SMS)
3. Payment integration (TeleBirr, Chapa, Stripe, PayPal)
4. ID verification (Ethiopian ID, passport, driver's license)
5. Delala agent commission tracking (5% for 36 months)
6. Lemlem AI assistant (browser-native, offline-capable)
7. Review system with time-decay algorithm

### Business Diagrams
See `INSA_MOBILE_DIAGRAMS.md` for:
- Business Architecture Diagram
- Business Process Flow (Guest/Host/Agent journeys)
- Business Model Canvas (9-block framework)
- Commission & Tax Calculation Flowchart

---

## 3. REQUIREMENT 2: Data Flow ✅

### Data Flow Architecture
```
Mobile App (React + Capacitor)
    ↓ HTTPS/TLS 1.2+
Express.js Backend (Node.js + TypeScript)
    ↓ TLS
PostgreSQL Database (Neon - encrypted at rest)
    ↓ HTTPS
Google Cloud Storage (ID documents, property images)
    ↓ API
Payment Processors (Chapa, Stripe, PayPal)
```

### Data Types & Handling

| Data Type | Storage | Encryption | Access |
|-----------|---------|------------|--------|
| Passwords | PostgreSQL | Bcrypt (cost 12) | Hashed only |
| ID Documents | Google Cloud | AES-256 | Operator, Admin |
| Session Tokens | PostgreSQL + Keychain/EncryptedSharedPreferences | Neon encrypted + Platform native | User only |
| Payment Cards | Not stored | N/A | Stripe/PayPal handles |
| Financial Records | PostgreSQL | Neon encrypted | Admin only |
| Location (property) | PostgreSQL | Neon encrypted | Public |

**See Diagram:** Data Flow Diagram in `INSA_MOBILE_DIAGRAMS.md`

---

## 4. REQUIREMENT 3: System Architecture ✅

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite 5.0 (build tool)
- Tailwind CSS + Shadcn/UI
- React Query (server state)
- Wouter (routing)

**Mobile:**
- Capacitor 6.0 (native bridge)
- Camera, GPS, Push Notifications, Secure Storage plugins

**Backend:**
- Express.js + Node.js + TypeScript
- Drizzle ORM (type-safe database queries)
- Express Session (24-hour timeout)

**Database:**
- PostgreSQL (Neon serverless)
- Automatic encryption at rest (AES-256)
- Daily backups

**Security:**
- Helmet.js (HTTP headers)
- CORS protection
- Rate limiting (express-rate-limit)
- XSS protection (xss-clean)
- Input validation (Zod)

**See Diagram:** Mobile Application Architecture, Database ER Diagram in `INSA_MOBILE_DIAGRAMS.md`

---

## 5. REQUIREMENT 4: Hybrid Application Details ✅

### Framework: Capacitor 6.0

**Native Capabilities:**
- Camera (ID document upload)
- Geolocation (property search)
- Secure Storage (session tokens)
- Push Notifications (booking alerts)
- Share (property links)

**Build Process:**
```bash
# Web build
npm run build

# Android build
npx cap sync android
cd android && ./gradlew assembleRelease

# iOS build
npx cap sync ios
cd ios && xcodebuild -workspace App.xcworkspace -scheme App
```

**Native vs Web Features:**

| Feature | Android Native | iOS Native | PWA (Web) |
|---------|---------------|------------|-----------|
| Camera | ✅ Native Camera API | ✅ UIImagePickerController | ✅ HTML5 getUserMedia |
| GPS | ✅ Android Location API | ✅ CoreLocation | ✅ Geolocation API |
| Push Notifications | ✅ Firebase Cloud Messaging | ✅ Apple Push Notification | ❌ Limited support |
| Offline Storage | ✅ SQLite + Secure Storage | ✅ Core Data + Keychain | ✅ IndexedDB |
| Biometrics | ✅ Fingerprint/Face Unlock | ✅ Touch ID/Face ID | ❌ Not available |

---

## 6. REQUIREMENT 5: Threat Model ✅

### OWASP Mobile Top 10 Compliance

| Threat | Status | Mitigation |
|--------|--------|------------|
| M1: Improper Platform Usage | ✅ Mitigated | Capacitor best practices, proper permissions |
| M2: Insecure Data Storage | ⚠️ Partial | Keychain/EncryptedSharedPreferences (SQLCipher pending) |
| M3: Insecure Communication | ⚠️ Partial | TLS 1.2+ enforced (certificate pinning pending) |
| M4: Insecure Authentication | ✅ Mitigated | Bcrypt + OTP + rate limiting + 24h timeout |
| M5: Insufficient Cryptography | ✅ Mitigated | Bcrypt cost 12, TLS 1.2+, AES-256 |
| M6: Insecure Authorization | ✅ Mitigated | Server-side RBAC, ownership checks |
| M7: Client Code Quality | ✅ Mitigated | TypeScript, Zod validation, ESLint |
| M8: Code Tampering | ⚠️ Partial | ProGuard obfuscation (root detection pending) |
| M9: Reverse Engineering | ⚠️ Partial | ProGuard obfuscation only |
| M10: Extraneous Functionality | ✅ Mitigated | No debug code in production |

**Overall Score:** 7/10 fully mitigated, 3/10 partially mitigated (fixes scheduled)

**See Diagram:** OWASP Mobile Top 10 Threat Model in `INSA_MOBILE_DIAGRAMS.md`

---

## 7. REQUIREMENT 6: Features ✅

### Core Features

1. **User Management**
   - Registration (email/phone + OTP)
   - Passwordless login (4-digit OTP, 5-min expiry)
   - Profile management
   - Role-based access (Guest, Host, Agent, Operator, Admin)

2. **Property Management**
   - Create/edit listings (hosts only)
   - Image upload (max 10 per property, compressed)
   - Property verification (operator approval required)
   - Search & filter (city, price, type, guests)

3. **Booking System**
   - Date selection with conflict prevention
   - Real-time availability check
   - Payment processing (TeleBirr, Chapa, Stripe, PayPal)
   - TTLock 4-digit PIN generation (time-limited, offline-capable)
   - Booking confirmation (email + SMS with access code)

4. **Payment Processing**
   - Multi-currency (ETB, USD, EUR)
   - Commission calculation (10% platform + 5% agent)
   - Tax calculation (15% VAT, 5% withholding)
   - ERCA-compliant invoice generation (PDF)

5. **ID Verification**
   - Document upload (camera/gallery)
   - OCR extraction (Tesseract.js, browser-native)
   - QR code scanning (Ethiopian national ID)
   - Operator review dashboard

6. **Delala Agent System**
   - Agent registration (TIN required)
   - Property registration on behalf of owners
   - Commission tracking (5% for 36 months)
   - Performance analytics

7. **Review System**
   - Time-decay algorithm (recent reviews weighted higher)
   - Verified guest reviews only
   - Host response capability

8. **Mandatory Hardware Security & TTLock Access System**
   - **TTLock Smart Lockbox**: Keypad-based lockbox holding physical property keys
     - **4-digit PIN codes** generated via TTLock Keyboard Password API
     - **Time-limited validity**: Codes active only during booking period (check-in to checkout)
     - **Offline operation**: Works without internet/Bluetooth at unlock time
     - **Auto-expiration**: Codes invalidate automatically after checkout
     - **Guest flow**: Alga app/SMS delivers code → Guest enters on keypad → Retrieves key from lockbox
   - **Security Cameras**: Property surveillance for guest safety and incident documentation
   - **Operator Verification**: Properties cannot be approved without photographic proof of both devices installed and functional

9. **Lemlem AI Assistant**
   - Browser-native (no external AI API costs)
   - Multilingual (Amharic, English, Tigrinya, Afaan Oromoo, Chinese)
   - Offline-capable (IndexedDB caching)
   - Contextual property knowledge

10. **Admin Dashboard (Lemlem Operations)**
   - Real-time KPIs (bookings, revenue, users)
   - Natural language queries
   - Weekly executive summaries
   - CSV export
   - Hardware Deployment tracking (lockbox & camera installation status per property)

---

## 8. REQUIREMENT 7: OWASP Mobile Top 10 Analysis ✅

**See Requirement 5 (same content, consolidated)**

---

## 9. REQUIREMENT 8: Authentication ✅

### Method: Session-Based + OTP

**Login Flow:**
```
1. User enters phone number
2. Backend generates 4-digit OTP
3. SMS sent via Ethiopian Telecom
4. User enters OTP
5. Backend validates (5-min expiry, 3 attempts max)
6. Session created (24-hour timeout)
7. httpOnly cookie issued
```

**Security Properties:**
- ✅ Bcrypt password hashing (cost 12)
- ✅ OTP rate limiting (3 attempts → 15-min lockout)
- ✅ Session timeout (24 hours)
- ✅ httpOnly cookies (XSS protection)
- ✅ secure flag (HTTPS-only)
- ✅ sameSite=strict (CSRF protection)

**Mobile Storage:**
- Android: EncryptedSharedPreferences (AES-256)
- iOS: Keychain (hardware-backed)

**See Diagram:** Authentication & Session Flow in `INSA_MOBILE_DIAGRAMS.md`

---

## 10. REQUIREMENT 9: Role/System Actor Relationship ✅

### User Roles

| Role | Access Level | Key Capabilities |
|------|--------------|------------------|
| **Guest** | Standard | Browse, book, pay, review |
| **Host** | Elevated | Create properties, manage bookings, view earnings |
| **Agent** | Elevated + Commission | Register properties for owners, track 5% commission |
| **Operator** | Staff | Verify properties, verify IDs, review documents |
| **Admin** | Full System | User management, financial reports, platform settings |

### Permission Matrix (Summary)

| Action | Guest | Host | Agent | Operator | Admin |
|--------|-------|------|-------|----------|-------|
| Browse properties | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create property | ❌ | ✅ | ✅ | ❌ | ✅ |
| Verify property | ❌ | ❌ | ❌ | ✅ | ✅ |
| View all users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Process payouts | ❌ | ❌ | ❌ | ❌ | ✅ |

**See Diagram:** User Role & Permission Matrix in `INSA_MOBILE_DIAGRAMS.md`

---

## 11. REQUIREMENT 10: Compliance ✅

### Ethiopian Regulations

1. **ERCA (Tax Authority)**
   - TIN: 0101809194
   - VAT: 15% on commissions
   - Withholding: 5% on commissions
   - Invoice generation (PDF, ERCA-compliant)
   - 7-year record retention

2. **NBE (National Bank of Ethiopia)**
   - Approved payment processors (Chapa, TeleBirr, Stripe)
   - AML/KYC compliance (ID verification required)
   - Foreign currency handling (Stripe/PayPal for USD/EUR)

3. **INSA (Cybersecurity)**
   - Directive No. 1/2020 compliance
   - Mobile security standards
   - **Purpose of this audit**

4. **Ethiopian Data Protection**
   - User consent for data collection
   - Right to access, correction, deletion
   - 72-hour breach notification

### International Compliance

5. **GDPR (for EU travelers)**
   - Data subject rights
   - Privacy by design
   - Breach notification

6. **PCI DSS**
   - No card data storage (Stripe/PayPal handles)
   - TLS 1.2+ for payment API calls

---

## 12. REQUIREMENT 11: Sensitive Data Handling ✅

### Data Categories & Storage

| Data Type | Storage Location | Encryption Method | Access Control |
|-----------|-----------------|-------------------|----------------|
| Passwords | PostgreSQL | Bcrypt (cost 12) | Hashed only |
| ID Documents | Google Cloud Storage | AES-256 (at rest) | Pre-signed URLs (1-hour expiry), Operator/Admin only |
| Session Tokens | PostgreSQL + Keychain/EncryptedSharedPreferences | Neon encrypted + Platform native | User only |
| Payment Cards | NOT STORED | N/A | Stripe/PayPal handles |
| Transaction Refs | PostgreSQL | Neon encrypted | User (own), Admin (all) |
| Financial Records | PostgreSQL | Neon encrypted | Admin only |

### Encryption Summary
- **At Rest:** AES-256 (Neon Database, Google Cloud Storage)
- **In Transit:** TLS 1.2+ (all API calls)
- **Passwords:** Bcrypt one-way hash (cannot be reversed)

### Data Breach Plan
1. **Detection & Containment** (0-1 hour)
2. **Assessment** (1-24 hours)
3. **Notification** (24-72 hours: users, ERCA, INSA)
4. **Remediation** (1-7 days)
5. **Prevention** (ongoing)

---

## 13. REQUIREMENT 12: Third-Party Integrations ✅

### External Services

| Service | Purpose | Data Shared | Compliance |
|---------|---------|-------------|------------|
| **Chapa** | TeleBirr payments | Name, email, phone, amount | NBE approved, PCI DSS |
| **Stripe** | Card payments | Name, email, amount (no cards) | PCI DSS L1, SOC 2 |
| **PayPal** | PayPal payments | Name, email, amount | PCI DSS L1, SOC 2 |
| **Ethiopian Telecom** | SMS OTP | Phone, OTP code | NCA approved |
| **SendGrid** | Email | Email, name, booking details | SOC 2, GDPR |
| **Neon Database** | PostgreSQL | All app data (encrypted) | SOC 2, ISO 27001 |
| **Google Cloud Storage** | File storage | Images, documents | SOC 2, ISO 27001 |
| **Google Maps** | Geocoding | Property addresses | GDPR |
| **Tesseract.js** | OCR | ID documents (client-side only, no external API) | N/A (offline) |

### Security Measures
- ✅ API keys in environment variables (not hardcoded)
- ✅ HTTPS-only communication
- ✅ Webhook signature verification
- ✅ Rate limiting
- ✅ Different keys for dev/production

---

## 14. REQUIREMENT 13: Testing Constraints ✅

### Testing Restrictions (Do NOT Test)

❌ **Denial-of-Service attacks** (shared infrastructure)  
❌ **Live data tampering** (production database)  
❌ **Social engineering** (phishing staff/users)  
❌ **Physical security testing** (cloud-hosted)

### Safe Testing Environment

**Staging URL:** https://test.alga-app.replit.app

**Test Accounts:**

| Role | Email | Password | Phone | OTP |
|------|-------|----------|-------|-----|
| Guest | test-guest@alga.et | Test@1234 | +251900000001 | 1234 |
| Host | test-host@alga.et | Test@1234 | +251900000002 | 1234 |
| Agent | test-agent@alga.et | Test@1234 | +251900000003 | 1234 |
| Operator | test-operator@alga.et | Test@1234 | +251900000004 | 1234 |
| Admin | test-admin@alga.et | Test@1234 | +251900000005 | 1234 |

**Test Payments:**
- Chapa: Card `4200000000000000`, CVV `123`
- Stripe: Card `4242424242424242`, CVV `123`
- All sandbox mode (no real charges)

### Recommended Testing
1. **Static Analysis:** APK decompilation, source code review
2. **Dynamic Analysis:** Burp Suite (network interception), Frida (runtime)
3. **Penetration Testing:** Auth bypass, IDOR, payment tampering

---

## 15. REQUIREMENT 14: Known Vulnerabilities ✅

### Disclosed Security Concerns

| Vulnerability | Severity | Impact | Planned Fix | Timeline |
|---------------|----------|--------|-------------|----------|
| **No Certificate Pinning** | HIGH | MITM attacks on public WiFi | Implement certificate pinning | Feb 2025 |
| **Unencrypted SQLite** | MEDIUM | Cached data readable on rooted devices | SQLCipher encryption | May 2025 |
| **No Root Detection** | MEDIUM | App runs on compromised devices | Root/jailbreak detection | May 2025 |

### Current Mitigations
- TLS 1.2+ enforced (default certificate validation)
- Sensitive data not cached (passwords, payment info)
- Server-side validation (cannot bypass payment logic)

### INSA Focus Areas
- Payment flow security (price tampering, transaction replay)
- ID verification workflow (fake ID upload, operator bypass)
- RBAC enforcement (privilege escalation, IDOR)
- Session management (hijacking, timeout, fixation)

---

## 16. REQUIREMENT 15: Testing Questions - ANSWERED ✅

### Q1: OS Supported?
**A:** Android 7.0+ (API 24), iOS 13.0+, PWA (Chrome, Safari, Edge, Firefox)

### Q2: Source code or binary?
**A:** Both provided (GitHub read-only + APK/IPA on CD/DVD)

### Q3: Components needing detailed testing?
**A:** Payment processing, ID verification, RBAC, session management, offline data security

### Q4: Compliance requirements?
**A:** ERCA (TIN 0101809194), NBE, INSA, Ethiopian Data Protection, GDPR, PCI DSS, OWASP Mobile Top 10

### Q5: Authentication mechanism?
**A:** Session-based + OTP (Bcrypt passwords, httpOnly cookies, 24h timeout)

### Q6: Sensitive data stored/transmitted?
**A:** PII, credentials, ID documents, financial records, location. All encrypted in transit (TLS 1.2+) and at rest (AES-256)

### Q7: How is sensitive data handled?
**A:** Bcrypt hashing (passwords), AES-256 (documents, database), tokenization (payment cards), ephemeral (guest location)

### Q8: Third-party integrations?
**A:** 10 services (Chapa, Stripe, PayPal, Ethiopian Telecom, SendGrid, Neon, Google Cloud, Google Maps, Tesseract.js, Firebase)

### Q9: Testing restrictions?
**A:** No DoS, no live data tampering, no social engineering. Use staging environment.

### Q10: Known vulnerabilities?
**A:** 3 disclosed (certificate pinning, SQLCipher, root detection). See Requirement 14.

---

## 17. REQUIREMENT 16: Scope Definition ✅

### Assets to Audit

| Asset | Location/Link | Test Credentials |
|-------|--------------|------------------|
| Android APK (Debug) | CD/DVD delivery | test-guest@alga.et / Test@1234 |
| Android APK (Release) | CD/DVD delivery | test-host@alga.et / Test@1234 |
| iOS IPA (Release) | CD/DVD delivery | test-agent@alga.et / Test@1234 |
| PWA (Web) | https://alga-app.replit.app | test-operator@alga.et / Test@1234 |
| Staging Environment | https://test.alga-app.replit.app | test-admin@alga.et / Test@1234 |
| Source Code | GitHub (read-only access) | Credentials sent separately |

### Testing Scope

**Static Analysis:**
- ✅ APK decompilation (JADX, APKTool)
- ✅ iOS binary inspection (Hopper, class-dump)
- ✅ Source code review (SonarQube, ESLint)

**Dynamic Analysis:**
- ✅ Network interception (Burp Suite, mitmproxy)
- ✅ Runtime instrumentation (Frida, Xposed)
- ✅ Local storage inspection (ADB, iExplorer)

**Automated SAST:**
- ✅ Dependency scanning (npm audit, Snyk)
- ✅ Secrets scanning (TruffleHog, GitGuardian)

---

## 18. REQUIREMENT 17: Contact Information ✅

### Primary Contact

**Name:** Weyni Abraha  
**Role:** Founder & CEO  
**Email:** Winnieaman94@gmail.com  
**Mobile:** +251 996 034 044  
**Availability:** Monday-Friday, 9:00 AM - 5:00 PM (Ethiopian Time, UTC+3)

### Company Information

**Company:** Alga One Member PLC  
**TIN:** 0101809194  
**Website:** https://alga-app.replit.app  
**Office:** Addis Ababa, Ethiopia

### INSA Audit Contact

**Name:** Dr. Tilahun Ejigu (Ph.D.)  
**Role:** Cyber Security Audit Division Head  
**Email:** tilahune@insa.gov.et  
**Mobile:** +251 937 456 374  
**Office:** INSA, Wollo Sefer, Addis Ababa

### Submission Instructions

**Option 1: INSA Portal** (Preferred)  
URL: https://cyberaudit.insa.gov.et/sign-up

**Option 2: Physical Delivery**  
```
Information Network Security Administration (INSA)
Cyber Security Audit Division
Wollo Sefer, Addis Ababa, Ethiopia
Attention: Dr. Tilahun Ejigu
```

**Option 3: Email**  
To: tilahune@insa.gov.et  
CC: Winnieaman94@gmail.com  
Subject: "ALGA Mobile App Security Audit Submission - TIN 0101809194"

---

## 19. CONCLUSION

### Summary
Alga One Member PLC submits our hybrid mobile application for INSA security certification. This package includes:

✅ Complete documentation (17 requirements + 14 diagrams)  
✅ Mobile binaries (Android APK, iOS IPA)  
✅ Source code access (GitHub read-only)  
✅ Test environment + 5 test accounts  
✅ Security analysis (OWASP Mobile Top 10)  
✅ Regulatory compliance (ERCA, NBE, Data Protection, GDPR, PCI DSS)

### Security Highlights

**Strengths:**
- OWASP Mobile Top 10: 7/10 fully mitigated
- TLS 1.2+ enforced (all API calls)
- Server-side RBAC (cannot bypass client-side)
- No card data storage (PCI DSS compliant)
- Bcrypt password hashing (cost 12)
- Proactive vulnerability disclosure

**Pending Improvements:**
- Certificate pinning (Feb 2025)
- SQLCipher encryption (May 2025)
- Root/jailbreak detection (May 2025)

### Timeline

- **Jan 11, 2025:** Submission to INSA
- **Jan-Feb 2025:** Security testing (2-4 weeks)
- **Feb 2025:** Findings report
- **Feb-Mar 2025:** Remediation (if needed)
- **Mar 2025:** INSA certification (target)
- **Apr 2025:** App store submission

### Commitment
Alga commits to continuous security improvement, prompt remediation, transparency, user protection, and full regulatory compliance.

---

**Document Prepared By:** Weyni Abraha, Founder & CEO, Alga One Member PLC  
**Submission Date:** January 11, 2025  
**Version:** 2.0 (Short & Clear)  
**Pages:** ~20 pages (vs. 300+ in detailed version)  
**Attachments:** Android APK, iOS IPA, Source code credentials, Test account list

---

**END OF SUBMISSION**
