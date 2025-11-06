# INSA Requirements Compliance Matrix
## Alga Platform - Web & Mobile Application Security Audit

**Document Reference:** OF/AEAD/001  
**Prepared For:** Information Network Security Administration (INSA)  
**Company:** ALGA ONE MEMBER PLC  
**TIN:** 0101809194  
**Date:** November 6, 2025

---

## WEB APPLICATION SECURITY TESTING REQUIREMENTS

### 4.1 Legal and Administrative Documents (MANDATORY)

| Requirement | Status | Location | Notes |
|-------------|--------|----------|-------|
| **1. Updated Trade License** | ✅ COMPLETE | `1_Legal_Documents/` | **4 licenses provided:** Software Development (main), E-commerce Platform, Commission/Brokers, Construction |
| **2. TIN Number** | ✅ COMPLETE | All documents | **TIN: 0101809194** (verified on all licenses) |
| **3. Patent Certificate** | ⚪ N/A | - | Not applicable for this business type |

**Compliance:** 100% (All mandatory items provided)

---

### 4.2.1 Business Architecture and Design (MANDATORY)

#### a) Data Flow Diagram (DFD)

| Requirement | Status | Source File | Export Status |
|-------------|--------|-------------|---------------|
| **Context-Level DFD (Level 0)** showing system and external actors | ✅ COMPLETE | `docs/diagrams/DFD_Context_Level_0.md` | ⏳ Ready to export |
| **Detailed DFDs (Level 1/2)** showing internal processes and storage | ✅ COMPLETE | `docs/diagrams/DFD_Detailed_Level_1.md` | ⏳ Ready to export |

**Features Included:**
- ✅ External entities: 5 user roles + 9 external systems
- ✅ Data stores: 7 databases clearly labeled
- ✅ 7 core processes (Authentication, Property, Booking, Payment, Commission, etc.)
- ✅ 30+ data flows with directions
- ✅ System boundaries clearly defined
- ✅ Entry points and flows highlighted
- ✅ Risk areas identified (data leakage, insecure handling, unauthorized access)

**Compliance:** 100%

---

#### b) System Architecture Diagram

| Requirement | Status | Source File | Export Status |
|-------------|--------|-------------|---------------|
| **Deployment Architecture** (on-premise/cloud/hybrid) | ✅ COMPLETE | `docs/diagrams/System_Architecture.md` | ⏳ Ready to export |
| **Component Architecture** (modules, service communication) | ✅ COMPLETE | Same file | ⏳ Ready to export |
| **Security Layers** (DMZ/VPN, SSL/TLS, WAF, IDS/IPS) | ✅ COMPLETE | Same file | ⏳ Ready to export |

**Features Included:**
- ✅ **5 Architectural Layers:**
  1. Internet Layer (Users, Web/Mobile)
  2. Security Layer (TLS, Firewall, INSA Hardening)
  3. Application Layer (React, Express, Middleware)
  4. Storage Layer (PostgreSQL, Object Storage)
  5. External Services Layer (Payments, Communications, Government)
- ✅ Cloud deployment (Replit infrastructure)
- ✅ 40+ components mapped
- ✅ Service-to-service communication documented
- ✅ Middleware chain (Helmet, CORS, Rate Limiting, INSA Hardening)
- ✅ Security zones: DMZ, Application, Data, External
- ✅ Integration points: 13 external services

**Compliance:** 100%

---

#### c) Entity Relationship Diagram (ERD)

| Requirement | Status | Source File | Export Status |
|-------------|--------|-------------|---------------|
| **Tables/entities** (Users, Roles, Permissions, Transactions) | ✅ COMPLETE | `docs/diagrams/ERD_Database_Schema.md` | ⏳ Ready to export |
| **Primary/foreign keys and relationships** | ✅ COMPLETE | Same file | ⏳ Ready to export |
| **Sensitive fields marked** requiring encryption/access control | ✅ COMPLETE | Same file | ⏳ Ready to export |

