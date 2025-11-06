# WEB APPLICATION SECURITY AUDIT REQUEST
## INSA Cyber Security Audit Division

---

**Document Type:** Web Application Security Testing Requirements  
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

### **Application Type:** Web Application (Full-Stack Platform)

### **Description:**
Alga is a comprehensive property rental marketplace connecting property owners (hosts) with travelers (guests) across Ethiopia. The web platform provides property listings, secure bookings, integrated payments, ID verification, and commission-based agent support through a modern React-based frontend and Node.js backend.

### **Technology Stack:**
- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Node.js 20, Express.js, TypeScript
- **Database:** PostgreSQL (Neon Serverless)
- **Deployment:** Cloud-based (Replit Infrastructure)
- **Security:** INSA-hardened security controls, OWASP Top 10 compliance

### **User Roles:**
1. **Guest** - Browse and book properties
2. **Host** - List and manage properties
3. **Agent (Delala)** - Link properties for commission
4. **Operator** - Verify IDs and moderate content
5. **Admin** - Full platform management

### **Key Features:**
- Property search and booking system
- Multi-currency support (ETB, USD, EUR, CNY)
- Integrated payment gateway (Alga Pay with Chapa, Stripe, PayPal, TeleBirr)
- ID verification (Fayda ID integration + manual operator review)
- Commission system for agents (5% for 36 months)
- Review and rating system (ALGA Review Engine)
- Add-on services marketplace (11 categories)
- Multi-language support (Amharic, English, Tigrinya, Afaan Oromoo, Chinese)

---

## Audit Request Scope

### **Primary Assets to be Tested:**

| Asset Name | URL/Environment | Test Accounts Provided |
|------------|-----------------|------------------------|
| Public Web Portal | https://staging.alga.et | 5 test accounts (all roles) |
| Admin Dashboard | https://staging.alga.et/admin | admin@alga.et |
| Host Portal | https://staging.alga.et/host-dashboard | host@alga.et |
| Agent Dashboard | https://staging.alga.et/agent-dashboard | agent@alga.et |
| Operator Panel | https://staging.alga.et/operator | operator@alga.et |

### **Backend API:**
- **Base URL:** https://staging.alga.et/api
- **Authentication:** Session-based (PostgreSQL store)
- **Endpoints:** 40+ RESTful API endpoints
- **Documentation:** Included in this submission

### **External Integrations:**
- Chapa Payment Gateway (Ethiopian payment processor)
- Stripe (International payments)
- PayPal (International payments)
- TeleBirr (Ethiopian mobile money)
- Fayda ID (Ethiopian national ID verification)
- SendGrid (Email notifications)
- Google Maps (Location services)

---

## Submission Package Contents

This submission includes all mandatory requirements as per INSA's "Web Application Security Testing Requirements Document v2":

### **1. Legal and Administrative Documents** ✅
**Folder:** `1_Legal_Documents/`
- Updated Trade License - Software Development (AACATB/14/665/43714506/2018)
- Updated Trade License - E-commerce Platform (AACATB/14/665/43714866/2018)
- Updated Trade License - Commission/Brokers (AACATB/14/665/43714893/2018)
- Updated Trade License - Construction Finishing (AACATB/14/665/43714793/2018)
- Commercial Registration Certificate (AACATB/21/0236562/2018)
- TIN Certificate (0101809194)

### **2. Business Architecture and Design** ✅
**Folder:** `2_Architecture_Diagrams/`

**a) Data Flow Diagram (DFD):**
- Context-Level DFD (Level 0) - Shows system boundary and external actors
- Detailed DFD (Level 1) - Shows 7 internal processes and data flows
- Source files: Mermaid diagrams ready for export to PNG/PDF

**b) System Architecture Diagram:**
- 5-layer architecture (Internet → Security → Application → Storage → External)
- Deployment architecture (Cloud-based with auto-scaling)
- Component architecture (Frontend, Backend, Database, External Services)
- Security layers (TLS, CORS, Rate Limiting, INSA Hardening, WAF)

