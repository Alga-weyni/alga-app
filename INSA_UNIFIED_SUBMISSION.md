# INSA Security Audit - Unified Submission Package

**Company:** Alga One Member PLC  
**TIN:** 0101809194  
**Date:** November 7, 2025  
**Contact:** Weyni Abraha (Winnieaman94@gmail.com, +251 996 034 044)

---

## 📋 Submission Overview

Alga One Member PLC submits **both web and mobile applications** for comprehensive INSA security audit:

1. ✅ **Web Application** - Live and ready for testing
2. 📱 **Mobile Applications** - Android APK + iOS IPA (pending local build)

---

## 🌐 WEB APPLICATION SUBMISSION

### Status: ✅ READY FOR IMMEDIATE TESTING

**Live Deployment:**
- **URL:** https://alga-app.onrender.com
- **Platform:** Render (SOC 2 Type II compliant)
- **Database:** Neon PostgreSQL (production-grade)
- **GitHub:** https://github.com/Alga-weyni/alga-app

### Test Accounts (All Functional)

**OTP Testing:** OTP codes display on-screen (yellow banner) for easy testing without email infrastructure.

| Role | Email | How to Log In |
|------|-------|---------------|
| **Admin** | insa-admin@test.alga.et | Request OTP → See on-screen code → Enter code |
| **Host** | insa-host@test.alga.et | Request OTP → See on-screen code → Enter code |
| **Guest** | insa-guest@test.alga.et | Request OTP → See on-screen code → Enter code |
| **Operator** | insa-operator@test.alga.et | Request OTP → See on-screen code → Enter code |
| **Agent** | insa-agent@test.alga.et | Request OTP → See on-screen code → Enter code |
| **Service Provider** | insa-service@test.alga.et | Request OTP → See on-screen code → Enter code |

**Backup Password (if needed):** INSA_Test_2025!

### Auditor Access

**Render Dashboard:**
- **Invitation sent to:** tilahune@insa.gov.et
- **Access Level:** Viewer (read-only)
- **Can View:** Deployment logs, environment variables (masked), build history
- **Cannot:** Modify settings, deploy, or delete anything

### Security Compliance

✅ **OWASP Top 10 (2021)** - 100% coverage  
✅ **ERCA Tax Compliance** - Invoice generation, TIN: 0101809194  
✅ **NIST Cybersecurity Framework** - Core functions implemented  
✅ **PCI DSS** - By proxy (Stripe/Chapa Level 1 certified)  
✅ **SOC 2 Type II** - Via infrastructure providers (Render, Neon)

### Documentation

**Location:** `/docs/insa/` directory in GitHub repository

**Key Documents:**
1. `INSA_WEB_APP_SUBMISSION.md` - Complete web app submission
2. `SECURITY_FUNCTIONALITY.md` - Security features and implementations
3. `API_DOCUMENTATION.md` - 50+ API endpoints with auth details
4. `THREAT_MODEL.md` - STRIDE analysis, OWASP Top 10 coverage
5. `AUTHENTICATION_AUTHORIZATION.md` - RBAC, session management, OTP flow
6. `COMPLIANCE_REQUIREMENTS.md` - ERCA, NIST, PCI DSS, ISO 27001
7. `THIRD_PARTY_SERVICES.md` - All external services and certifications
8. `INSA_TEST_CREDENTIALS.md` - Complete test account documentation

---

## 📱 MOBILE APPLICATION SUBMISSION

### Status: 📱 PENDING LOCAL BUILD