**Features Included:**
- ✅ **20+ Tables documented:**
  - users, properties, bookings, payments
  - agents, agent_properties, agent_commissions
  - reviews, services, verification_documents
  - sessions, property_info, emergency_contacts
  - favorites, user_activity_log
- ✅ All primary keys (PK) marked
- ✅ All foreign keys (FK) with references
- ✅ Cardinality notation (1:1, 1:N, N:M)
- ✅ **Sensitive fields marked 🔒:**
  - Password hashes, phone numbers, OTP codes
  - Latitude/longitude coordinates
  - Access codes, financial amounts
  - TeleBirr accounts, commission data
  - ID numbers, Fayda IDs
  - Document URLs, session data
- ✅ 200+ columns documented with types
- ✅ Indexes specified
- ✅ Business rules included

**Compliance:** 100%

---

### 4.2.2 Features of the Web Application (MANDATORY)

| Requirement | Status | Location | Details |
|-------------|--------|----------|---------|
| **Development frameworks** | ✅ COMPLETE | `3_Security_Documentation/INSA_Security_Audit_Submission.md` Section 3.1 | React 18, Express.js, Node.js 20, TypeScript |
| **Libraries or plugins integrated** | ✅ COMPLETE | Same, Section 3.2 | **60+ packages** documented (Drizzle ORM, Zod, TanStack Query, Stripe, Chapa, etc.) |
| **Custom-developed modules or APIs** | ✅ COMPLETE | Same, Section 3.4 | 11 functional modules documented |
| **Third-party service integrations** | ✅ COMPLETE | Same, Section 3.5 | Chapa, Stripe, PayPal, TeleBirr, SendGrid, Ethiopian Telecom, Google Maps, Fayda ID, ERCA |
| **Actor/user types** | ✅ COMPLETE | Same, Section 3.3 | **5 roles:** Guest, Host, Agent, Operator, Admin |
| **System dependencies** | ✅ COMPLETE | Same, Section 3.1-3.2 | PostgreSQL (Neon), Node.js 20, Replit infrastructure |
| **Implemented security standards** | ✅ COMPLETE | Same, Section 5 | OWASP Top 10, INSA hardening, RBAC, Input validation, Session security |
| **Existing security infrastructure** | ✅ COMPLETE | Same, Section 5 | **14+ protections:** Helmet, CORS, Rate Limiting, HPP, XSS, SQL injection prevention, NoSQL sanitization, CSRF, etc. |

**Compliance:** 100%

---

### 4.2.3 Define Specific Testing Scope (MANDATORY)

| Asset Name | URL/IP Address | Test Account Credentials | Status |
|------------|----------------|--------------------------|--------|
| Public Web Portal | https://[project-name].replit.dev | ❌ TO CREATE | Need to generate |
| Internal Admin Portal | https://[project-name].replit.dev/admin | ❌ TO CREATE | Need to generate |
| Mobile App (PWA) | https://[project-name].replit.dev | ❌ TO CREATE | Same as web |
| Native Android App | APK to be provided | ❌ TO CREATE | Same accounts |
| API Endpoints | https://[project-name].replit.dev/api/* | ❌ TO CREATE | Same accounts |

**TEST ACCOUNTS TO CREATE (5 roles):**

1. **Guest Account:**
   - Email: `testguest@alga.et`
   - Password: `TestGuest123!`
   - Role: `guest`
   - Purpose: Property browsing, booking creation

2. **Host Account:**
   - Email: `testhost@alga.et`
   - Password: `TestHost123!`
   - Role: `host`
   - Purpose: Property management, earnings dashboard

3. **Agent Account:**
   - Email: `testagent@alga.et`
   - Password: `TestAgent123!`
   - Role: `agent`
   - Purpose: Property linking, commission tracking

4. **Operator Account:**
   - Email: `testoperator@alga.et`
   - Password: `TestOperator123!`
   - Role: `operator`
   - Purpose: ID verification, document review

5. **Admin Account:**
   - Email: `testadmin@alga.et`
   - Password: `TestAdmin123!`
   - Role: `admin`
   - Purpose: Full platform management, user control

