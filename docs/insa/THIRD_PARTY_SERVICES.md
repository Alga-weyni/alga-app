# Third-Party Services & SDK Documentation
**Application:** Alga Property Rental Platform  
**Prepared for:** INSA Security Audit  
**Date:** November 7, 2025

---

## Overview

This document lists all third-party services, libraries, and SDKs integrated into the Alga platform, including security measures for each integration.

---

## 1. Payment Processors

### 1.1 Chapa (Ethiopian Payment Gateway)
**Purpose:** Process ETB payments via telebirr, CBE Birr, bank transfers

| Detail | Value |
|--------|-------|
| **Service** | Chapa Payment API |
| **Documentation** | https://developer.chapa.co |
| **Integration Type** | REST API |
| **Environment** | Sandbox + Production |
| **Authentication** | Secret key via Authorization header |
| **Data Transmitted** | Payment amount, customer info, callback URL |
| **PCI DSS** | Chapa is PCI DSS Level 1 compliant |

**Security Measures:**
- ✅ Secret key stored in environment variable
- ✅ HTTPS only communication
- ✅ Webhook signature verification
- ✅ Idempotency keys prevent duplicate charges
- ✅ No card data touches Alga servers

**NPM Package:** `chapa-nodejs`  
**Version:** Latest  
**License:** MIT

---

### 1.2 Stripe (International Payments)
**Purpose:** Process international credit/debit cards, Apple Pay, Google Pay

| Detail | Value |
|--------|-------|
| **Service** | Stripe Payments API |
| **Documentation** | https://stripe.com/docs/api |
| **Integration Type** | REST API + React Components |
| **Environment** | Test + Live |
| **Authentication** | Secret key (server-side), Publishable key (client-side) |
| **Data Transmitted** | Payment intents, customer metadata |
| **PCI DSS** | Stripe is PCI DSS Level 1 certified |

**Security Measures:**
- ✅ Secret key stored in environment variable
- ✅ Client uses publishable key only
- ✅ Stripe.js handles card tokenization
- ✅ No raw card data on Alga servers
- ✅ Webhook endpoint signature verification
- ✅ 3D Secure (SCA) enabled for Europe

**NPM Packages:**
- `stripe` (server-side)
- `@stripe/stripe-js` (client-side)
- `@stripe/react-stripe-js` (React components)

**Version:** Latest  
**License:** MIT

---

### 1.3 PayPal
**Purpose:** International payments via PayPal accounts

| Detail | Value |
|--------|-------|
| **Service** | PayPal Checkout API |
| **Documentation** | https://developer.paypal.com |
| **Integration Type** | Server SDK |
| **Environment** | Sandbox + Production |
| **Authentication** | Client ID + Secret |
| **Data Transmitted** | Order details, customer info |
| **Compliance** | PCI DSS compliant |

**Security Measures:**
- ✅ Credentials stored in environment variables
- ✅ OAuth 2.0 authentication
- ✅ HTTPS only
- ✅ Webhook signature verification

**NPM Package:** `@paypal/paypal-server-sdk`  
**Version:** Latest  
**License:** Apache 2.0

---

### 1.4 TeleBirr (Agent Commission Payouts)
**Purpose:** Direct payouts to Delala agents via TeleBirr

| Detail | Value |
|--------|-------|
| **Service** | TeleBirr API |
| **Documentation** | Ethio Telecom developer portal |
| **Integration Type** | REST API |
| **Environment** | Sandbox + Production |
| **Authentication** | App ID, App Key, Public Key |
| **Data Transmitted** | Payout amount, phone number |

**Security Measures:**
- ✅ All credentials in environment variables
- ✅ HTTPS encryption
- ✅ Transaction verification
- ✅ Sandbox testing before production

**NPM Package:** Custom implementation (no official SDK)  
**API Docs:** Provided by Ethio Telecom

---

## 2. Communication Services

### 2.1 SendGrid (Email Delivery)
**Purpose:** Send transactional emails (OTP, booking confirmations, receipts)

