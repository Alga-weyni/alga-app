# WEB APPLICATION SECURITY AUDIT REQUEST

**Document Number:** OF/AEAD/001  
**Submission Date:** November 7, 2025  
**Application Type:** Web Application

---

## COVER PAGE

**Company Name:** Alga One Member PLC  
**Taxpayer Identification Number (TIN):** 0101809194  
**Business Registration Number:** [Your registration number]  

**Application Name:** Alga - Ethiopian Property Rental Platform (Web)  
**Application Type:** Web Application + Progressive Web App (PWA)  
**Application URL:** https://alga-staging.onrender.com  

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

To become Ethiopia's leading property rental platform, connecting property owners with travelers through secure, culturally-authentic digital experiences.

### Business Model

Alga operates as a digital marketplace connecting:
- **Property Owners (Hosts):** List properties for short-term rental
- **Travelers (Guests):** Book verified accommodations across Ethiopia
- **Service Providers:** Offer add-on services (cleaning, food delivery)
- **Delala Agents:** Earn 5% commission for bringing properties to platform

### Market Coverage

**10 Major Ethiopian Cities:**
- Addis Ababa, Bahir Dar, Lalibela, Hawassa, Gondar, Axum, Harar, Dire Dawa, Jimma, Mekelle

**Multilingual Support:**
- Amharic, English, Tigrinya, Afaan Oromoo, Chinese

### Regulatory Compliance

✅ **ERCA Compliance:** All transactions logged, 15% VAT, 2% withholding tax, invoice generation  
✅ **National Bank of Ethiopia:** Licensed payment processors (Chapa, TeleBirr)  
✅ **Ethiopian Business Registry:** Active trade license  
✅ **INSA:** Seeking web application security certification

---

## 2. INTRODUCTION

### Purpose of Web Application Audit

Alga One Member PLC submits this web application for comprehensive security audit by INSA's Cyber Security Audit Division. This audit covers our responsive web interface and Progressive Web App (PWA).

### Web Application Description

**Platform:** Alga Property Rental Web Application

**Key Features:**
- **Responsive Design:** Mobile, tablet, desktop optimization
- **Progressive Web App (PWA):** Installable, offline-capable
- **Real-time Search:** Property search across Ethiopia
- **Secure Booking:** Multi-payment gateway integration
- **AI Assistant:** "Lemlem" cultural support chatbot
- **Admin Dashboard:** Property verification, user management

**User Roles:**
1. **Guest** - Browse and book properties
2. **Host** - List and manage properties
3. **Operator** - Verify IDs and properties
4. **Admin** - Platform management and reporting

### Technical Architecture

**Frontend Technology:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5.0
- **Routing:** Wouter (lightweight React router)
- **UI Components:** Shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** TanStack Query v5
- **Form Validation:** React Hook Form + Zod
- **Styling:** Tailwind CSS with custom theme

**Backend Technology:**
- **Runtime:** Node.js 20
- **Framework:** Express.js with TypeScript
- **API Architecture:** RESTful API (50+ endpoints)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM (SQL injection prevention)
- **Session Store:** connect-pg-simple (PostgreSQL-backed)

**Security Infrastructure:**
- **Authentication:** OTP (SMS/Email) + Password (Bcrypt)
- **Authorization:** Role-Based Access Control (RBAC)
- **Rate Limiting:** 100 req/15min global, 10 req/15min auth
- **Input Validation:** Zod schemas + express-validator
- **XSS Protection:** React auto-escape + xss-clean middleware
- **CSRF Protection:** SameSite cookies
- **Security Headers:** Helmet.js
- **Encryption:** TLS 1.2+ in transit, AES-256 at rest

**Deployment Architecture:**
- **Hosting:** Render (SOC 2 Type II certified)
- **Database:** Neon PostgreSQL (SOC 2, ISO 27001)
- **Object Storage:** Google Cloud Storage
- **CDN:** Render edge network
- **SSL/TLS:** Automatic Let's Encrypt certificates

### Payment Integration

**Supported Processors:**
- **Chapa:** Ethiopian payments (TeleBirr, CBE Birr, bank transfers)
- **Stripe:** International credit/debit cards (PCI DSS Level 1)
- **PayPal:** Alternative international payments
- **TeleBirr:** Agent commission payouts

**Security:** No raw card data stored, tokenization only, webhook signature verification

### Scope of Web Application Audit

**In Scope:**
1. ✅ Responsive web interface (desktop, tablet, mobile browsers)
2. ✅ Progressive Web App (PWA) installable version
3. ✅ All 50+ REST API endpoints
4. ✅ Authentication and authorization mechanisms
5. ✅ Session management and timeout policies
6. ✅ Payment processing security
7. ✅ Admin dashboard and operator tools
8. ✅ Database security and encryption
9. ✅ Third-party integrations security
10. ✅ OWASP Top 10 (2021) compliance