**Compliance:** ❌ 0% (CRITICAL - Must create before submission)

---

### 4.2.4 Security Functionality Document (MANDATORY)

| Requirement | Status | Location | Details |
|-------------|--------|----------|---------|
| **User roles and access control (RBAC)** | ✅ COMPLETE | Section 5.1 | 5 roles with granular permissions |
| **Input validation and sanitization** | ✅ COMPLETE | Section 5.2 | Multi-layer: Zod (frontend) + express-validator (backend) + INSA hardening |
| **Session management** | ✅ COMPLETE | Section 5.3 | PostgreSQL store, httpOnly/secure/sameSite cookies, 24hr timeout |
| **Error handling and logging** | ✅ COMPLETE | Section 5.4 | No stack traces in production, security event logging |
| **Secure communications (TLS/SSL)** | ✅ COMPLETE | Section 5.6 | TLS 1.2+, automatic HTTPS via Replit proxy |
| **Technical description of each function** | ✅ COMPLETE | Section 5 | All security controls documented with implementation details |

**Compliance:** 100%

---

### 4.2.5 Secure Coding Standard Documentation (IF AVAILABLE)

| Requirement | Status | Location | Notes |
|-------------|--------|----------|-------|
| **Secure coding guidelines** | ✅ DOCUMENTED | Section 6 | OWASP practices followed |
| **Internal rules/checklists** | ⚠️ PARTIAL | Embedded in main doc | Should create standalone policy document |
| **Practices preventing SQLi, XSS, CSRF** | ✅ COMPLETE | Section 5, `server/security/insa-hardening.ts` | **Zero raw SQL policy enforced** (100% Drizzle ORM) |
| **Secure input handling** | ✅ COMPLETE | Section 5.2, 5.5 | Zod schemas, file validation (type, size, content) |
| **File upload/download controls** | ✅ COMPLETE | Section 5.5 | 5MB limit, type whitelist, compression |
| **Authentication & session management** | ✅ COMPLETE | Section 5.1, 5.3 | Passwordless OTP, Bcrypt hashing, secure sessions |
| **Regular patching and library validation** | ✅ COMPLETE | Section 6 | npm audit, dependency updates |

**Compliance:** 90% (Recommended: Create standalone Secure Coding Policy document)

---

### 4.2.3 Functional Requirements (MANDATORY)

| Requirement | Status | Location | Details |
|-------------|--------|----------|---------|
| **Core application workflows** | ✅ COMPLETE | Section 7.1 | **5 workflows documented:** User Registration, Property Listing, Booking Flow, Commission Tracking, ID Verification |
| **Input/output validation rules** | ✅ COMPLETE | Section 7.2 | Zod schemas for all forms, API validation rules |
| **API endpoints with request/response structures** | ✅ COMPLETE | Section 7.3 | **40+ endpoints** with examples (auth, properties, bookings, payments, agents, reviews, services) |
| **Role-based access control definitions** | ✅ COMPLETE | Section 5.1 | Permission matrix for all 5 roles |
| **Logging and auditing functionalities** | ✅ COMPLETE | Section 5.4 | User activity log, security events, audit trail |
| **Error handling and exception management** | ✅ COMPLETE | Section 5.4 | Global error handler, sanitized messages |

**Compliance:** 100%

---

### 4.2.4 Non-Functional Requirements (MANDATORY)

| Requirement | Status | Location | Details |
|-------------|--------|----------|---------|
| **Performance** | ✅ COMPLETE | Section 8.1 | API <200ms (p95), Page load <2s (3G), DB query <100ms |
| **Availability** | ✅ COMPLETE | Section 8.2 | 99.9% uptime target, Neon auto-scaling |
| **Scalability** | ✅ COMPLETE | Section 8.3 | Horizontal scaling ready, 10k concurrent users target |
| **Reliability** | ✅ COMPLETE | Section 8.4 | Daily backups (30-day retention), point-in-time recovery |
| **Maintainability** | ✅ COMPLETE | Section 8.5 | Modular architecture, TypeScript, comprehensive docs |
| **Security** | ✅ COMPLETE | Section 8.6 | Encryption (at-rest & in-transit), RBAC, session management, audit logging |

