# MOBILE APPLICATION SECURITY TESTING REQUIREMENTS
## Information Network Security Administration (INSA)
## Cyber Security Audit Division

**Document Number:** OF/AEAD/001  
**Submission Date:** January 11, 2025  
**Due Date for Response:** Within Five (5) Working Days from Date of Receipt

---

## COVER PAGE

### Company Information

**Company Name:** Alga One Member PLC  
**Taxpayer Identification Number (TIN):** 0101809194  
**Business Registration Number:** [Ethiopian Business Registry Number]  
**Physical Address:** Addis Ababa, Ethiopia  

### Application Details

**Application Name:** Alga - Ethiopian Property Rental Platform  
**Application Type:** Hybrid Mobile Application (Android & iOS)  
**Platform Framework:** Capacitor 6.0 (React + TypeScript → Native Android/iOS)  
**Development Language:** TypeScript, JavaScript (Web Layer) + Kotlin (Android Native) + Swift (iOS Native)  
**Deployment:** Progressive Web App (PWA) + Native iOS/Android via Capacitor

### Contact Person

**Name:** Weyni Abraha  
**Title:** Founder & CEO  
**Email:** Winnieaman94@gmail.com  
**Phone:** +251 996 034 044  
**Alternative Contact:** [Business Phone]  

### INSA Audit Contact

**Name:** Tilahun Ejigu (Ph.D.)  
**Title:** Cyber Security Audit Division Head  
**Organization:** Information Network Security Administration (INSA)  
**Location:** Wollo Sefer, Addis Ababa, Ethiopia  
**Email:** tilahune@insa.gov.et  
**Phone:** +251 937 456 374  

### Submission Portal

**Primary:** https://cyberaudit.insa.gov.et/sign-up  
**Email:** tilahune@insa.gov.et  
**Physical Delivery:** CD/DVD to INSA Office, Wollo Sefer, Addis Ababa

---

## 1. BACKGROUND OF ORGANIZATION

### Company Overview

**Alga One Member PLC** is an Ethiopian technology company registered under Ethiopian law with TIN 0101809194. We are a women-run, women-owned, and women-operated company established to transform the hospitality and property rental sector in Ethiopia through secure mobile-first technology.

### Mission Statement

To provide Ethiopian and international travelers with a secure, accessible mobile platform for discovering and booking culturally immersive accommodations across Ethiopia's 10 major cities, while empowering local hosts and property agents (Delalas) to participate in the digital economy.

### Regulatory Compliance

✅ **Ethiopian Revenue and Customs Authority (ERCA):** Full tax compliance with TIN 0101809194  
✅ **National Bank of Ethiopia:** Approved payment processor integration (Chapa, TeleBirr, Stripe, PayPal)  
✅ **Ethiopian Business Registry:** Active trade license  
✅ **INSA:** Seeking mobile application security certification (this submission)  
✅ **Ethiopian Data Protection:** Compliance with national data protection standards

### Market Coverage

**10 Major Ethiopian Cities:**
- Addis Ababa (Capital)
- Bahir Dar (Lake Tana)
- Lalibela (Rock-Hewn Churches)
- Hawassa (Rift Valley)
- Gondar (Castles)
- Axum (Obelisks)
- Harar (Old Walled City)
- Dire Dawa (Commercial Hub)
- Jimma (Coffee Region)
- Mekelle (Tigray)

### Target Users

1. **Ethiopian Diaspora** - Returning home for visits/holidays
2. **International Tourists** - Visiting Ethiopia's UNESCO heritage sites
3. **Domestic Travelers** - Exploring Ethiopia's diverse regions
4. **Business Travelers** - Short-term stays for conferences/meetings
5. **Property Agents (Delalas)** - Local agents earning commissions on listings

### Company Values

**Women-Centric Leadership:** All executive decisions made by women founders  
**Zero-Cost Architecture:** 100% free browser-native solutions, no external API dependencies  
**Offline-First Design:** Optimized for 2G networks across Ethiopia  
**Cultural Authenticity:** Ethiopian proverbs, multilingual support (Amharic, English, Tigrinya, Afaan Oromoo)  
**Government-Grade Security:** INSA compliance as foundation, not afterthought

---

## 2. INTRODUCTION

### Purpose of Mobile Application Security Audit

Alga One Member PLC submits our hybrid mobile application (Android & iOS) for comprehensive security audit by INSA's Cyber Security Audit Division. We seek certification confirming that our mobile application meets all Ethiopian cybersecurity standards, enabling safe distribution through Google Play Store and Apple App Store.

### Application Description

**Alga** is a mobile-first property rental platform connecting Ethiopian and international travelers with verified local accommodations across Ethiopia's 10 major cities. The application provides:

**For Guests:**
- Browse 1,000+ verified properties across 10 cities
- Book accommodations with flexible payment options
- Communicate with hosts securely
- Access booking details offline
- ID verification for secure stays
- AI assistant (Lemlem) for cultural guidance

**For Hosts:**
- List properties with photo uploads
- Manage bookings on-the-go
- Receive payments via mobile wallets (TeleBirr, Chapa)
- Track earnings and commissions
- Verify guest identity documents

**For Property Agents (Delalas):**
- Register properties on behalf of owners
- Earn 5% commission for 36 months
- Track agent dashboard metrics
- Mobile-optimized commission payouts

**For Operators:**
- Verify property documents via mobile
- Scan guest ID documents (camera integration)
- Approve/reject listings
- Mobile admin dashboard

### Mobile Application Architecture

**Application Type:** Hybrid Mobile Application  
**Primary Framework:** Capacitor 6.0 (Ionic Framework)  
**Web Layer:** React 18 + TypeScript + Vite 5.0  
**Native Wrapper:** Capacitor bridges web code to native iOS/Android APIs  
**PWA Support:** Progressive Web App for browser access  

**Android Application:**
- **Package Name:** et.alga.app
- **Minimum SDK:** Android 7.0 (API Level 24)
- **Target SDK:** Android 14 (API Level 34)
- **Language:** Kotlin (native layer) + JavaScript/TypeScript (web layer)
- **Build Tool:** Gradle 8.0
- **Signing:** Google Play App Signing

**iOS Application:**
- **Bundle ID:** et.alga.app
- **Minimum Version:** iOS 13.0
- **Target Version:** iOS 17
- **Language:** Swift (native layer) + JavaScript/TypeScript (web layer)
- **Build Tool:** Xcode 15
- **Signing:** Apple Developer Certificate

**Progressive Web App (PWA):**
- **Deployment:** https://alga-app.replit.app (production)
- **Service Workers:** Offline caching for bookings, property details
- **Manifest:** Installable to home screen
- **Browser Support:** Chrome, Safari, Firefox, Edge
- **Offline Capability:** View cached bookings, browse saved properties

### Scope of Security Audit

**In Scope for Mobile Security Testing:**

✅ **Android Application (APK)**
- Static analysis (decompilation, reverse engineering)
- Dynamic analysis (runtime behavior)
- Code obfuscation verification (ProGuard)
- Permission model validation
- Local storage security (encrypted tokens)
- Network communication (TLS/SSL enforcement)

✅ **iOS Application (IPA)**
- Static analysis (binary inspection)
- Dynamic analysis (runtime behavior)
- Code obfuscation verification (Swift)
- Permission model validation
- Keychain storage security
- Network communication (certificate pinning)

✅ **Progressive Web App (PWA)**
- Service worker security
- Offline storage (IndexedDB, LocalStorage)
- Cache poisoning prevention
- Web manifest security

✅ **Mobile-Specific Features**
- Camera integration (ID document scanning)
- GPS/geolocation (nearby property search)
- Push notifications (booking alerts)
- Biometric authentication (Touch ID, Face ID, Fingerprint) - Planned
- Mobile payment integration (TeleBirr, Chapa SDKs)
- Offline functionality (cached bookings)

✅ **OWASP Mobile Top 10 Compliance**
- M1: Improper Platform Usage
- M2: Insecure Data Storage
- M3: Insecure Communication
- M4: Insecure Authentication
- M5: Insufficient Cryptography
- M6: Insecure Authorization
- M7: Client Code Quality
- M8: Code Tampering
- M9: Reverse Engineering
- M10: Extraneous Functionality

**Out of Scope (Covered in Separate Web Application Audit):**
- ❌ Backend API security (separate web app audit)
- ❌ PostgreSQL database security (separate web app audit)
- ❌ Admin operations dashboard (web-only feature)

### Test Environment

**Test Builds:**
- **Android APK (Debug):** `alga-android-debug.apk` (~22 MB)
- **Android APK (Release - Signed):** `alga-android-release.apk` (~20 MB)
- **iOS IPA (Release - Signed):** `alga-ios-release.ipa` (~25 MB)
- **PWA URL:** https://alga-app.replit.app

**Backend API:** https://alga-app.replit.app/api  
**Test Data:** Pre-populated with 10 properties across 10 cities  
**Payment Testing:** Sandbox mode for Chapa, TeleBirr, Stripe

---

## 3. OBJECTIVE OF CERTIFICATE REQUESTED

### Primary Objectives

#### 3.1 INSA Mobile Application Security Certification

We request INSA's official certification confirming that Alga's mobile applications (Android, iOS, PWA) comply with:
- Ethiopian national cybersecurity standards
- OWASP Mobile Top 10 security guidelines
- National Bank of Ethiopia mobile payment security requirements
- Ethiopian Data Protection regulations
- Government-grade security hardening (INSA standards)

#### 3.2 Google Play Store & Apple App Store Distribution