| Detail | Value |
|--------|-------|
| **Service** | SendGrid Email API |
| **Documentation** | https://docs.sendgrid.com |
| **Integration Type** | REST API |
| **Authentication** | API Key |
| **Data Transmitted** | Email content, recipient address |
| **Encryption** | TLS 1.2+ enforced |

**Security Measures:**
- ✅ API key stored in environment variable
- ✅ Sender authentication (SPF, DKIM, DMARC)
- ✅ Rate limiting applied
- ✅ No sensitive data in email body
- ✅ Links use HTTPS only

**NPM Package:** `@sendgrid/mail`  
**Version:** Latest  
**License:** MIT

**Email Types Sent:**
- OTP verification codes
- Booking confirmations
- Payment receipts
- Password reset links
- Review requests

---

### 2.2 Ethiopian Telecom SMS
**Purpose:** Send SMS OTP for phone verification

| Detail | Value |
|--------|-------|
| **Service** | Ethiopian Telecom SMS API |
| **Documentation** | Provided by Ethio Telecom |
| **Integration Type** | HTTP API |
| **Authentication** | API credentials |
| **Data Transmitted** | Phone number, SMS text |

**Security Measures:**
- ✅ Credentials in environment variables
- ✅ Rate limiting (3 SMS per user per 15 min)
- ✅ OTP expires after 5 minutes
- ✅ No sensitive info in SMS (only OTP)

**NPM Package:** Custom HTTP implementation  
**Alternative:** Twilio (if Ethio Telecom unavailable)

---

## 3. Database & Storage

### 3.1 Neon Database (PostgreSQL)
**Purpose:** Serverless PostgreSQL database hosting

| Detail | Value |
|--------|-------|
| **Service** | Neon Serverless Postgres |
| **Documentation** | https://neon.tech/docs |
| **Authentication** | Connection string with password |
| **Encryption** | AES-256 at rest, TLS in transit |
| **Backups** | Automated daily backups |
| **Compliance** | SOC 2 Type II certified |

**Security Measures:**
- ✅ Connection string in DATABASE_URL env var
- ✅ SSL/TLS required for connections
- ✅ Automatic failover and scaling
- ✅ Point-in-time recovery available
- ✅ IP allowlist (optional)

**NPM Package:** `@neondatabase/serverless`  
**Version:** Latest  
**License:** MIT

---

### 3.2 Google Cloud Storage (Object Storage)
**Purpose:** Store property images, ID documents, verification photos

| Detail | Value |
|--------|-------|
| **Service** | Google Cloud Storage |
| **Documentation** | https://cloud.google.com/storage/docs |
| **Authentication** | Service account credentials |
| **Access Control** | IAM + signed URLs |
| **Encryption** | Google-managed keys at rest |

**Security Measures:**
- ✅ Service account key in environment variable
- ✅ Bucket access restricted to app only
- ✅ Signed URLs for temporary access
- ✅ Image processing before upload (Sharp)
- ✅ File type validation (images only)
- ✅ 10MB max file size

**NPM Package:** `@google-cloud/storage`  
**Version:** Latest  
**License:** Apache 2.0

**Buckets:**
- `alga-property-images` - Public-facing property photos
- `alga-id-documents` - Private ID verification documents

---

## 4. Maps & Geolocation

### 4.1 Google Maps API
**Purpose:** Geocoding addresses, displaying property locations

| Detail | Value |
|--------|-------|
| **Service** | Google Maps Geocoding API |
| **Documentation** | https://developers.google.com/maps |
| **Authentication** | API key (restricted to alga.et domain) |
| **Data Transmitted** | Property addresses, coordinates |
| **Cost** | Free tier + pay-as-you-go |

**Security Measures:**
- ✅ API key stored in `VITE_GOOGLE_MAPS_API_KEY`
- ✅ Domain restrictions (alga.et, localhost)
- ✅ API quota limits configured
- ✅ No personal user data sent