**c) Entity Relationship Diagram (ERD):**
- 20+ database tables documented
- Primary/foreign key relationships mapped
- Sensitive fields marked (🔒 passwords, payment info, IDs)
- Cardinality notation (one-to-many, many-to-many)

### **3. Features of the Web Application** ✅
**Folder:** `5_Features_Documentation/`
- Development frameworks: React, Express.js, Drizzle ORM
- Libraries: 85+ npm packages (listed in documentation)
- Custom modules: Authentication, Booking Engine, Payment Gateway, Review System
- Third-party integrations: 9 external services
- User types: 5 roles with granular permissions
- Security infrastructure: Helmet.js, CORS, Rate Limiting, XSS Protection, SQL Injection Prevention (100% ORM)

### **4. Define Specific Testing Scope** ✅
**Folder:** `4_Test_Credentials/`
- **5 Production-Ready Test Accounts:**
  - Guest: guest@alga.et / Guest@2025
  - Host: host@alga.et / Host@2025
  - Agent: agent@alga.et / Dellala#2025
  - Operator: operator@alga.et / Operator#2025
  - Admin: admin@alga.et / AlgaAdmin#2025
- All accounts active in staging database with bcrypt-hashed passwords
- 20+ documented test scenarios
- Complete capability documentation for each role

### **5. Security Functionality Document** ✅
**Folder:** `3_Security_Documentation/`
- **User Roles and Access Control:** RBAC with 5 roles and granular permissions
- **Input Validation:** Multi-layer (Zod schemas, express-validator, INSA hardening)
- **Session Management:** PostgreSQL sessions, httpOnly cookies, 24-hour timeout
- **Error Handling:** Generic production errors, server-side logging
- **Secure Communications:** TLS 1.2+, HSTS, secure headers (Helmet.js)
- **Technical Documentation:** 1,100+ lines covering all security controls

### **6. Secure Coding Standard Documentation** ✅
**Folder:** `3_Security_Documentation/`
- OWASP Secure Coding Practices implementation
- 100% Drizzle ORM (zero raw SQL - SQL injection impossible)
- XSS prevention (React auto-escaping + custom detection)
- CSRF protection (SameSite cookies, origin validation)
- Input validation on all endpoints (Zod + express-validator)
- File upload controls (5MB limit, type validation, compression)
- Authentication: Bcrypt (10 rounds), secure sessions
- Regular dependency updates (npm audit weekly)

### **7. Functional Requirements** ✅
**Folder:** `5_Features_Documentation/`
- Core workflows documented (registration, login, booking, payment)
- Input/output validation rules
- 40+ API endpoints with request/response structures
- Role-based access control definitions
- Comprehensive logging (user activity, security events)
- Error handling and exception management

### **8. Non-Functional Requirements** ✅
**Folder:** `5_Features_Documentation/`
- **Performance:** <2s page load, 1000+ concurrent users supported
- **Availability:** 99.9% uptime target, Neon DB auto-failover
- **Scalability:** Serverless architecture, auto-scaling backend
- **Reliability:** Daily automated backups, 30-day point-in-time recovery
- **Maintainability:** TypeScript strict mode, comprehensive documentation
- **Security:** AES-256 encryption at-rest, TLS 1.2+ in-transit, session management, audit logging

---

## Additional Documentation Provided

### **API Documentation** ✅
**Folder:** `6_API_Documentation/`
- Complete API endpoint listing (40+ endpoints)
- Request/response examples for each endpoint
- Authentication requirements
- Error codes and handling
- Rate limiting details
- Integration examples

### **INSA Compliance Matrix** ✅
**Folder:** `3_Security_Documentation/`
- Official INSA requirements mapped to implementation
- Web Application Compliance: 95%
- Gap analysis with remediation plans
- Code verification for security controls