**Compliance:** 100%

---

## MOBILE APPLICATION SECURITY TESTING REQUIREMENTS

### 3.1 Business Architecture and Design (MANDATORY)

| Requirement | Status | Location | Notes |
|-------------|--------|----------|-------|
| **1. Business Architecture and Design** | ✅ COMPLETE | `replit.md`, Section 1 | Purpose, goals, main services, user types documented |
| **2. Data Flow Diagram** | ✅ COMPLETE | `docs/diagrams/DFD_*.md` | Sensitive data flows, entry points, storage, transmission documented |
| **3. System Architecture Diagram with Database Relation** | ✅ COMPLETE | `docs/diagrams/System_Architecture.md`, `docs/diagrams/ERD_Database_Schema.md` | Layers, APIs, database schemas, relationships all documented |
| **4. Native Applications** | ✅ COMPLETE | `replit.md` | **Capacitor** for iOS & Android, TypeScript, native SDK integration |
| **5. Hybrid Applications** | ✅ COMPLETE | `replit.md` | **React + Capacitor** (native wrapper), plugins documented |
| **6. Progressive Web Apps (PWA)** | ✅ COMPLETE | `replit.md` | `vite-plugin-pwa`, service workers, offline support, push notifications |
| **7. Threat Model Mapping** | ⚠️ RECOMMENDED | - | **TO CREATE** (STRIDE analysis) |
| **8. System Functionality** | ✅ COMPLETE | Section 3.4 | All features documented (auth, payments, notifications, integrations) |
| **9. Role / System Actor Relationship** | ✅ COMPLETE | Section 3.3, 5.1 | RBAC with 5 roles, permission matrix, least privilege |
| **10. Test Account** | ❌ TO CREATE | - | **CRITICAL** - Need to create 5 test accounts |
| **11. Source Code & Build Files** | ⚠️ PARTIAL | GitHub repo | Source available, **APK/IPA to build** |
| **12. API Documentation & Access** | ✅ COMPLETE | Section 4.2, 7.3 | 40+ endpoints, auth, response structures, test keys available |
| **13. Third-Party Services & SDKs** | ✅ COMPLETE | Section 3.5 | **13 services listed** with security measures (Chapa, Stripe, PayPal, TeleBirr, SendGrid, etc.) |
| **14. Authentication & Authorization Details** | ✅ COMPLETE | Section 5.1 | Passwordless OTP (SMS/Email), Bcrypt, session tokens, RBAC |
| **15. Compliance & Regulatory Requirements** | ✅ COMPLETE | Throughout doc | ERCA tax compliance, Fayda ID (eKYC), OWASP Top 10, INSA hardening |
| **16. Secure Communication Details** | ✅ COMPLETE | Section 5.6 | TLS 1.2+, HSTS, secure headers, encryption at-rest (Neon), in-transit (TLS) |
| **17. Logging & Monitoring Setup** | ✅ COMPLETE | Section 5.4 | User activity log, security events, audit trail, 90-day retention |

**Compliance:** 88% (Missing: Threat Model, Test Accounts, APK/IPA builds)

---

## OVERALL COMPLIANCE SUMMARY

### Web Application Requirements:
- **Legal Documents:** 100% ✅
- **Architecture Diagrams:** 100% ✅ (Ready to export)
- **Features Documentation:** 100% ✅
- **Testing Scope:** 0% ❌ (Test accounts needed)
- **Security Functionality:** 100% ✅
- **Secure Coding Standards:** 90% ✅
- **Functional Requirements:** 100% ✅
- **Non-Functional Requirements:** 100% ✅

**Web App Overall:** 86% (CRITICAL: Need test accounts)