**NPM Package:** `react-google-autocomplete`, `google-map-react`  
**Version:** Latest  
**License:** MIT

**Features Used:**
- Geocoding (address → lat/lng)
- Mini-maps on property detail pages
- Distance calculation (GPS-based)

---

## 5. Identity Verification

### 5.1 Fayda ID (Ethiopian eKYC)
**Purpose:** Verify Ethiopian national IDs for host verification

| Detail | Value |
|--------|-------|
| **Service** | Fayda ID eKYC API |
| **Documentation** | Fayda developer portal |
| **Authentication** | API credentials |
| **Data Transmitted** | Fayda ID number (12 digits) |
| **Compliance** | Ethiopian government-approved |

**Security Measures:**
- ✅ API credentials in environment variables
- ✅ HTTPS encryption
- ✅ Data minimization (only ID number sent)
- ✅ Verification results stored encrypted
- ✅ User consent required

**NPM Package:** Custom HTTP implementation  
**Status:** Future integration (not yet implemented)

---

### 5.2 Tesseract.js (OCR for Foreign IDs)
**Purpose:** Extract text from foreign passport/ID images

| Detail | Value |
|--------|-------|
| **Service** | Tesseract.js (client-side OCR) |
| **Documentation** | https://tesseract.projectnaptha.com |
| **Data Processing** | Client-side only (no external API) |
| **Privacy** | No data leaves user's browser |

**Security Measures:**
- ✅ Runs entirely in browser (WebAssembly)
- ✅ No third-party data transmission
- ✅ Operator review required for all extractions
- ✅ Image deleted after processing

**NPM Package:** `tesseract.js`  
**Version:** Latest  
**License:** Apache 2.0

---

### 5.3 html5-qrcode (QR Code Scanning)
**Purpose:** Scan QR codes on Ethiopian IDs for verification

| Detail | Value |
|--------|-------|
| **Service** | html5-qrcode (client-side library) |
| **Documentation** | https://github.com/mebjas/html5-qrcode |
| **Data Processing** | Client-side only |
| **Privacy** | No external API calls |

**Security Measures:**
- ✅ Client-side processing (no server upload)
- ✅ Camera permission required
- ✅ QR data validated before use

**NPM Package:** `html5-qrcode`  
**Version:** Latest  
**License:** MIT

---

## 6. Frontend Libraries & UI Components

### 6.1 Radix UI (Accessible Components)
**Purpose:** Provide accessible, unstyled UI components

**NPM Packages:**
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-select`
- `@radix-ui/react-toast`
- (30+ Radix UI packages)

**Security:** Client-side only, no data transmission  
**License:** MIT

---

### 6.2 React Query (TanStack Query)
**Purpose:** Server state management, caching, data fetching

**NPM Package:** `@tanstack/react-query`  
**Version:** v5 (latest)  
**License:** MIT

**Security:**
- ✅ HTTPS enforced for API calls
- ✅ Automatic retry with backoff
- ✅ Stale data invalidation

---

### 6.3 React Hook Form + Zod
**Purpose:** Form validation and management

**NPM Packages:**
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `drizzle-zod`

**Security:**
- ✅ Client-side validation (UX)
- ✅ Server-side validation (security)
- ✅ Type-safe schemas
- ✅ XSS prevention via React

**License:** MIT

---

## 7. Mobile App Frameworks

### 7.1 Capacitor (Native Wrapper)
**Purpose:** Convert PWA to native iOS/Android apps

**NPM Packages:**
- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/android`
- `@capacitor/ios`
- `@capacitor/camera`
- `@capacitor/geolocation`
- `@capacitor/push-notifications`
- `@capacitor/share`

**Security:**
- ✅ Biometric authentication plugin available
- ✅ Secure storage for tokens
- ✅ Camera permissions required
- ✅ App signing for stores

**License:** MIT

---

### 7.2 Vite PWA Plugin
**Purpose:** Generate Progressive Web App manifest and service worker

**NPM Package:** `vite-plugin-pwa`  
**Version:** Latest  
**License:** MIT