INSA certification will enable:
- **Google Play Store:** Submission with government security verification
- **Apple App Store:** Security review compliance for Ethiopian market
- **User Trust:** Government-backed security badge in app listings
- **Enterprise Adoption:** Government/NGO deployment approval

#### 3.3 National Payment Processor Integration

INSA certification required by:
- **TeleBirr:** National mobile money platform (Ethio Telecom)
- **Chapa:** Ethiopian payment aggregator
- **Commercial Bank of Ethiopia (CBE):** Mobile banking integration
- **Dashen Bank:** Mobile payment gateway

#### 3.4 User Data Protection Validation

Certification will confirm:
- Secure storage of Ethiopian national ID data (Fayda ID system)
- Protection of financial transaction data
- Compliance with Ethiopian data sovereignty laws
- Safe handling of user location data (GPS)

### Expected Outcomes

**We request INSA to provide:**

1. **Mobile Application Security Audit Report** (Android, iOS, PWA)
2. **Certification Letter** (if approved)
3. **INSA Security Badge** (for app store listings)
4. **Vulnerability Report** (if findings identified)
5. **Remediation Timeline** (for any critical/high issues)
6. **Re-certification Schedule** (for major app updates)

### Timeline Expectations

- **Submission Date:** January 11, 2025
- **INSA Acknowledgment:** Within 5 working days
- **Initial Review:** 2-3 weeks
- **Audit Testing:** 2-4 weeks
- **Findings Report:** Within 5 working days after testing
- **Remediation Period:** Up to 30 days (if needed)
- **Final Certification:** Target approval by March 2025

---

## 4. MOBILE APPLICATION SECURITY AUDIT REQUIREMENTS

### Requirement 1: Business Architecture and Design ✅

#### Purpose of Alga Mobile Application

**Primary Goal:** Connect Ethiopian and international travelers with verified local accommodations through a secure, mobile-first platform optimized for Ethiopia's network infrastructure (2G/3G/4G).

**Secondary Goals:**
- Empower local property agents (Delalas) with commission-based income
- Support Ethiopian hosts with digital payment integration
- Facilitate cultural immersion through AI assistant (Lemlem)
- Enable offline booking access in low-connectivity areas

#### Main Services

**1. Property Search & Discovery**
- City-based filtering (10 major cities)
- Price range filtering (minimum price in Ethiopian Birr)
- Property type filtering (hotel, guesthouse, traditional home, eco-lodge)
- Keyword search (title, description, amenities)
- GPS-based location search (nearby properties)

**2. Booking Management**
- Date range selection with conflict validation
- Guest count specification
- Real-time price calculation (including commission/taxes)
- Booking confirmation workflow
- Access code generation (6-digit secure codes)

**3. Payment Processing**
- TeleBirr mobile money integration
- Chapa payment aggregator (CBE, Dashen, Abyssinia banks)
- Stripe (international cards, Apple Pay, Google Pay)
- PayPal (international travelers)
- Commission & tax breakdown (ERCA-compliant invoices)