**Out of Scope (Separate Mobile App Audit):**
- ❌ Android native application (APK)
- ❌ iOS native application (IPA)
- ❌ Mobile-specific biometric authentication
- ❌ Native device permissions (camera, location)

### Test Environment

**Staging URL:** https://alga-staging.onrender.com

**Test Accounts (All roles):**
- **Password:** INSA_Test_2025! (all accounts)
- Guest: insa-guest@test.alga.et
- Host: insa-host@test.alga.et
- Admin: insa-admin@test.alga.et
- Operator: insa-operator@test.alga.et
- Agent: insa-agent@test.alga.et
- Service Provider: insa-service@test.alga.et

**Test Data:**
- 10 properties across Ethiopia
- 50 bookings with full transaction data
- 1 verified Delala agent
- 1 approved service provider

---

## 3. OBJECTIVE OF CERTIFICATE REQUESTED

### Primary Objectives

#### 3.1 Web Application Security Certification
We seek INSA's certification confirming that our web application meets all Ethiopian cybersecurity standards for:
- Web application security (OWASP Top 10)
- API security and authorization
- Payment transaction security
- User data protection
- Session management
- Progressive Web App security

#### 3.2 Regulatory Compliance Verification
Obtain confirmation of compliance with:
- **INSA Security Standards:** Government-mandated web security requirements
- **Ethiopian Data Protection:** Safeguarding personal information
- **ERCA Tax Compliance:** Proper financial transaction logging (TIN: 0101809194)
- **Payment Security:** National Bank regulations compliance

#### 3.3 User Trust and Platform Credibility
INSA web certification will provide:
- **Trust Badge:** Display INSA certification on website
- **User Confidence:** Assurance of government-verified security
- **Investor Confidence:** Demonstrated regulatory compliance
- **Partnership Credibility:** Trust for B2B integrations

### Security Validation Areas

**1. Authentication Security:**
- ✅ OTP delivery via Ethiopian Telecom SMS and SendGrid email
- ✅ Password strength enforcement (min 8 chars, complexity)
- ✅ Bcrypt hashing with 10 salt rounds
- ✅ Rate limiting: 10 OTP requests per 15 minutes
- ✅ Session regeneration on login (session fixation prevention)

**2. Authorization Security:**
- ✅ Role-Based Access Control (4 roles: Guest, Host, Operator, Admin)
- ✅ Resource-level ownership checks
- ✅ Principle of least privilege
- ✅ Admin action audit trails

**3. Session Management:**
- ✅ PostgreSQL-backed session storage
- ✅ 24-hour session timeout
- ✅ HttpOnly cookies (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=lax (CSRF protection)
- ✅ 256-bit random session IDs

**4. Input Validation:**
- ✅ Zod schema validation on all inputs
- ✅ express-validator middleware
- ✅ XSS sanitization (xss-clean)
- ✅ SQL injection prevention (Drizzle ORM parameterized queries only)
- ✅ NoSQL injection prevention (mongo-sanitize)
- ✅ File upload validation (type, size limits)

**5. API Security:**
- ✅ Authentication required for sensitive endpoints
- ✅ Authorization checks on all protected routes
- ✅ Rate limiting per IP address
- ✅ Request/response validation
- ✅ Error messages sanitized (no stack traces in production)

**6. Payment Security:**
- ✅ PCI DSS compliance via Level 1 certified processors
- ✅ No storage of raw card data
- ✅ Server-side price calculation (client cannot manipulate)
- ✅ Idempotency keys prevent duplicate charges
- ✅ Webhook signature verification

**7. PWA Security:**
- ✅ HTTPS-only service workers
- ✅ Secure cache storage
- ✅ Network-first strategy for API calls
- ✅ Automatic cache invalidation

### Expected Outcomes

**We request INSA to provide:**
1. **Web Application Security Audit Report**
2. **Certification Letter** (if approved)
3. **Security Recommendations** for any findings
4. **INSA Web Security Badge** for displaying on website
5. **Re-certification Timeline** (annual/bi-annual guidance)

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

### 4.2 Technical Documentation

#### 4.2.1 Business Architecture and Design

**a) Data Flow Diagram (DFD)**

✅ **Context-Level DFD (Level 0):** Shows system and external actors  
✅ **Detailed DFDs (Level 1/2):** Shows internal processes and data stores

**Location:** `docs/diagrams/DFD_Context_Level_0.md`, `docs/diagrams/DFD_Detailed_Level_1.md`

**b) System Architecture Diagram**

✅ **Deployment Architecture:** Cloud infrastructure layout  
✅ **Component Architecture:** Frontend/backend modules  
✅ **Security Layers:** DMZ, SSL/TLS, WAF concepts