**Security:**
- ✅ HTTPS-only service workers
- ✅ Cache-first strategy for static assets
- ✅ Network-first for API calls
- ✅ Automatic cache invalidation

---

## 8. Security & Infrastructure

### 8.1 Helmet.js
**Purpose:** Set security HTTP headers

**NPM Package:** `helmet`  
**License:** MIT

**Headers Set:**
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

---

### 8.2 Express Middleware
**Security Packages:**
- `express-rate-limit` - Rate limiting
- `cors` - CORS configuration
- `helmet` - Security headers
- `express-validator` - Input validation
- `xss-clean` - XSS sanitization
- `express-mongo-sanitize` - NoSQL injection prevention
- `hpp` - HTTP parameter pollution prevention

**All Licenses:** MIT

---

## 9. Development & Build Tools

### 9.1 TypeScript
**NPM Package:** `typescript`  
**Version:** Latest  
**License:** Apache 2.0

**Security Benefits:**
- Type safety prevents runtime errors
- Compile-time validation

---

### 9.2 Drizzle ORM
**NPM Packages:**
- `drizzle-orm` - ORM library
- `drizzle-kit` - Migration tool

**Security:**
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Type-safe database access
- ✅ No raw SQL execution

**License:** MIT

---

### 9.3 Vite (Build Tool)
**NPM Package:** `vite`  
**License:** MIT

**Security:**
- ✅ Environment variable validation
- ✅ Tree-shaking removes unused code
- ✅ Code splitting for smaller bundles

---

## 10. Dependency Security

### Automated Audits
```bash
npm audit --production
# Current status: 0 known vulnerabilities
```

### Dependency Updates
- **Tool:** Dependabot (GitHub)
- **Frequency:** Weekly checks
- **Policy:** High/critical vulnerabilities patched within 48 hours

### Lock Files
- `package-lock.json` committed to Git
- Ensures reproducible builds
- Prevents supply chain attacks

---

## 11. Third-Party Security Measures Summary

| Service | Authentication | Encryption | Data Minimization | Audit Logs |
|---------|----------------|------------|-------------------|------------|
| Chapa | API Key | HTTPS/TLS | ✅ | ✅ |
| Stripe | Secret Key | HTTPS/TLS | ✅ | ✅ |
| PayPal | OAuth 2.0 | HTTPS/TLS | ✅ | ✅ |
| TeleBirr | App Key | HTTPS/TLS | ✅ | ✅ |
| SendGrid | API Key | TLS 1.2+ | ✅ | ✅ |
| Neon DB | Password | AES-256 | ✅ | ✅ |
| Google Cloud | Service Account | Google-managed | ✅ | ✅ |
| Google Maps | API Key | HTTPS | ✅ | ❌ |
| Tesseract.js | N/A (client-side) | N/A | ✅ | ❌ |

---

## 12. Data Flow to Third Parties

### Personal Data Transmitted:
1. **Chapa/Stripe/PayPal:** Name, email, booking amount
2. **SendGrid:** Email address, name
3. **Ethio Telecom:** Phone number
4. **Google Cloud:** Images (property photos, ID documents)
5. **Google Maps:** Property addresses (not user addresses)
6. **Fayda ID:** National ID number (future)

### No Personal Data Transmitted:
- Tesseract.js (client-side)
- html5-qrcode (client-side)
- All React libraries (client-side)
- Radix UI (client-side)

---

## 13. Compliance & Certifications

| Third Party | Compliance | Verified |
|-------------|------------|----------|
| Stripe | PCI DSS Level 1 | ✅ |
| Chapa | PCI DSS Level 1 | ✅ |
| Neon Database | SOC 2 Type II | ✅ |
| Google Cloud | ISO 27001, SOC 2 | ✅ |
| SendGrid | SOC 2, GDPR | ✅ |
| PayPal | PCI DSS | ✅ |

---

**Document Version:** 1.0  
**Total Third-Party Services:** 20+  
**Next Audit:** Quarterly review of dependencies