### Mobile Application Requirements:
- **Architecture & Design:** 100% ✅
- **DFD:** 100% ✅
- **System Architecture:** 100% ✅
- **Native/Hybrid/PWA:** 100% ✅
- **Threat Model:** 0% ❌
- **Functionality:** 100% ✅
- **RBAC:** 100% ✅
- **Test Accounts:** 0% ❌
- **Build Files:** 0% ❌ (APK/IPA needed)
- **API Documentation:** 100% ✅
- **Third-Party Services:** 100% ✅
- **Authentication:** 100% ✅
- **Compliance:** 100% ✅
- **Secure Communication:** 100% ✅
- **Logging:** 100% ✅

**Mobile App Overall:** 82%

---

## CRITICAL ACTION ITEMS FOR 100% COMPLIANCE

### Priority 0 - CANNOT SUBMIT WITHOUT (30 minutes):

1. **Create Test Accounts** (5 roles)
   - Generate accounts in database
   - Document credentials
   - Test each role's access level
   - **Time:** 30 minutes

### Priority 1 - EXPORT DIAGRAMS (15 minutes):

2. **Export Visual Diagrams**
   - Use https://mermaid.live to export 4 diagrams
   - Save as PNG/PDF
   - Place in `2_Architecture_Diagrams/`
   - **Time:** 15 minutes

### Priority 2 - BUILD MOBILE APPS (1-2 hours):

3. **Generate Android APK**
   - Run `npx cap sync android`
   - Build APK with Android Studio or CLI
   - Test installation
   - **Time:** 1 hour

4. **Generate iOS IPA** (Optional - requires Mac)
   - Run `npx cap sync ios`
   - Build with Xcode
   - **Time:** 1 hour

### Priority 3 - ENHANCEMENTS (4-6 hours):

5. **Write Threat Model Document** (STRIDE)
   - Map attack vectors
   - Document mitigations
   - Risk assessment
   - **Time:** 4-6 hours

6. **Create Standalone Secure Coding Policy**
   - Formalize internal guidelines
   - Developer checklist
   - Code review process
   - **Time:** 2-3 hours

---

## SUBMISSION TIMELINE

| Task | Duration | Can Start | Blocker |
|------|----------|-----------|---------|
| Export Diagrams | 15 min | Immediately | None |
| Create Test Accounts | 30 min | Immediately | None |
| Build Android APK | 1 hour | Immediately | None |
| Write Threat Model | 4-6 hours | Immediately | None (optional) |
| Secure Coding Policy | 2-3 hours | Immediately | None (optional) |

**Minimum Time to 100% Compliance:** 45 minutes (diagrams + test accounts)  
**With Mobile APK:** 1 hour 45 minutes  
**With All Enhancements:** 7-10 hours

---

## SUBMISSION CHECKLIST

**Before Submitting to INSA:**

- [x] Legal documents collected (6 PDFs) ✅
- [ ] Visual diagrams exported (4 PNGs/PDFs) ⏳ 15 minutes
- [ ] Test accounts created (5 roles) ❌ CRITICAL - 30 minutes
- [ ] Test credentials documented ❌ CRITICAL
- [ ] Android APK built ⏳ Optional for web audit
- [ ] iOS IPA built ⏳ Optional
- [ ] Threat Model written ⏳ Recommended
- [ ] Secure Coding Policy standalone ⏳ Recommended
- [ ] Source code packaged (ZIP) ⏳ Easy
- [ ] CD/DVD prepared ⏳ For physical submission
- [ ] Portal submission completed ⏳ Final step

---

## INSA SUBMISSION CONTACT

**Submit Via Portal:**  
🌐 https://cyberaudit.insa.gov.et/sign-up

**Or Email:**  
📧 tilahune@insa.gov.et

**Contact Person:**  
Dr. Tilahun Ejigu  
Cyber Security Audit Division Head  
📱 +251 937 456 374

**Deadline:**  
Within 5 working days from receipt

---

**Document Prepared By:** Alga Development Team  
**Last Updated:** November 6, 2025  
**Standard:** INSA OF/AEAD/001  
**Current Compliance:** 86% (Web), 82% (Mobile)  
**Time to 100%:** 45 minutes (critical items only)

🇪🇹 **Ready for INSA Submission After Creating Test Accounts** ✨