**Location:** `docs/diagrams/Deployment_Architecture.md`, `docs/diagrams/Component_Architecture.md`, `docs/diagrams/Security_Layers.md`

**c) Entity Relationship Diagram (ERD)**

✅ **Complete Database Schema:** 27 tables with relationships  
✅ **Sensitive Fields Marked:** Encryption requirements noted

**Location:** `docs/diagrams/ERD_Database_Schema.md`

#### 4.2.2 Features of the Web Application

✅ **Development Framework:** React + TypeScript (Vite)  
✅ **Libraries:** Radix UI, Tailwind CSS, TanStack Query, Zod  
✅ **Third-Party Services:** Chapa, Stripe, SendGrid, Google Cloud  
✅ **User Roles:** Guest, Host, Operator, Admin  
✅ **Security Standards:** OWASP Top 10, NIST CSF  
✅ **Existing Security:** Helmet.js, rate limiting, RBAC, encryption

**Location:** `docs/insa/THIRD_PARTY_SERVICES.md`

#### 4.2.3 Define Specific Testing Scope

**Test Assets:**

| Asset Name | URL/IP Address | Test Account Credentials |
|------------|----------------|--------------------------|
| **Staging Web Portal** | https://alga-staging.onrender.com | All accounts: INSA_Test_2025! |
| **Guest Portal** | /auth/login | insa-guest@test.alga.et |
| **Host Dashboard** | /host/dashboard | insa-host@test.alga.et |
| **Admin Panel** | /admin/users | insa-admin@test.alga.et |
| **Operator Dashboard** | /operator/verification | insa-operator@test.alga.et |
| **API Endpoints** | /api/* | Session-based auth |

**Location:** `docs/insa/INSA_TEST_CREDENTIALS.md`

#### 4.2.4 Security Functionality Document

✅ **User Roles and Access Control:** RBAC implementation  
✅ **Input Validation:** Zod + express-validator  
✅ **Session Management:** Express sessions, cookie flags, timeouts  
✅ **Error Handling:** Sanitized error messages  
✅ **Secure Communications:** TLS/SSL, HTTPS enforcement  
✅ **Function Descriptions:** All API endpoints documented

**Location:** `docs/insa/SECURITY_FUNCTIONALITY.md`, `docs/insa/API_DOCUMENTATION.md`

#### 4.2.5 Secure Coding Standard Documentation

✅ **OWASP Secure Coding Practices:** Followed throughout  
✅ **Development Checklist:** Security checks before deployment  
✅ **SQLi Prevention:** Drizzle ORM only, no raw SQL  
✅ **XSS Prevention:** React auto-escape, xss-clean  
✅ **CSRF Prevention:** SameSite cookies  
✅ **File Upload Controls:** Type validation, size limits  
✅ **Authentication & Session:** OTP, Bcrypt, secure cookies  
✅ **Regular Patching:** Monthly npm audit, Dependabot

**Location:** `docs/insa/SECURITY_FUNCTIONALITY.md`

#### 4.2.3 Functional Requirements

✅ **Core Workflows:** User registration, login, property booking, payment processing  
✅ **Input/Output Validation:** All endpoints validated  
✅ **API Endpoints:** 50+ documented with request/response structures  
✅ **Access Control:** RBAC definitions for each endpoint  
✅ **Logging:** User activity, authentication, payment transactions  
✅ **Error Handling:** Graceful degradation, sanitized messages

**Location:** `docs/insa/API_DOCUMENTATION.md`

#### 4.2.4 Non-Functional Requirements

✅ **Performance:** <2s page load, optimized queries, CDN  
✅ **Availability:** 99.9% uptime target via Render platform  
✅ **Scalability:** Serverless database, horizontal scaling ready  
✅ **Reliability:** Automated backups, point-in-time recovery  
✅ **Maintainability:** TypeScript, modular code, documentation  
✅ **Security:** Encryption, authentication, authorization, audit logging

**Location:** `docs/insa/SECURITY_FUNCTIONALITY.md`

#### 4.2.5 Threat Modeling

✅ **Identified Threats:** SQL injection, XSS, CSRF, session hijacking, privilege escalation  
✅ **Risk Assessment:** STRIDE analysis for each threat  
✅ **Mitigation Strategies:** Implemented and documented  
✅ **Attack Surface Analysis:** Entry points, exposed APIs, third-party integrations  
✅ **Security Assumptions:** TLS enforcement, trusted infrastructure

**Required Submission:**
- ✅ STRIDE threat model diagrams
- ✅ Risk assessment matrix
- ✅ Security control mapping

**Location:** `docs/insa/THREAT_MODEL.md`

### 5. API Security Documentation

#### 5.1 API Type
✅ **REST API** with JSON data format

#### 5.2 API Documentation
✅ **Complete API Documentation:** All 50+ endpoints  
✅ **Request/Response Examples:** Sample payloads included  
✅ **Authentication Flows:** Session-based authentication  
✅ **Error Codes:** HTTP status codes documented

**Location:** `docs/insa/API_DOCUMENTATION.md`

#### 5.3 API Endpoints and Functionality
✅ **Categorized Endpoints:** Public, private, internal  
✅ **HTTP Methods:** GET, POST, PUT, PATCH, DELETE

**Categories:**
- Authentication: `/api/auth/*`
- Properties: `/api/properties/*`
- Bookings: `/api/bookings/*`
- Admin: `/api/admin/*`
- Payments: `/api/payment/*`

#### 5.4 Authentication Mechanism
✅ **Session-Based:** Express sessions with PostgreSQL storage  
✅ **Token Lifecycle:** 24-hour session timeout  
✅ **OTP Verification:** 5-minute expiry

#### 5.5 Third-Party Integrations
✅ **Payment Processors:** Chapa, Stripe, PayPal (security assessed)  
✅ **Communication:** SendGrid, Ethiopian Telecom  
✅ **Storage:** Google Cloud Storage  
✅ **Data Exchange:** HTTPS only, signature verification

**Location:** `docs/insa/THIRD_PARTY_SERVICES.md`

#### 5.6 Compliance
✅ **PCI DSS:** Via certified payment processors  
✅ **OWASP Top 10:** 100% coverage  
✅ **ERCA:** Tax compliance (TIN: 0101809194)

#### 5.7 Authorization and Access Control
✅ **RBAC:** 4 user roles with defined permissions  
✅ **Least Privilege:** Resource-level ownership checks

**Location:** `docs/insa/AUTHENTICATION_AUTHORIZATION.md`

#### 5.8 Test Account
✅ **6 Test Accounts:** Covering all privilege levels (admin, host, guest, operator, agent, service provider)

**Location:** `docs/insa/INSA_TEST_CREDENTIALS.md`

---

## 5. CONCLUSION

### Summary

Alga One Member PLC has developed a secure, OWASP-compliant web application for the Ethiopian property rental market. Our platform implements:

✅ **OWASP Top 10 (2021) - 100% Coverage**  
✅ **ERCA Tax Compliance** (TIN: 0101809194)  
✅ **NIST Cybersecurity Framework**  
✅ **PCI DSS by Proxy** (Level 1 processors)  
✅ **SOC 2 Type II Infrastructure**

### Our Commitment

We commit to:
1. **Full Collaboration** with INSA Cyber Security Audit Division
2. **Timely Responses** within 5 working days for all findings
3. **Prompt Remediation** of any identified vulnerabilities
4. **Complete Transparency** in all technical disclosures
5. **Ongoing Compliance** and periodic re-certification

### Readiness for Audit

✅ **Staging Environment:** Live at https://alga-staging.onrender.com  
✅ **Test Accounts:** 6 accounts with all user roles  
✅ **Test Data:** Complete dataset for comprehensive testing  
✅ **Documentation:** 9 security documents, 7 architecture diagrams  
✅ **INSA Portal Access:** Ready for online submission

### Impact

INSA web application certification will:
- Protect Ethiopian citizens' personal and financial data
- Enable safe launch of digital platform creating economic opportunities
- Demonstrate Ethiopian tech companies can meet international security standards
- Set security benchmark for Ethiopian digital platforms

We appreciate INSA's commitment to strengthening Ethiopia's digital security and look forward to collaborative improvement of our platform's security posture.

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
1. Data Flow Diagrams (Context + Detailed)
2. System Architecture Diagrams (3 documents)
3. Entity Relationship Diagram (ERD)
4. Security Functionality Document
5. Threat Model (STRIDE Analysis)
6. API Documentation (50+ endpoints)
7. Authentication & Authorization Details
8. Third-Party Services Security Assessment
9. Test Account Credentials
10. Compliance Requirements Documentation

---

**Submission Method:**
☐ Online Portal: https://cyberaudit.insa.gov.et/sign-up  
☐ Email: tilahune@insa.gov.et  
☐ Physical Delivery: INSA Office, Wollo Sefer, Addis Ababa

**Expected Response:** Within 5 working days from date of receipt

---

**Declaration:**

I, Weyni Abraha, Founder & CEO of Alga One Member PLC, hereby declare that all information provided in this web application security audit submission is accurate, complete, and truthful. The Alga web application has been developed in full compliance with Ethiopian laws and regulations, and we are committed to maintaining the highest standards of cybersecurity.

**Signature:** _______________________  
**Name:** Weyni Abraha  
**Title:** Founder & CEO  
**Date:** November 7, 2025  

---

**For INSA Use Only:**

**Received Date:** ______________  
**Assigned Auditor:** ______________  
**Audit Completion Date:** ______________  
**Certification Decision:** ☐ Approved ☐ Conditional ☐ Rejected  
**INSA Signature:** _______________________