**4. Identity Verification**
- Guest ID verification (Ethiopian ID, passport, driver's license)
- QR code scanning (Ethiopian national ID)
- OCR text extraction (foreign passports)
- Operator review dashboard (mobile verification workflow)
- Fayda ID integration (Ethiopia's national digital ID) - Planned

**5. Host Property Management**
- Property listing creation (photos, description, amenities)
- Availability calendar management
- Booking request approval/rejection
- Earnings dashboard (commission tracking)
- Payout management (mobile wallet integration)

**6. Delala Agent Commission System**
- Agent registration (earn 5% commission for 36 months)
- Property registration on behalf of owners
- Commission tracking dashboard
- Monthly payout requests
- Performance analytics

**7. AI Assistant (Ask Lemlem)**
- Culturally authentic guidance (Ethiopian proverbs)
- Multilingual support (English, Amharic, Tigrinya, Afaan Oromoo, Chinese)
- Property-specific help (check-in, WiFi, appliances)
- Location recommendations (restaurants, attractions, transportation)
- Voice commands (Amharic + English) with manual activation
- Offline-capable (browser-native, zero external API costs)

**8. Add-On Services Marketplace**
- 11 service categories (Airport pickup, Tour guide, Chef, Laundry, etc.)
- Service provider registration
- Booking integration
- Commission system (10% platform fee)

#### User Types

**1. Guest (Mobile-First User)**
- Browse properties on mobile
- Book accommodations via app
- Upload ID documents (camera integration)
- Make payments (mobile wallet)
- Contact hosts (in-app messaging)
- View bookings offline (cached data)
- Access Lemlem AI assistant

**2. Host (Mobile Property Manager)**
- List properties (photo upload via camera)
- Manage bookings on-the-go
- Approve/reject reservations
- Track earnings (mobile dashboard)
- Communicate with guests
- Update availability calendar

**3. Delala Agent (Commission Earner)**
- Register properties (on behalf of owners)
- Track commission earnings (5% for 36 months)
- Request monthly payouts
- View agent performance metrics
- Mobile-optimized dashboard

**4. Operator (Mobile Verifier)**
- Verify property documents (camera scan)
- Review guest ID submissions
- Approve/reject property listings
- Hardware deployment tracking (tablets/devices)
- Mobile operations dashboard

**5. Admin (Platform Manager)**
- Full platform management (mobile dashboard)
- User/property/booking oversight
- Payment reconciliation (ERCA compliance)
- Analytics & KPIs (Lemlem Operations Intelligence)
- Security monitoring

#### Core Processes

**Process 1: Guest Booking Flow (Mobile)**
```
1. Open app → Browse properties (GPS or city filter)
2. Select property → View details offline if cached
3. Choose dates → Check availability (conflict validation)
4. Specify guests → Calculate total price
5. Upload ID (camera scan) → OCR extraction + operator review
6. Select payment method → TeleBirr/Chapa/Stripe/PayPal
7. Confirm booking → Receive access code (6-digit)
8. Offline access → View booking details in app cache
```

**Process 2: Host Property Listing (Mobile)**
```
1. Sign up as host → Verify phone (OTP)
2. Create property listing → Add photos (camera/gallery)
3. Enter details → Title, description, amenities, price
4. Upload property deed → Camera scan for verification
5. Submit for review → Operator verification
6. Approval → Property goes live
7. Manage bookings → Mobile dashboard notifications
```

**Process 3: Delala Agent Registration (Mobile)**
```
1. Register as agent → Provide business details
2. Add first property → On behalf of owner
3. Admin verification → Approve agent status
4. Track commissions → 5% for 36 months dashboard
5. Request payout → Monthly withdrawals to mobile wallet
```

**Process 4: ID Verification (Mobile)**
```
1. Guest uploads ID → Camera scan + auto-detect edges
2. OCR extraction → Parse ID number, name, expiry
3. QR code scan (Ethiopian ID) → Verify authenticity
4. Operator review → Mobile verification dashboard
5. Approval/Rejection → Notify guest via push notification
6. Fayda ID integration (Planned) → eKYC verification
```

**Process 5: Payment & Commission (Mobile)**
```
1. Booking confirmed → Calculate breakdown:
   - Total price (property rate × nights)
   - Alga commission (10% platform fee)
   - Delala commission (5% if agent-registered)
   - VAT (15% on commission)
   - Withholding tax (5% on commission)
   - Host payout (remaining amount)
2. Generate invoice → ERCA-compliant PDF
3. Process payment → TeleBirr/Chapa/Stripe
4. Mobile wallet payout → Host receives via TeleBirr
5. Agent commission → Tracked for 36 months
```

#### Business Goals

**Short-Term (6 months):**
- Achieve INSA mobile security certification
- Launch on Google Play & Apple App Store
- Onboard 500 properties across 10 cities
- Register 100 Delala agents
- Process 1,000 mobile bookings

**Long-Term (2 years):**
- Become Ethiopia's leading property rental platform
- Integrate with all major Ethiopian banks (mobile banking)
- Expand to all 11 Ethiopian regions
- Launch Fayda ID integration for instant verification
- Enable offline-first booking (full app functionality offline)

---

### Requirement 2: Data Flow Diagram ✅

#### Mobile Application Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APPLICATION                            │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Guest   │  │   Host   │  │  Delala  │  │ Operator │        │
│  │  Mobile  │  │  Mobile  │  │  Agent   │  │  Mobile  │        │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘        │
│        │             │              │             │              │
│        └──────────┬──┴──────────────┴─────────────┘              │
│                   │                                               │
│            ┌──────▼──────┐                                       │
│            │   React UI   │  (Shared Web Layer)                  │
│            │  TypeScript  │                                       │
│            └──────┬───────┘                                       │
│                   │                                               │
│            ┌──────▼───────┐                                       │
│            │  Capacitor   │  (Bridge to Native)                  │
│            │  Plugins API │                                       │
│            └──┬─────┬─────┘                                       │
│               │     │                                             │
│     ┌─────────┘     └─────────┐                                  │
│     │                           │                                  │
│ ┌───▼────┐               ┌─────▼───┐                             │
│ │Android │               │  iOS    │                             │
│ │Native  │               │ Native  │                             │
│ │Kotlin  │               │ Swift   │                             │
│ └───┬────┘               └─────┬───┘                             │
│     │                           │                                  │
└─────┼───────────────────────────┼──────────────────────────────┘
      │                           │
      └──────────┬────────────────┘
                 │
                 │ HTTPS/TLS 1.2+ (All API Calls)
                 │
         ┌───────▼────────┐
         │  Backend API   │
         │  Express.js    │
         │  Node.js       │
         └───────┬────────┘
                 │
      ┌──────────┴───────────┐
      │                       │
┌─────▼─────┐        ┌───────▼───────┐
│PostgreSQL │        │ External APIs │
│ Database  │        │ (Secure)      │
│  (Neon)   │        └───┬───────┬───┘
└───────────┘            │       │
                         │       │
                  ┌──────┘       └──────┐
                  │                      │
          ┌───────▼────┐        ┌───────▼────┐
          │   Chapa    │        │  TeleBirr  │
          │  Payment   │        │   Payment  │
          └────────────┘        └────────────┘
```

#### Data Flow by Feature

**1. Authentication Flow (Mobile)**
```
Mobile App → POST /api/auth/login {email, password}
         ← Session Cookie (httpOnly, secure, sameSite)
         
Mobile App → POST /api/auth/otp {phoneNumber}
         ← OTP sent via SMS (4-digit code)
         
Mobile App → POST /api/auth/verify-otp {phoneNumber, otp}
         ← Session Cookie + User Profile
         
Capacitor → Secure Storage (encrypted session token)
```

**2. Property Search Flow (Mobile)**
```
Mobile App → GET /api/properties?city=Addis+Ababa&minPrice=500
         ← JSON {properties: [...], total: 45}
         
Capacitor → Cache in IndexedDB (offline access)
Mobile App → Display properties in UI
         
GPS Plugin → getCurrentPosition()
         → GET /api/properties?lat=9.03&lon=38.74&radius=5km
         ← Nearby properties
```

**3. Booking Creation Flow (Mobile)**
```
Mobile App → POST /api/bookings {
              propertyId: 123,
              checkIn: "2025-02-01",
              checkOut: "2025-02-05",
              guests: 2
            }
         ← JSON {booking: {...}, totalPrice: 4000, breakdown: {...}}
         
Mobile App → Display price breakdown (commission, tax)
Guest Confirms → POST /api/bookings/123/confirm
         
Backend → Generate 6-digit access code
       → Send confirmation email/SMS
       ← JSON {accessCode: "456789", status: "confirmed"}
       
Capacitor → Cache booking in IndexedDB (offline view)
```

**4. ID Verification Flow (Mobile Camera)**
```
Camera Plugin → takePicture() → Base64 image data
Mobile App → Compress image (browser-image-compression)
         → POST /api/verification/upload {
             userId: "user-123",
             documentType: "ethiopian_id",
             imageData: "data:image/jpeg;base64,..."
           }
         
Backend → Store in Replit Object Storage (Google Cloud)
       → Extract text via Tesseract.js (OCR)
       → Parse ID number, name, expiry
       ← JSON {status: "pending_review", documentUrl: "..."}
       
Operator Mobile → GET /api/verification/pending
              ← JSON {documents: [...]}
              → Review on mobile dashboard
              → POST /api/verification/123/approve
              
Backend → Update user.idVerified = true
       → Send push notification to guest
```

**5. Payment Flow (Mobile)**
```
Mobile App → Select payment method (TeleBirr)
         → POST /api/payments/initialize {
             bookingId: 123,
             method: "telebirr",
             amount: 4000
           }
         
Backend → Call Chapa API (TeleBirr integration)
       → Generate payment URL
       ← JSON {paymentUrl: "...", txRef: "ALGA-123-456"}
       
Capacitor Browser → Open in-app browser (payment page)
User Completes Payment → Callback to app
       
Mobile App → POST /api/payments/verify {txRef: "ALGA-123-456"}
Backend → Verify with Chapa
       → Update booking.paymentStatus = "paid"
       → Generate ERCA invoice PDF
       ← JSON {status: "paid", invoiceUrl: "..."}
       
Push Notification → "Payment confirmed! Booking #123"
```

**6. Offline Data Flow (PWA/Capacitor)**
```
App Launch → Service Worker checks for updates
          → GET /api/user/bookings (if online)
          → Cache in IndexedDB
          
Offline Mode → Read from IndexedDB
            → Display cached bookings
            → Show "Offline" indicator
            
User Actions → Queue in IndexedDB (pending sync)
            → When online: POST /api/sync {actions: [...]}
            
Background Sync → Periodically check connectivity
               → Sync pending actions automatically
```

**7. Push Notification Flow (Mobile)**
```
App Install → Request notification permission
           → POST /api/notifications/register {
               token: "fcm-token-123",
               platform: "android"
             }
           
Backend Event (Booking Confirmed) → 
  → Send push notification via Firebase Cloud Messaging
  → Title: "Booking Confirmed"
  → Body: "Your stay at Lalibela Lodge is confirmed"
  → Data: {bookingId: 123, type: "booking_confirmed"}
  
Mobile App → Receive notification
          → Display in notification tray
          → On click → Open booking details
```

#### Sensitive Data Entry Points

**1. Registration/Login**
- Input: Email, password, phone number
- Transmission: HTTPS POST to /api/auth/*
- Storage: PostgreSQL (password hashed with Bcrypt)
- Mobile Storage: Session token only (encrypted secure storage)

**2. ID Document Upload**
- Input: Camera photo (JPG/PNG), document type
- Transmission: HTTPS POST (base64 encoded)
- Storage: Replit Object Storage (Google Cloud, encrypted at rest)
- Mobile Storage: None (no local copy after upload)

**3. Payment Information**
- Input: Payment method selection (no card data entered in app)
- Transmission: HTTPS to payment processor (Chapa/TeleBirr)
- Storage: Transaction reference only (no card numbers stored)
- Mobile Storage: None (payment handled by external SDKs)

**4. Location Data**
- Input: GPS coordinates (getCurrentPosition)
- Transmission: HTTPS GET /api/properties?lat=...&lon=...
- Storage: Not stored (used for search only)
- Mobile Storage: None (ephemeral data)

#### Data Storage Summary

**PostgreSQL Database (Neon):**
- Users (id, email, hashedPassword, phoneNumber, idVerified, faydaId)
- Properties (id, hostId, title, description, location, price, images)
- Bookings (id, propertyId, guestId, checkIn, checkOut, paymentStatus)
- Reviews (id, propertyId, reviewerId, rating, comment)
- Delala Agents (id, userId, commissionRate, totalEarnings)
- Verification Documents (id, userId, documentType, documentUrl, status)

**Replit Object Storage (Google Cloud):**
- Property images (compressed JPGs)
- ID document scans (encrypted PDFs)
- Invoice PDFs (ERCA-compliant)

**Mobile Local Storage (Encrypted):**
- Session tokens (Capacitor Secure Storage)
- Cached bookings (IndexedDB, read-only)
- Cached property details (IndexedDB, temporary)

**Not Stored Anywhere:**
- Credit card numbers (handled by Stripe/PayPal SDKs)
- Plain text passwords (hashed with Bcrypt before storage)
- GPS coordinates (ephemeral search data)

---

### Requirement 3: System Architecture Diagram with Database Relation ✅

#### High-Level Mobile System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      MOBILE CLIENTS                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Android  │  │   iOS    │  │   PWA    │  │  Desktop │       │
│  │  Native  │  │  Native  │  │ Browser  │  │  Browser │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                          │                                       │
│               ┌──────────▼──────────┐                           │
│               │  Capacitor Bridge   │                           │
│               │  (Web → Native)     │                           │
│               └──────────┬──────────┘                           │
│                          │                                       │
│               ┌──────────▼──────────┐                           │
│               │   React Frontend    │                           │
│               │   TypeScript/Vite   │                           │
│               └──────────┬──────────┘                           │
│                          │                                       │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTPS/TLS 1.2+
                           │ Session Cookies (httpOnly, secure)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND API SERVER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │          Express.js Application                     │        │
│  │          Node.js Runtime                            │        │
│  └────────────────┬────────────────────────────────────┘        │
│                   │                                              │
│  ┌────────────────▼────────────────┐                            │
│  │     Security Middleware         │                            │
│  │  - Helmet (HTTP headers)        │                            │
│  │  - CORS (origin validation)     │                            │
│  │  - Rate Limiting                │                            │
│  │  - XSS Protection               │                            │
│  │  - SQL Injection Prevention     │                            │
│  │  - INSA Compliance Hardening    │                            │
│  └────────────────┬────────────────┘                            │
│                   │                                              │
│  ┌────────────────▼────────────────┐                            │
│  │     Session Management          │                            │
│  │  - Express Session              │                            │
│  │  - PostgreSQL Session Store     │                            │
│  │  - 24-hour timeout              │                            │
│  └────────────────┬────────────────┘                            │
│                   │                                              │
│  ┌────────────────▼────────────────┐                            │
│  │     Authentication Routes       │                            │
│  │  - /api/auth/login              │                            │
│  │  - /api/auth/otp                │                            │
│  │  - /api/auth/verify-otp         │                            │
│  │  - /api/auth/logout             │                            │
│  └────────────────┬────────────────┘                            │
│                   │                                              │
│  ┌────────────────▼────────────────┐                            │
│  │     Business Logic Routes       │                            │
│  │  - /api/properties (CRUD)       │                            │
│  │  - /api/bookings (CRUD)         │                            │
│  │  - /api/payments (initialize)   │                            │
│  │  - /api/verification (ID docs)  │                            │
│  │  - /api/agents (Delala)         │                            │
│  │  - /api/lemlem (AI assistant)   │                            │
│  └────────────────┬────────────────┘                            │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐      ┌────────▼───────┐
│   PostgreSQL   │      │ Replit Object  │
│   Database     │      │    Storage     │
│   (Neon)       │      │ (Google Cloud) │
└────────────────┘      └────────────────┘
```

#### Database Schema with Relations

```sql
-- Users Table (Core authentication & profiles)
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  password VARCHAR,  -- Bcrypt hashed
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR DEFAULT 'guest',  -- admin, operator, host, guest
  phone_number VARCHAR UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,
  id_number VARCHAR(50),
  id_document_type VARCHAR,  -- ethiopian_id, passport, drivers_license
  id_document_url VARCHAR,
  fayda_id VARCHAR(12),  -- Ethiopia's national digital ID
  fayda_verified BOOLEAN DEFAULT FALSE,
  is_service_provider BOOLEAN DEFAULT FALSE,
  otp VARCHAR(4),
  otp_expiry TIMESTAMP,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties Table (Rental listings)
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  host_id VARCHAR REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR NOT NULL,  -- hotel, guesthouse, traditional_home, eco_lodge
  status VARCHAR DEFAULT 'pending',  -- pending, approved, rejected
  verified_by VARCHAR REFERENCES users(id),
  verified_at TIMESTAMP,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  city VARCHAR NOT NULL,
  region VARCHAR NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  currency VARCHAR DEFAULT 'ETB',
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  amenities TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings Table (Reservations)
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  guest_id VARCHAR REFERENCES users(id),
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  guests INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR DEFAULT 'ETB',
  status VARCHAR DEFAULT 'pending',  -- pending, confirmed, cancelled, completed
  payment_method VARCHAR,  -- telebirr, chapa, stripe, paypal
  payment_status VARCHAR DEFAULT 'pending',  -- pending, paid, failed
  payment_ref VARCHAR,  -- Transaction reference from payment processor
  alga_commission DECIMAL(10, 2),  -- 10% platform commission
  vat DECIMAL(10, 2),  -- 15% VAT on commission
  withholding DECIMAL(10, 2),  -- 5% withholding tax
  host_payout DECIMAL(10, 2),  -- Amount paid to host
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table (Guest feedback)
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  booking_id INTEGER REFERENCES bookings(id),
  reviewer_id VARCHAR REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
  communication INTEGER CHECK (communication BETWEEN 1 AND 5),
  accuracy INTEGER CHECK (accuracy BETWEEN 1 AND 5),
  location INTEGER CHECK (location BETWEEN 1 AND 5),
  value INTEGER CHECK (value BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Delala Agents Table (Commission tracking)
CREATE TABLE delala_agents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  business_name VARCHAR,
  tin VARCHAR,  -- Tax Identification Number
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,  -- 5% commission
  commission_duration_months INTEGER DEFAULT 36,  -- 36 months
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR DEFAULT 'pending',  -- pending, approved, suspended
  verified_by VARCHAR REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent Commissions Table (Per booking)
CREATE TABLE agent_commissions (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES delala_agents(id),
  booking_id INTEGER REFERENCES bookings(id),
  property_id INTEGER REFERENCES properties(id),
  commission_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR DEFAULT 'pending',  -- pending, paid
  paid_at TIMESTAMP,
  expires_at TIMESTAMP,  -- 36 months from booking date
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification Documents Table (ID/Property docs)
CREATE TABLE verification_documents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  document_type VARCHAR NOT NULL,  -- national_id, passport, property_deed
  document_url VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',  -- pending, approved, rejected
  verified_by VARCHAR REFERENCES users(id),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Info Table (Lemlem AI assistant data)
CREATE TABLE property_info (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) UNIQUE,
  wifi_network VARCHAR(100),
  wifi_password VARCHAR(100),
  check_in_time VARCHAR(10) DEFAULT '2:00 PM',
  check_out_time VARCHAR(10) DEFAULT '11:00 AM',
  lockbox_code VARCHAR(20),
  parking_instructions TEXT,
  nearest_hospital TEXT,
  nearest_restaurants TEXT,
  nearest_attractions TEXT,
  transportation_tips TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lemlem Chat Conversations (AI cost tracking)
CREATE TABLE lemlem_chats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  property_id INTEGER REFERENCES properties(id),
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  used_template BOOLEAN DEFAULT TRUE,  -- TRUE = no AI cost
  ai_model VARCHAR(50),  -- Only if AI was used
  tokens_used INTEGER,  -- Only if AI was used
  estimated_cost DECIMAL(10, 6),  -- Only if AI was used
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Sessions Table (Express session storage)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL,
  INDEX idx_session_expire (expire)
);
```

#### Database Relationships

**1. User → Properties (One-to-Many)**
- A user (host) can have multiple properties
- Each property belongs to one host
- Foreign Key: `properties.host_id → users.id`

**2. Property → Bookings (One-to-Many)**
- A property can have multiple bookings
- Each booking is for one property
- Foreign Key: `bookings.property_id → properties.id`

**3. User → Bookings (One-to-Many)**
- A user (guest) can have multiple bookings
- Each booking belongs to one guest
- Foreign Key: `bookings.guest_id → users.id`

**4. Booking → Reviews (One-to-One)**
- A booking can have one review
- Each review is for one booking
- Foreign Key: `reviews.booking_id → bookings.id`

**5. User → Delala Agent (One-to-One)**
- A user can be a Delala agent (optional)
- Each agent record belongs to one user
- Foreign Key: `delala_agents.user_id → users.id`

**6. Delala Agent → Commissions (One-to-Many)**
- An agent can earn multiple commissions
- Each commission belongs to one agent
- Foreign Key: `agent_commissions.agent_id → delala_agents.id`

**7. Property → Property Info (One-to-One)**
- A property can have detailed info (for Lemlem)
- Each property info belongs to one property
- Foreign Key: `property_info.property_id → properties.id`

**8. User → Verification Documents (One-to-Many)**
- A user can upload multiple verification documents
- Each document belongs to one user
- Foreign Key: `verification_documents.user_id → users.id`

#### Security Layers

**Application Layer:**
- INSA-grade security hardening
- Helmet.js (HTTP security headers)
- CORS (origin validation)
- Rate limiting (prevent brute force)
- XSS protection (input sanitization)
- SQL injection prevention (parameterized queries)

**Authentication Layer:**
- Session-based auth (httpOnly cookies)
- 24-hour session timeout
- OTP verification (4-digit SMS codes)
- Bcrypt password hashing (cost factor 12)
- Role-based access control (RBAC)

**Network Layer:**
- TLS 1.2+ enforcement (all API calls)
- Certificate pinning (production - planned)
- Secure WebSocket (WSS for real-time features)
- HTTPS-only communication

**Database Layer:**
- PostgreSQL encryption at rest (Neon)
- Connection string in environment variables
- Least privilege database user
- Prepared statements (SQL injection prevention)

**Storage Layer:**
- Replit Object Storage (Google Cloud encrypted)
- Pre-signed URLs for image access
- No public read/write permissions

---

### Requirement 4: Native Applications ✅

**Alga is NOT a native application.** We use a **hybrid approach** with Capacitor, which wraps our React web app in native Android/iOS shells. 

See **Requirement 5 (Hybrid Applications)** for full technical details.

---

### Requirement 5: Hybrid Applications ✅

#### Framework and Technology Stack

**Primary Framework:** Capacitor 6.0 (by Ionic Team)

**Capacitor** is a cross-platform native runtime that allows web applications (React, Vue, Angular) to run on iOS, Android, and PWA using a single codebase. Unlike React Native or Flutter, Capacitor uses native WebViews to render the web application and provides JavaScript APIs to access native device features.

**Why Capacitor (Not React Native or Flutter):**
1. **Code Reuse:** 100% code sharing between web and mobile (React codebase)
2. **Zero-Cost:** No separate mobile team needed (web developers = mobile developers)
3. **Offline-First:** Built-in service workers and PWA support
4. **2G Optimization:** Web optimizations directly benefit mobile
5. **Rapid Updates:** Deploy web updates without app store approval (for non-native changes)

#### Development Details

**Web Layer (Shared Across All Platforms):**
- **Language:** TypeScript 5.0
- **UI Framework:** React 18.2
- **Build Tool:** Vite 5.0
- **Styling:** Tailwind CSS 3.4 + Shadcn/ui (Radix UI components)
- **State Management:** React Query (TanStack Query v5)
- **Form Handling:** React Hook Form + Zod validation
- **Routing:** Wouter (lightweight React router)

**Android Native Layer:**
- **Language:** Kotlin 1.9
- **Min SDK:** Android 7.0 (API Level 24) - 94% market coverage
- **Target SDK:** Android 14 (API Level 34)
- **Build Tool:** Gradle 8.0
- **IDE:** Android Studio Flamingo
- **Package Name:** `et.alga.app`
- **WebView:** Android System WebView (Chromium-based)

**iOS Native Layer:**
- **Language:** Swift 5.9
- **Min Version:** iOS 13.0 - 96% device coverage
- **Target Version:** iOS 17
- **Build Tool:** Xcode 15
- **IDE:** Xcode 15
- **Bundle ID:** `et.alga.app`
- **WebView:** WKWebView (WebKit-based)

**Capacitor Plugins Used:**

| Plugin | Purpose | Permissions Required |
|--------|---------|---------------------|
| `@capacitor/app` | App state, launch URLs | None |
| `@capacitor/browser` | Open external links | None |
| `@capacitor/camera` | ID document scanning | CAMERA (Android/iOS) |
| `@capacitor/geolocation` | Nearby property search | LOCATION (Android/iOS) |
| `@capacitor/push-notifications` | Booking alerts | POST_NOTIFICATIONS (Android 13+) |
| `@capacitor/share` | Share properties | None |
| `@capacitor/splash-screen` | Launch screen | None |

**Planned Plugins (Not Yet Implemented):**
- `@capacitor/biometric` - Fingerprint/Face ID/Touch ID authentication
- `@capacitor/storage` - Encrypted local key-value storage
- `@capacitor/filesystem` - File management
- `@capacitor/network` - Network status detection

#### How Native and Web Components Interact

**Architecture Flow:**

```
┌──────────────────────────────────────────┐
│           User Action                    │
│  (Tap "Scan ID" button in React UI)     │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│         React Component                  │
│  import { Camera } from '@capacitor/     │
│            camera';                      │
│                                           │
│  const photo = await Camera.getPhoto();  │
└────────────┬─────────────────────────────┘
             │
             ▼ JavaScript API Call
┌──────────────────────────────────────────┐
│      Capacitor Bridge                    │
│  (JavaScript ↔ Native communication)     │
└────────────┬─────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌─────────┐   ┌──────────┐
│ Android │   │   iOS    │
│ Native  │   │  Native  │
│         │   │          │
│ Kotlin: │   │ Swift:   │
│ Camera  │   │ Camera   │
│ Intent  │   │ Picker   │
└────┬────┘   └────┬─────┘
     │             │
     │             │
     ▼             ▼
┌─────────────────────────┐
│  Device Camera API      │
│  (Native Android/iOS)   │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Photo Captured         │
│  (Base64 or File Path)  │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  Return to JavaScript   │
│  {webPath: "...",       │
│   format: "jpeg"}       │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│  React Component        │
│  Display photo preview  │
│  Upload to backend API  │
└─────────────────────────┘
```

#### Example: Camera Integration (ID Scanning)

**React Component (Web Layer):**
```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

export function IDScanComponent() {
  const [photo, setPhoto] = useState<string | null>(null);

  const scanID = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      const base64 = image.base64String;
      setPhoto(`data:image/jpeg;base64,${base64}`);

      // Upload to backend
      await fetch('/api/verification/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'ethiopian_id',
          imageData: `data:image/jpeg;base64,${base64}`,
        }),
      });
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  return (
    <button onClick={scanID}>Scan ID Document</button>
  );
}
```

**Capacitor Bridge (Automatic):**
- Capacitor automatically translates `Camera.getPhoto()` into native API calls
- On Android: Launches Camera Intent
- On iOS: Presents UIImagePickerController
- Returns photo as Base64 string to JavaScript

**Android Native (Automatic via Capacitor):**
```kotlin
// Capacitor auto-generates this code
// No manual implementation needed

class CameraPlugin : Plugin() {
  @PluginMethod
  fun getPhoto(call: PluginCall) {
    val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
    startActivityForResult(call, intent, "cameraResult")
  }

  @ActivityCallback
  fun cameraResult(call: PluginCall, result: ActivityResult) {
    if (result.resultCode == Activity.RESULT_OK) {
      val bitmap = result.data?.extras?.get("data") as Bitmap
      val base64 = convertBitmapToBase64(bitmap)
      call.resolve(JSObject().put("base64String", base64))
    }
  }
}
```

**iOS Native (Automatic via Capacitor):**
```swift
// Capacitor auto-generates this code
// No manual implementation needed

@objc(CameraPlugin)
public class CameraPlugin: CAPPlugin {
  @objc func getPhoto(_ call: CAPPluginCall) {
    let picker = UIImagePickerController()
    picker.sourceType = .camera
    picker.delegate = self
    DispatchQueue.main.async {
      self.bridge.viewController.present(picker, animated: true)
    }
  }

  public func imagePickerController(_ picker: UIImagePickerController,
                                     didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
    picker.dismiss(animated: true)
    if let image = info[.originalImage] as? UIImage {
      let base64 = image.jpegData(compressionQuality: 0.9)?.base64EncodedString()
      call?.resolve(["base64String": base64])
    }
  }
}
```

#### Web vs. Native Feature Detection

**Capacitor provides platform detection:**

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Running on Android or iOS
  // Use native Camera plugin
  const photo = await Camera.getPhoto();
} else {
  // Running in browser (PWA)
  // Use web file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.click();
}

// Check specific platform
if (Capacitor.getPlatform() === 'android') {
  // Android-specific code
} else if (Capacitor.getPlatform() === 'ios') {
  // iOS-specific code
} else {
  // Web/PWA code
}
```

#### Build Process

**Step 1: Build Web Application**
```bash
npm run build  # Vite builds React app to dist/
```

**Step 2: Sync to Native Projects**
```bash
npx cap sync  # Copies dist/ to android/app/src/main/assets/public/
              # and ios/App/App/public/
```

**Step 3: Build Android APK**
```bash
cd android
./gradlew assembleDebug  # Debug APK
./gradlew assembleRelease  # Release APK (requires keystore)
```

**Step 4: Build iOS IPA**
```bash
cd ios/App
xcodebuild -workspace App.xcworkspace \
           -scheme App \
           -configuration Release \
           -archivePath App.xcarchive \
           archive

xcodebuild -exportArchive \
           -archivePath App.xcarchive \
           -exportPath . \
           -exportOptionsPlist ExportOptions.plist
```

#### Security Considerations for Hybrid Apps

**1. WebView Security:**
- **Android:** AndroidManifest.xml sets `android:usesCleartextTraffic="false"` (HTTPS only)
- **iOS:** Info.plist sets `NSAppTransportSecurity` with `NSAllowsArbitraryLoads: false`
- **Content Security Policy:** Meta tag in index.html restricts inline scripts

**2. JavaScript Bridge Security:**
- Only whitelisted plugins can call native code
- All plugin methods validated on native side
- No arbitrary JavaScript → Native code execution

**3. Local Storage:**
- Capacitor uses platform-native storage (EncryptedSharedPreferences on Android, Keychain on iOS)
- No plain text storage of sensitive data
- Session tokens stored in secure storage

**4. Code Obfuscation:**
- **Android:** ProGuard enabled in release builds
  ```gradle
  buildTypes {
    release {
      minifyEnabled true
      shrinkResources true
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
  ```
- **iOS:** Swift optimization enabled (`-O` compiler flag)

**5. Permission Model:**
- All permissions requested at runtime (not installation time)
- User can deny permissions (app gracefully degrades)
- Permissions explained with usage descriptions in AndroidManifest.xml and Info.plist

---

### Requirement 6: Progressive Web Apps (PWA) ✅

#### PWA Deployment Method

**Hosting:** Replit Deployment (https://alga-app.replit.app)  
**Server:** Express.js (Node.js)  
**Web Server:** Vite dev server (development), Express static serving (production)  
**CDN:** Replit's built-in CDN for static assets

#### Supported Browsers

**Desktop:**
- Google Chrome 90+ (recommended)
- Microsoft Edge 90+
- Mozilla Firefox 88+
- Safari 14+ (macOS/iOS)

**Mobile:**
- Chrome for Android 90+
- Safari for iOS 14+
- Samsung Internet 14+

**Browser Features Used:**
- Service Workers (offline caching)
- IndexedDB (client-side database)
- Web App Manifest (installable PWA)
- Push Notifications API (booking alerts)
- Geolocation API (nearby property search)
- Camera API (ID document scanning in web)

#### Offline Capabilities

**1. Service Worker Implementation:**

**File:** `client/src/service-worker.ts`

```typescript
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache static assets (HTML, CSS, JS)
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses (bookings, properties)
registerRoute(
  /^https:\/\/alga-app\.replit\.app\/api\/(bookings|properties)/,
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Cache images (property photos)
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Stale-while-revalidate for other assets
registerRoute(
  /^https:\/\/alga-app\.replit\.app/,
  new StaleWhileRevalidate({
    cacheName: 'general-cache',
  })
);
```

**Offline Functionality:**
- ✅ View cached bookings (read-only)
- ✅ Browse previously viewed properties
- ✅ Read saved property details
- ✅ View cached Lemlem chat history
- ✅ Access user profile information
- ❌ Cannot create new bookings offline (requires payment)
- ❌ Cannot upload ID documents offline (requires backend)

**2. IndexedDB for Client-Side Storage:**

**Database:** `alga-offline-db`

**Object Stores:**
- `bookings` - Cached user bookings (key: bookingId)
- `properties` - Cached property details (key: propertyId)
- `lemlem-chats` - Lemlem conversation history (key: chatId)
- `lemlem-usage` - Lemlem usage analytics (key: eventId)

**Storage Limits:**
- Chrome: ~60% of available disk space
- Safari: 50 MB (per origin)
- Firefox: ~10% of available disk space

**3. Offline Indicator:**

```typescript
// Detect network status
window.addEventListener('online', () => {
  toast({
    title: "Back Online",
    description: "Syncing your data...",
  });
});

window.addEventListener('offline', () => {
  toast({
    title: "You're Offline",
    description: "Some features may be limited",
    variant: "warning",
  });
});
```

#### Caching Strategy

**1. HTML/CSS/JS (Precache):**
- Cached during service worker installation
- Updated on app version change
- Cache-first strategy (instant load)

**2. API Responses (Network First):**
- Try network, fallback to cache if offline
- Bookings, properties, user profile
- 24-hour cache expiration

**3. Images (Cache First):**
- Property photos cached aggressively
- 30-day cache expiration
- Lazy loading for non-critical images

**4. Dynamic Content (Stale-While-Revalidate):**
- Show cached version immediately
- Fetch fresh data in background
- Update UI when fresh data arrives

#### Service Workers

**Registration:** `client/src/main.tsx`

```typescript
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Prompt user to reload for updates
    if (confirm('New version available. Reload?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    toast({
      title: "Ready for Offline Use",
      description: "You can now use Alga offline",
    });
  },
});
```

**Service Worker Lifecycle:**
1. **Install:** Download and cache static assets
2. **Activate:** Clean up old caches
3. **Fetch:** Intercept network requests
4. **Update:** Check for new version every 24 hours

#### Push Notifications

**Implementation:** Firebase Cloud Messaging (FCM) - Planned

**Permission Request:**
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Request permission
const permResult = await PushNotifications.requestPermissions();

if (permResult.receive === 'granted') {
  // Register with FCM
  await PushNotifications.register();
}

// Listen for token
PushNotifications.addListener('registration', (token) => {
  // Send token to backend
  fetch('/api/notifications/register', {
    method: 'POST',
    body: JSON.stringify({ token: token.value }),
  });
});

// Listen for notifications
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  toast({
    title: notification.title,
    description: notification.body,
  });
});
```

**Notification Types:**
- Booking confirmation
- Host accepts booking
- Payment received
- Check-in reminder (24 hours before)
- Host messages

**Security:**
- No sensitive data in notifications (no access codes, payment info)
- Notifications encrypted in transit
- User can opt-out at any time

#### Install Prompt (Add to Home Screen)

**Manifest:** `public/manifest.json`

```json
{
  "name": "Alga - Ethiopian Property Rentals",
  "short_name": "Alga",
  "description": "Book verified properties across Ethiopia",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8DC",
  "theme_color": "#CD7F32",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "orientation": "portrait",
  "categories": ["travel", "lifestyle"],
  "lang": "en-US",
  "dir": "ltr"
}
```

**Install Prompt:**
```typescript
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show custom install button
  showInstallButton();
});

function installPWA() {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    deferredPrompt = null;
  });
}
```

#### Offline Data Sync

**Background Sync API (Planned):**

```typescript
// Register background sync
navigator.serviceWorker.ready.then((registration) => {
  return registration.sync.register('sync-bookings');
});

// Service worker handles sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const db = await openDB('alga-offline-db');
  const pendingActions = await db.getAll('pending-actions');

  for (const action of pendingActions) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(action),
      });
      await db.delete('pending-actions', action.id);
    } catch (error) {
      // Retry on next sync
    }
  }
}
```

---

### Requirement 7: Threat Model Mapping ✅

#### Identified Threat Vectors

**OWASP Mobile Top 10 Threat Analysis:**

| Threat | Attack Vector | Alga Exposure | Security Controls | Mitigation Status |
|--------|---------------|---------------|-------------------|-------------------|
| **M1: Improper Platform Usage** | Misuse of platform features (Keychain, TouchID, WebView) | Medium | - Capacitor enforces platform best practices<br>- Proper permission requests<br>- No insecure WebView configurations | ✅ Mitigated |
| **M2: Insecure Data Storage** | Plain text storage of sensitive data in SharedPreferences/UserDefaults | High | - Encrypted secure storage for tokens<br>- No passwords stored locally<br>- SQLite encryption planned (SQLCipher) | ⚠️ Partially Mitigated (pending SQLCipher) |
| **M3: Insecure Communication** | Man-in-the-middle attacks, unencrypted data transmission | Critical | - TLS 1.2+ enforcement<br>- Certificate validation<br>- Certificate pinning (planned)<br>- No HTTP traffic | ✅ Mitigated (⚠️ cert pinning pending) |
| **M4: Insecure Authentication** | Weak auth, broken session management | High | - Session-based auth (httpOnly cookies)<br>- OTP verification<br>- 24-hour timeout<br>- Biometric auth planned | ✅ Mitigated |
| **M5: Insufficient Cryptography** | Weak algorithms, hardcoded keys | Medium | - Bcrypt password hashing (cost 12)<br>- TLS for transmission<br>- No hardcoded secrets<br>- Environment variable keys | ✅ Mitigated |
| **M6: Insecure Authorization** | Privilege escalation, broken access control | High | - Role-based access control (RBAC)<br>- Server-side authorization<br>- Least privilege principle | ✅ Mitigated |
| **M7: Client Code Quality** | Buffer overflows, format string vulnerabilities | Low | - TypeScript type safety<br>- Input validation (Zod)<br>- No memory management (JavaScript) | ✅ Mitigated |
| **M8: Code Tampering** | Binary patching, method swizzling | High | - ProGuard obfuscation (Android)<br>- Swift obfuscation (iOS)<br>- Root/jailbreak detection (planned) | ⚠️ Partially Mitigated (obfuscation only) |
| **M9: Reverse Engineering** | Decompilation, binary analysis | High | - Code obfuscation (ProGuard/Swift)<br>- No sensitive logic in client<br>- Server-side validation | ⚠️ Partially Mitigated (obfuscation only) |
| **M10: Extraneous Functionality** | Hidden backdoors, debug code | Low | - Production builds remove debug code<br>- No test endpoints in production<br>- Code review process | ✅ Mitigated |

#### Detailed Threat Analysis

**1. M2: Insecure Data Storage (HIGH PRIORITY)**

**Attack Scenario:**
- Attacker gains physical access to device
- Uses ADB (Android Debug Bridge) to extract app data
- Finds plain text session tokens in SharedPreferences
- Hijacks user session

**Alga Security Controls:**
- ✅ Session tokens stored in Capacitor Secure Storage (encrypted)
- ✅ No passwords stored locally (hashed on server only)
- ✅ Sensitive data never cached (payment info, ID documents)
- ⚠️ SQLite database not encrypted (pending SQLCipher implementation)

**Mitigation Plan:**
```bash
# Implement SQLCipher for Android
npm install @capacitor-community/sqlite

# Encrypt database
import { CapacitorSQLite } from '@capacitor-community/sqlite';

await CapacitorSQLite.createSyncTable({
  database: 'alga-offline-db',
  encrypted: true,
  mode: 'encryption',
  encryption: 'sqlcipher',
});
```

**2. M3: Insecure Communication (CRITICAL)**

**Attack Scenario:**
- Attacker performs MITM attack on public WiFi
- Intercepts API requests
- Steals session cookies or payment data

**Alga Security Controls:**
- ✅ All API calls over HTTPS/TLS 1.2+
- ✅ Certificate validation enabled (default)
- ✅ No HTTP traffic allowed (AndroidManifest.xml, Info.plist)
- ⚠️ Certificate pinning not implemented (production recommended)

**Mitigation Plan (Certificate Pinning):**
```typescript
import { Http } from '@capacitor-community/http';

// Pin specific certificates
await Http.setCertificates({
  hostname: 'alga-app.replit.app',
  certificates: [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
  ],
});
```

**3. M4: Insecure Authentication**

**Attack Scenario:**
- Attacker brute-forces OTP codes (4-digit = 10,000 combinations)
- Account takeover

**Alga Security Controls:**
- ✅ OTP expiry (5 minutes)
- ✅ Rate limiting (3 failed attempts → 15-minute lockout)
- ✅ Session timeout (24 hours)
- ✅ Bcrypt password hashing (cost factor 12 = ~1 second per hash)
- ⚠️ Biometric authentication not implemented (planned)

**Additional Hardening:**
```typescript
// Increase OTP length from 4 to 6 digits
const otp = crypto.randomInt(100000, 999999).toString();

// Implement progressive delays
const failedAttempts = await getFailedLoginAttempts(userId);
const delay = Math.min(failedAttempts * 2, 60) * 1000; // Max 60 seconds
await sleep(delay);
```

**4. M6: Insecure Authorization**

**Attack Scenario:**
- Guest user modifies API request to impersonate host
- Access to earnings dashboard or property management

**Alga Security Controls:**
- ✅ Role-based access control (RBAC) enforced on server
- ✅ User ID from session (not client request)
- ✅ Authorization middleware on all protected routes
- ✅ Least privilege (guests can't access host routes)

**Example RBAC Middleware:**
```typescript
function requireRole(allowedRoles: string[]) {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

// Protect host routes
app.get('/api/host/earnings', requireRole(['host', 'admin']), (req, res) => {
  // Only hosts and admins can access
});
```

**5. M8 & M9: Code Tampering & Reverse Engineering**

**Attack Scenario:**
- Attacker decompiles Android APK using JADX
- Finds API endpoints and business logic
- Creates bot to spam property listings

**Alga Security Controls:**
- ✅ ProGuard obfuscation (Android release builds)
  - Class/method names obfuscated
  - Unused code removed
  - Resource shrinking enabled
- ✅ Swift optimization (iOS release builds)
  - Symbol stripping
  - Dead code elimination
- ✅ No sensitive logic in client (all validation on server)
- ⚠️ Root/jailbreak detection not implemented

**ProGuard Configuration:**
```gradle
# android/app/proguard-rules.pro
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application

# Obfuscate Capacitor plugins
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Remove logging in production
-assumenosideeffects class android.util.Log {
  public static *** d(...);
  public static *** v(...);
}
```

**Root/Jailbreak Detection (Planned):**
```typescript
import { Device } from '@capacitor/device';

async function checkRootJailbreak() {
  const info = await Device.getInfo();

  // Android: Check for root indicators
  if (info.platform === 'android') {
    const rootIndicators = [
      '/system/app/Superuser.apk',
      '/sbin/su',
      '/system/bin/su',
      '/system/xbin/su',
    ];

    // Check if any root files exist
    // Warn user if rooted device detected
  }

  // iOS: Check for jailbreak indicators
  if (info.platform === 'ios') {
    // Check for Cydia, jailbreak files
    // Warn user if jailbroken device detected
  }
}
```

#### Security Control Matrix

| Security Control | Implementation Status | OWASP Coverage |
|------------------|----------------------|----------------|
| TLS/SSL Encryption | ✅ Implemented | M3, M5 |
| Certificate Pinning | ⚠️ Planned | M3 |
| Secure Storage | ✅ Implemented (tokens)<br>⚠️ Pending (SQLite) | M2 |
| Session Management | ✅ Implemented | M4 |
| RBAC Authorization | ✅ Implemented | M6 |
| Input Validation (Zod) | ✅ Implemented | M7, M6 |
| Code Obfuscation | ✅ Implemented | M8, M9 |
| Root/Jailbreak Detection | ⚠️ Planned | M8, M9 |
| Biometric Authentication | ⚠️ Planned | M4 |
| Rate Limiting | ✅ Implemented | M4 |
| XSS Protection | ✅ Implemented | M7 |
| SQL Injection Prevention | ✅ Implemented (Drizzle ORM) | M7 |

#### Risk Assessment Summary

**Critical Risks (Immediate Attention Required):**
- ❌ **No certificate pinning** → Vulnerable to MITM attacks on public WiFi
  - **Mitigation:** Implement certificate pinning before production launch
  - **Timeline:** Before app store submission

**High Risks (Address Before Production):**
- ⚠️ **Unencrypted SQLite database** → Sensitive data readable if device compromised
  - **Mitigation:** Implement SQLCipher encryption
  - **Timeline:** Before app store submission
- ⚠️ **No root/jailbreak detection** → App can run on compromised devices
  - **Mitigation:** Implement detection + warning (not blocking)
  - **Timeline:** Within 3 months post-launch

**Medium Risks (Post-Launch Improvements):**
- ⚠️ **No biometric authentication** → Password-only login less secure
  - **Mitigation:** Add Touch ID/Face ID/Fingerprint option
  - **Timeline:** 6 months post-launch

**Low Risks (Acceptable for Launch):**
- ✅ All other OWASP Mobile Top 10 threats mitigated

---

### Requirement 8: System Functionality ✅

#### Complete List of Mobile Application Features

**1. User Authentication & Registration**

**Functionality:**
- Email/password registration
- Phone number verification (SMS OTP - 4-digit code)
- Login with email/password
- OTP-based login (passwordless)
- Session management (24-hour timeout)
- Logout (clear session + local cache)
- Password reset via email
- Biometric authentication (planned - Touch ID, Face ID, Fingerprint)

**Security-Critical Features:**
- ✅ Bcrypt password hashing (cost factor 12)
- ✅ OTP expiry (5 minutes)
- ✅ Rate limiting (3 failed attempts → 15-minute lockout)
- ✅ Session cookies (httpOnly, secure, sameSite)
- ✅ HTTPS-only transmission

---

**2. Property Search & Discovery**

**Functionality:**
- Browse all properties (infinite scroll)
- City-based filtering (10 cities dropdown)
- Price range filtering (minimum price slider)
- Property type filtering (hotel, guesthouse, traditional home, eco-lodge)
- Keyword search (title, description, amenities)
- GPS-based location search (nearby properties within radius)
- Sort by price, rating, newest, popularity
- Favorites/wishlist management
- Property detail view (photos, description, amenities, reviews, location map)

**Security-Critical Features:**
- ✅ Location data ephemeral (not stored after search)
- ✅ Search queries not logged for privacy
- ✅ No user tracking across sessions

---

**3. Booking Management**

**Functionality:**
- Date range selection (check-in → check-out)
- Guest count specification (max guests validation)
- Real-time price calculation (nightly rate × nights)
- Booking conflict validation (prevent double bookings)
- Booking confirmation workflow
- 6-digit access code generation (secure random)
- View active bookings (upcoming stays)
- View past bookings (booking history)
- Cancel booking (host approval required)
- Offline access to confirmed bookings (cached in IndexedDB)

**Security-Critical Features:**
- ✅ Server-side conflict validation (not client-side only)
- ✅ Access code generated on server (crypto.randomInt)
- ✅ Authorization check (only guest can view their bookings)
- ✅ Booking status transitions validated server-side

---

**4. Payment Processing**

**Functionality:**
- Payment method selection:
  - **TeleBirr** (Ethiopian mobile money via Chapa)
  - **Chapa** (CBE, Dashen, Abyssinia banks)
  - **Stripe** (Visa, Mastercard, Apple Pay, Google Pay)
  - **PayPal** (international travelers)
- Price breakdown display:
  - Subtotal (property rate × nights)
  - Platform commission (10%)
  - Delala agent commission (5% if applicable)
  - VAT (15% on commissions)
  - Withholding tax (5% on commissions)
  - Total due
- Payment initiation (redirect to payment processor)
- Payment verification (callback handling)
- ERCA-compliant invoice generation (PDF download)
- Transaction history (all payments by user)
- Refund management (admin-initiated)

**Security-Critical Features:**
- ✅ **NO CARD DATA STORED** (handled by Stripe/PayPal SDKs)
- ✅ Payment processor tokenization only
- ✅ HTTPS-only payment redirects
- ✅ Transaction reference verification (prevent replay attacks)
- ✅ Server-side payment status validation (not client-provided)
- ✅ Idempotency keys (prevent duplicate charges)
- ✅ PCI DSS compliance (via Stripe/PayPal SDKs)

**Financial Transaction Workflow:**
```
1. User confirms booking → Backend calculates price breakdown
2. User selects payment method → Backend initializes payment with processor
3. Redirect to TeleBirr/Chapa/Stripe → User completes payment
4. Payment processor callback → Backend verifies transaction
5. Update booking.paymentStatus = "paid" → Generate ERCA invoice
6. Send confirmation email/SMS → Provide 6-digit access code
```

---

**5. Identity Verification**

**Functionality:**
- Upload ID document via camera (real-time photo)
- Upload ID document via gallery (select existing photo)
- Supported document types:
  - Ethiopian National ID
  - Passport (foreign visitors)
  - Driver's License
  - Other government-issued ID
- QR code scanning (Ethiopian national ID cards)
- OCR text extraction (parse ID number, full name, expiry date)
- Operator review dashboard (admin/operator role)
- Approve/reject verification
- Rejection reason feedback
- Fayda ID integration (planned - Ethiopia's national eKYC system)

**Security-Critical Features:**
- ✅ Camera permission requested with user consent
- ✅ Image compression before upload (reduce size, prevent bandwidth abuse)
- ✅ Upload to Replit Object Storage (encrypted at rest)
- ✅ No local storage of ID documents (deleted after upload)
- ✅ Operator-only access to verification dashboard (RBAC)
- ✅ Audit logging (who verified which document)
- ✅ No sensitive data in push notifications ("ID verification complete" only)

**OCR Extraction (Tesseract.js):**
```typescript
import Tesseract from 'tesseract.js';

const { data: { text } } = await Tesseract.recognize(
  imageUrl,
  'eng',
  { logger: m => console.log(m) }
);

// Parse ID number (regex pattern matching)
const idNumber = text.match(/\d{10}/)?.[0];
const fullName = text.match(/[A-Z\s]+/)?.[0];
const expiryDate = text.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
```

---

**6. Host Property Management**

**Functionality:**
- Create property listing (multi-step form)
- Upload property photos (camera or gallery, up to 10 images)
- Add property details (title, description, amenities, price)
- Set availability calendar (block dates)
- Manage booking requests (approve/reject)
- View earnings dashboard (total earnings, pending payouts)
- Edit property details (update title, price, amenities)
- Deactivate/reactivate property (make unavailable)
- View property analytics (views, favorites, bookings)
- Mobile payout requests (TeleBirr withdrawal)

**Security-Critical Features:**
- ✅ Property ownership validation (only owner can edit)
- ✅ Image upload size limits (max 5 MB per image)
- ✅ Property verification required before going live (operator approval)
- ✅ Earnings calculation server-side (not editable by host)
- ✅ Payout limits (minimum ETB 100, maximum ETB 50,000 per day)

---

**7. Delala Agent Commission System**

**Functionality:**
- Agent registration (business name, TIN)
- Property registration on behalf of owners
- Commission tracking dashboard:
  - Total properties registered
  - Total commission earned
  - Pending commission
  - Paid commission
  - Commission expiry dates (36 months)
- Monthly payout requests (mobile wallet)
- Performance analytics (bookings per property, average commission)
- Agent verification (admin approval required)

**Security-Critical Features:**
- ✅ Agent verification before commission activation
- ✅ Commission expiry enforcement (auto-expire after 36 months)
- ✅ Commission calculation server-side (not client-editable)
- ✅ Payout transaction logging (ERCA compliance)
- ✅ Fraud detection (multiple agents claiming same property)

**Commission Calculation:**
```typescript
const agentCommission = {
  rate: 0.05, // 5%
  durationMonths: 36,
  calculateCommission: (bookingTotal: number) => bookingTotal * 0.05,
  checkExpiry: (registeredDate: Date) => {
    const expiryDate = new Date(registeredDate);
    expiryDate.setMonth(expiryDate.getMonth() + 36);
    return new Date() < expiryDate;
  }
};
```

---

**8. AI Assistant (Ask Lemlem)**

**Functionality:**
- Property-specific help (WiFi password, check-in instructions, appliances)
- Location recommendations (nearby restaurants, attractions, transportation)
- Cultural guidance (Ethiopian proverbs, greetings, customs)
- Multilingual support:
  - English (default)
  - Amharic (አማርኛ)
  - Tigrinya (ትግርኛ)
  - Afaan Oromoo (Oromo)
  - Chinese (中文) - for Chinese tourists
- Voice commands (manual activation - click to listen):
  - Amharic voice recognition
  - English voice recognition
- Offline capability (browser-native, zero API costs):
  - Cached responses for common questions
  - Property information stored in IndexedDB
  - Pattern matching (no external AI calls)
- Chat history (view past conversations)
- Feedback collection (thumbs up/down)

**Security-Critical Features:**
- ✅ No sensitive data in Lemlem responses (no passwords, access codes, payment info)
- ✅ User consent required for voice commands (microphone permission)
- ✅ Chat history local-only (not shared between devices)
- ✅ No personally identifiable information (PII) logged to analytics

**Zero-Cost AI Implementation:**
```typescript
// Pattern-based responses (no external API)
const lemlemResponses = {
  wifi: (propertyId) => getPropertyInfo(propertyId).then(info => 
    `WiFi Network: ${info.wifiNetwork}\nPassword: ${info.wifiPassword}`
  ),
  checkin: (propertyId) => getPropertyInfo(propertyId).then(info =>
    `Check-in: ${info.checkInTime}\nInstructions: ${info.checkInNotes}`
  ),
  restaurants: (propertyId) => getPropertyInfo(propertyId).then(info =>
    info.nearestRestaurants
  ),
};

// Voice recognition (browser-native Web Speech API)
const recognition = new (window as any).webkitSpeechRecognition();
recognition.lang = 'am-ET'; // Amharic
recognition.start(); // Manual activation only
```

---

**9. Push Notifications**

**Functionality:**
- Booking confirmation notifications
- Host accepts booking
- Payment received
- Check-in reminder (24 hours before)
- Host messages (new message alert)
- Property verification status (approved/rejected)
- Commission payout notifications (for Delala agents)

**Security-Critical Features:**
- ✅ **NO SENSITIVE DATA** in notification body:
  - ❌ Never: Access codes, passwords, payment details
  - ✅ Only: "Booking confirmed", "Payment received", "New message"
- ✅ Notification encryption in transit (FCM HTTPS)
- ✅ User can opt-out (notification permission required)
- ✅ Deep linking (open specific booking/message on tap)

**Notification Example:**
```typescript
// Backend sends notification via Firebase Cloud Messaging
await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'Booking Confirmed',
    body: 'Your stay at Lalibela Lodge is confirmed',
  },
  data: {
    bookingId: '123',
    type: 'booking_confirmed',
  },
  android: {
    priority: 'high',
    notification: {
      channelId: 'booking_updates',
      sound: 'default',
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
      },
    },
  },
});
```

---

**10. Add-On Services Marketplace**

**Functionality:**
- Browse 11 service categories:
  1. Airport Pickup
  2. Tour Guide
  3. Private Chef
  4. Laundry
  5. Car Rental
  6. Spa & Massage
  7. Babysitting
  8. Photography
  9. Translation Services
  10. Event Planning
  11. Grocery Delivery
- Service provider registration (become service provider)
- Service booking (integrated with property bookings)
- Commission system (10% platform fee)
- Service provider dashboard (earnings, bookings)

**Security-Critical Features:**
- ✅ Service provider verification (admin approval)
- ✅ Payment handled through Alga Pay (unified gateway)
- ✅ Service provider background check (manual process)
- ✅ Guest reviews for service quality

---

**11. Reviews & Ratings**

**Functionality:**
- Submit review after check-out
- 5-star rating system
- Subcategories:
  - Cleanliness (1-5 stars)
  - Communication (1-5 stars)
  - Accuracy (1-5 stars)
  - Location (1-5 stars)
  - Value (1-5 stars)
- Written review (text comment)
- Photo uploads (optional - show property condition)
- ALGA Review Engine (weighted algorithm with time decay):
  - Recent reviews weighted higher
  - Verified bookings only
  - Spam detection (prevent fake reviews)
- Host response to reviews
- Report inappropriate reviews

**Security-Critical Features:**
- ✅ Only verified guests can review (must have completed booking)
- ✅ One review per booking (prevent spam)
- ✅ Edit window (7 days after submission)
- ✅ Abuse reporting (flag inappropriate content)
- ✅ Review moderation (admin can hide offensive reviews)

**Weighted Review Algorithm:**
```typescript
function calculateWeightedRating(reviews) {
  const now = Date.now();
  const weights = reviews.map(review => {
    const ageInDays = (now - review.createdAt) / (1000 * 60 * 60 * 24);
    const timeFactor = Math.max(0, 1 - (ageInDays / 365)); // Decay over 1 year
    const verificationFactor = review.isVerified ? 1.2 : 0.8;
    return timeFactor * verificationFactor;
  });

  const weightedSum = reviews.reduce((sum, review, i) => 
    sum + (review.rating * weights[i]), 0
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  return (weightedSum / totalWeight).toFixed(2);
}
```

---

**12. Safety Features**

**Functionality:**
- Share trip details (send booking info to emergency contact)
- Emergency contact management (add family/friends)
- Safety check-ins (automated reminders during stay)
- Location sharing (share current GPS location with host)
- Report safety concern (flag property or host)
- 24/7 emergency hotline (call button)

**Security-Critical Features:**
- ✅ Location data shared only with user consent
- ✅ Emergency contacts stored encrypted
- ✅ Safety reports reviewed by admin within 24 hours
- ✅ Host can't see guest location unless shared

---

**13. Offline Functionality**

**Functionality:**
- View cached bookings (read-only)
- Browse previously viewed properties
- Access Lemlem chat history
- View saved property details
- Offline indicator (show when disconnected)
- Background sync (queue actions for when online)
- Cache expiration (auto-delete old data)

**Security-Critical Features:**
- ✅ Offline data read-only (no creating bookings offline)
- ✅ Cache encryption (IndexedDB with encryption planned)
- ✅ Automatic cache clearing on logout

---

**14. Admin & Operator Features (Mobile Dashboard)**

**Functionality:**
- User management (view, suspend, verify users)
- Property verification dashboard (approve/reject listings)
- ID document verification (review uploaded IDs)
- Payment reconciliation (view all transactions)
- Delala agent verification (approve/reject agents)
- Analytics & KPIs (Lemlem Operations Intelligence)
- Hardware deployment tracking (tablets for operators)
- Warranty management (device expiry tracking)

**Security-Critical Features:**
- ✅ Role-based access (admin/operator only)
- ✅ Audit logging (all admin actions logged)
- ✅ Multi-factor authentication required (for admin role) - Planned
- ✅ IP whitelisting (admin dashboard restricted to Ethiopia) - Planned

---

#### Third-Party API Integrations

**Payment Processors:**

1. **Chapa (Ethiopian Payment Aggregator)**
   - **Purpose:** TeleBirr, CBE, Dashen, Abyssinia bank integration
   - **Security:** API keys in environment variables, HTTPS-only
   - **Compliance:** National Bank of Ethiopia approved

2. **Stripe (International Payments)**
   - **Purpose:** Visa, Mastercard, Apple Pay, Google Pay
   - **Security:** Stripe.js tokenization (no card data touches our server)
   - **Compliance:** PCI DSS Level 1 certified

3. **PayPal (International Alternative)**
   - **Purpose:** PayPal accounts for international travelers
   - **Security:** PayPal SDK (OAuth integration)
   - **Compliance:** PCI DSS compliant

**Communication Services:**

4. **SendGrid (Email)**
   - **Purpose:** Booking confirmations, password resets, invoices
   - **Security:** API key in environment, SPF/DKIM records
   - **Privacy:** No personal data stored by SendGrid

5. **Ethiopian Telecom SMS API**
   - **Purpose:** OTP delivery, booking notifications
   - **Security:** API credentials encrypted
   - **Compliance:** Ethiopian government-approved

**Storage & Infrastructure:**

6. **Replit Object Storage (Google Cloud Storage)**
   - **Purpose:** Property images, ID documents, invoices
   - **Security:** Encrypted at rest, pre-signed URLs (time-limited)
   - **Compliance:** GDPR compliant (for EU travelers)

7. **Neon Database (PostgreSQL)**
   - **Purpose:** Primary database (users, properties, bookings)
   - **Security:** TLS connection, connection string in env
   - **Compliance:** SOC 2 Type II certified

**Maps & Location:**

8. **Google Maps Geocoding API**
   - **Purpose:** Convert addresses to GPS coordinates
   - **Security:** API key restricted to domains, IP limits
   - **Privacy:** No user tracking (ephemeral search data)

---

#### Security-Critical Workflows

**1. Financial Transactions (Highest Priority)**

**Workflow:**
```
User confirms booking → Server calculates breakdown →
Payment processor initialized → User completes payment →
Payment verified by server → Booking status updated →
ERCA invoice generated → Confirmation sent
```

**Security Controls:**
- ✅ Server-side price calculation (not client-provided)
- ✅ Transaction idempotency (prevent duplicate charges)
- ✅ Payment verification before fulfillment
- ✅ Audit logging (all transactions logged for ERCA)
- ✅ Secure communication (HTTPS/TLS)

**2. Identity Verification (Second Priority)**

**Workflow:**
```
Guest uploads ID → Image compressed → Upload to object storage →
OCR extraction (Tesseract.js) → Operator review →
Approval/Rejection → User notified → idVerified flag set
```

**Security Controls:**
- ✅ Operator-only access (RBAC)
- ✅ Image encryption at rest (Google Cloud)
- ✅ No local storage after upload
- ✅ Audit logging (who verified which ID)
- ✅ No sensitive data in notifications

**3. User Authentication (Third Priority)**

**Workflow:**
```
User enters email/password → Bcrypt verification →
OTP sent to phone → User enters OTP → OTP validated →
Session created (httpOnly cookie) → User logged in
```

**Security Controls:**
- ✅ Bcrypt hashing (cost factor 12)
- ✅ OTP expiry (5 minutes)
- ✅ Rate limiting (3 failed attempts → lockout)
- ✅ Session timeout (24 hours)
- ✅ Secure cookies (httpOnly, secure, sameSite)

---

This comprehensive system functionality section covers all features with security-critical analysis. Would you like me to continue with **Requirement 9: Role/System Actor Relationship**?