---

## Security Highlights

### **OWASP Top 10 2021 Coverage:**
- ✅ **A01: Broken Access Control** - RBAC with server-side enforcement
- ✅ **A02: Cryptographic Failures** - TLS, bcrypt, AES-256
- ✅ **A03: Injection** - 100% Drizzle ORM (SQL injection eliminated)
- ✅ **A04: Insecure Design** - Threat modeling, security-by-design
- ✅ **A05: Security Misconfiguration** - INSA hardening layer
- ✅ **A06: Vulnerable Components** - Weekly npm audit
- ✅ **A07: Authentication Failures** - Bcrypt, rate limiting, session management
- ✅ **A08: Software/Data Integrity** - Audit logging, validation
- ✅ **A09: Logging Failures** - Comprehensive activity logging
- ✅ **A10: SSRF** - No SSRF vectors (external calls controlled)

**Coverage:** 10/10 (100%)

### **Active Security Controls:**
1. Helmet.js (security headers)
2. CORS protection (configured origins)
3. Rate limiting (100 req/15min per IP)
4. XSS protection (custom INSA layer + React escaping)
5. SQL injection prevention (100% ORM)
6. CSRF protection (SameSite cookies)
7. Input validation (Zod + express-validator)
8. Session security (httpOnly, secure, 24hr timeout)
9. Password security (Bcrypt 10 rounds)
10. Error sanitization (no stack traces in production)
11. Audit logging (user activity, security events)
12. File upload protection (size limits, type validation)
13. MongoDB sanitization (express-mongo-sanitize)
14. HPP protection (HTTP Parameter Pollution)

### **Ethiopian Regulatory Compliance:**
- ✅ Fayda ID integration (national ID verification)
- ✅ ERCA tax compliance (VAT, withholding tax)
- ✅ TeleBirr integration (local payment method)
- ✅ Chapa integration (Ethiopian payment gateway)
- ✅ Multi-language support (Amharic primary)

---

## Testing Environment Access

### **Staging Environment:**
- **URL:** https://staging.alga.et
- **Database:** PostgreSQL (isolated staging instance)
- **Test Data:** Populated with sample properties and bookings
- **External Services:** Sandbox/test mode enabled

### **Test Account Credentials:**
All credentials provided in `4_Test_Credentials/test_credentials.csv`

### **VPN/Access Requirements:**
No VPN required - staging environment publicly accessible for audit purposes

---

## Expected Audit Timeline

Based on INSA requirements:
- **Document Review:** 5 working days from submission
- **Audit Planning Meeting:** Within 1 week
- **Security Testing:** 2-3 weeks
- **Report Generation:** 1 week
- **Remediation (if needed):** 2-4 weeks
- **Certification:** Total 8-12 weeks

---

## Contact Information for Audit

**Primary Contact:** Mss. Weyni Abraha  
**Role:** Project Manager  
**Phone:** +251 99 603 4044  
**Email:** [your email]  
**Availability:** Monday-Friday, 9:00 AM - 6:00 PM EAT

**Technical Contact:** Development Team  
**Email:** dev@alga.et  
**For:** Technical questions, access issues, architecture clarifications

---

## Acknowledgment

We, ALGA ONE MEMBER PLC, hereby submit this Web Application Security Audit Request to INSA in compliance with the "Web Application Security Testing Requirements Document v2". We confirm that:

✅ All mandatory documents are included  
✅ Test accounts are functional and ready  
✅ Technical documentation is complete and accurate  
✅ We authorize INSA to conduct security testing on our staging environment  
✅ We commit to addressing any identified vulnerabilities promptly  

We look forward to INSA's professional security assessment and guidance to strengthen our platform's security posture.

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

🇪🇹 **Building Ethiopia's Most Secure Property Rental Platform**

**Document Prepared By:** Alga Development Team  
**Package Version:** 1.0  
**Last Updated:** November 6, 2025