**Framework:** Capacitor 6.0 (native iOS & Android from shared web codebase)  
**Backend API:** Same as web (https://alga-app.onrender.com/api)  
**Test Accounts:** Same 6 accounts as web application

### Mobile App Builds Required

**Android:**
- ✅ Debug APK (unsigned) - For INSA testing
- ✅ Release APK (signed) - Production-ready build
- ✅ Package: `et.alga.app`
- ✅ Min SDK: Android 7.0 (API 24)
- ✅ Target SDK: Android 14 (API 34)

**iOS:**
- ✅ Release IPA (signed) - Production-ready build
- ✅ Bundle ID: `et.alga.app`
- ✅ Min Version: iOS 13.0
- ✅ Target Version: iOS 17

### Build Instructions

**Prerequisites:**
- Android Studio (for APK)
- Xcode 14+ on Mac (for IPA)
- Node.js 20+

**Quick Build (Linux/Mac):**
```bash
chmod +x scripts/build-mobile-for-insa.sh
./scripts/build-mobile-for-insa.sh
```

**Quick Build (Windows):**
```cmd
scripts\build-mobile-for-insa.bat
```

**Manual Build:**
See `docs/insa/BUILD_INSTRUCTIONS.md` for complete step-by-step guide.

### Mobile-Specific Security Features

✅ **OWASP Mobile Top 10** - 8/10 implemented, 2 planned  
✅ **Secure Storage** - Encrypted session tokens  
✅ **TLS Enforcement** - All network calls over HTTPS  
✅ **Code Obfuscation** - ProGuard (Android), Swift obfuscation (iOS)  
✅ **Minimal Permissions** - Camera, Location, Notifications (all justified)  
✅ **Session Security** - 24-hour timeout, httpOnly cookies  
✅ **Payment Security** - Mobile SDKs, no card data stored

### Mobile Documentation

**Location:** `/docs/insa/` directory in GitHub repository

**Key Documents:**
1. `INSA_MOBILE_APP_SUBMISSION.md` - Complete mobile submission
2. `BUILD_INSTRUCTIONS.md` - Android & iOS build guide
3. `SECURITY_FUNCTIONALITY.md` - Mobile security section
4. `THREAT_MODEL.md` - OWASP Mobile Top 10 coverage

### Submission Files (When Ready)

**Will Include:**
- `app-debug.apk` (~20 MB)
- `app-release.apk` (~20 MB, signed)
- `Alga.ipa` (~25 MB, signed)
- `checksums.txt` (SHA256 hashes)

---

## 📧 SUBMISSION METHOD

### Email to INSA

**To:** tilahune@insa.gov.et  
**Cc:** [INSA audit team email if any]  
**Subject:** Alga Platform - Dual Security Audit Submission (Web + Mobile)

**Email Body:**

```
Dear Dr. Tilahun Ejigu,

I am submitting both the web and mobile applications for the Alga 
property rental platform for comprehensive INSA security audit.

===================
WEB APPLICATION (READY FOR IMMEDIATE TESTING)
===================

Live URL: https://alga-app.onrender.com
GitHub: https://github.com/Alga-weyni/alga-app
Render Dashboard Access: Invited as Viewer

Test Accounts (OTP displays on-screen for easy testing):
1. Admin: insa-admin@test.alga.et
2. Host: insa-host@test.alga.et
3. Guest: insa-guest@test.alga.et
4. Operator: insa-operator@test.alga.et
5. Agent: insa-agent@test.alga.et
6. Service Provider: insa-service@test.alga.et

Backup Password (if needed): INSA_Test_2025!

===================
MOBILE APPLICATIONS (PENDING BUILD)
===================

Native Android & iOS apps (same backend as web).

Build Status:
- Android APK: [Pending local build - instructions provided]
- iOS IPA: [Pending local build - requires Mac + Xcode]

Mobile builds will be submitted within [timeframe] once completed 
on local development environment.

===================
DOCUMENTATION
===================

Complete security documentation available in repository:
https://github.com/Alga-weyni/alga-app/tree/main/docs/insa

Key Documents:
- INSA_WEB_APP_SUBMISSION.md
- INSA_MOBILE_APP_SUBMISSION.md
- SECURITY_FUNCTIONALITY.md
- API_DOCUMENTATION.md
- THREAT_MODEL.md
- BUILD_INSTRUCTIONS.md
- COMPLIANCE_REQUIREMENTS.md

===================
SECURITY COMPLIANCE
===================

✅ OWASP Top 10 (2021) - Web application
✅ OWASP Mobile Top 10 - Mobile applications
✅ ERCA Tax Compliance (TIN: 0101809194)
✅ PCI DSS by proxy (Stripe/Chapa Level 1)
✅ SOC 2 Type II infrastructure

===================
COMPANY INFORMATION
===================

Company: Alga One Member PLC
TIN: 0101809194
Founder & CEO: Weyni Abraha
Email: Winnieaman94@gmail.com
Phone: +251 996 034 044

===================
REQUEST
===================

We request INSA to:
1. Begin web application security audit immediately (platform is live)
2. Provide preliminary feedback on web security
3. Advise on mobile app submission timeline and requirements
4. Guide us on any additional documentation needed

We are fully committed to addressing any security findings and 
maintaining the highest standards of cybersecurity.

Best regards,
Weyni Abraha
Founder & CEO
Alga One Member PLC
TIN: 0101809194
```

---

## 📦 ATTACHMENTS (When Complete)

### For Web Application (Ready Now)
- GitHub repository link (contains all documentation)
- Render dashboard viewer access
- Online documentation: https://github.com/Alga-weyni/alga-app/tree/main/docs/insa

### For Mobile Application (When Built)
- `app-debug.apk` (Android debug build)
- `app-release.apk` (Android release build, signed)
- `Alga.ipa` (iOS release build, signed)
- `checksums.txt` (SHA256 hashes of all builds)
- USB drive or cloud link for large files

---

## ✅ PRE-SUBMISSION CHECKLIST

### Web Application
- [x] Live deployment accessible
- [x] 6 test accounts functional
- [x] OTP system working (displays on-screen)
- [x] Render dashboard viewer access configured
- [x] All documentation in GitHub repository
- [x] Security compliance verified

### Mobile Application
- [ ] Android debug APK built
- [ ] Android release APK built and signed
- [ ] iOS release IPA built and signed
- [ ] SHA256 checksums generated
- [ ] Build files ready for submission
- [x] Mobile documentation complete

### General
- [x] Legal documents available (TIN, business license)
- [x] Company information accurate
- [x] Contact details verified
- [x] Submission email drafted

---

## 📞 INSA CONTACT

**Dr. Tilahun Ejigu (Ph.D.)**  
Division Head, Cyber Security Audit Division  
Ethiopian Information Network Security Agency (INSA)  
Wollo Sefer, Addis Ababa, Ethiopia

**Email:** tilahune@insa.gov.et  
**Mobile:** +251 937 456 374  
**Office:** [INSA office phone if available]

---

## 🎯 EXPECTED TIMELINE

| Phase | Timeline |
|-------|----------|
| **Web App Submission** | November 7, 2025 (immediate) |
| **Mobile Builds Completion** | [Your estimated date] |
| **Mobile App Submission** | [Your estimated date] |
| **INSA Initial Review** | 2-4 weeks from submission |
| **Response to Findings** | Within 5 working days |
| **Target Certification** | December 2025 |

---

## 💡 NOTES FOR INSA AUDITORS

### Web Application Testing

**Easy OTP Access:**
OTP codes display on-screen in a yellow banner when requested, eliminating 
the need for email delivery infrastructure. This is specifically implemented 
for audit convenience.

**Render Dashboard Access:**
Viewer access allows you to see deployment logs, environment configuration 
(masked), and build history without ability to modify anything.

### Mobile Application Testing

**When Builds Are Ready:**
We will provide installation instructions for both Android (ADB sideloading) 
and iOS (TestFlight or direct installation).

**Same Backend:**
Mobile apps use the exact same backend API as the web application, so backend 
security is already covered in the web audit.

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Prepared by:** Weyni Abraha, Founder & CEO, Alga One Member PLC
