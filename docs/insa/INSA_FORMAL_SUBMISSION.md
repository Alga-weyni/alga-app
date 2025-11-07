# MOBILE APPLICATIONS AUDIT REQUEST

**Document Number:** OF/AEAD/001  
**Submission Date:** November 7, 2025  

---

## COVER PAGE

**Company Name:** Alga One Member PLC  
**Taxpayer Identification Number (TIN):** 0101809194  
**Business Registration Number:** [Registration Number]  

**Application Name:** Alga - Ethiopian Property Rental Platform  
**Application Type:** Mobile Application (Android & iOS) + Web Application  

**Company Address:**  
Addis Ababa, Ethiopia  
[Specific address]  

**Contact Person:**  
Name: [Your Name]  
Title: [Your Title]  
Email: [your-email@alga.et]  
Phone: [+251 9xx xxx xxx]  

**INSA Audit Contact:**  
Dr. Tilahun Ejigu (Ph.D.)  
Division Head, Cyber Security Audit Division  
Wollo Sefer, Addis Ababa, Ethiopia  
Email: tilahune@insa.gov.et  
Mobile: +251 937 456 374  

---

## 1. BACKGROUND OF ORGANIZATION

### Company Overview

**Alga One Member PLC** is an Ethiopian technology company established to transform the hospitality and property rental sector in Ethiopia. Registered under Ethiopian law with TIN 0101809194, our company operates with full compliance to Ethiopian Revenue and Customs Authority (ERCA) regulations and all applicable business laws.

### Mission Statement

To become the leading platform for Ethiopian hospitality, connecting property owners with travelers while providing a secure, culturally immersive, and economically empowering experience for all stakeholders.

### Business Model

Alga operates as a digital marketplace platform connecting:
- **Property Owners (Hosts):** Individuals and businesses listing properties for short-term rental
- **Travelers (Guests):** Domestic and international visitors seeking accommodation
- **Service Providers:** Local businesses offering add-on services (cleaning, food delivery, beauty services)
- **Delala Agents:** Community property agents earning commissions for bringing listings to the platform

### Market Position

Alga addresses a critical gap in the Ethiopian market by providing:
- **Safe and verified accommodations** across major Ethiopian cities (Addis Ababa, Bahir Dar, Lalibela, Hawassa, Gondar, Axum, Harar, Dire Dawa, Jimma, Mekelle)
- **Cultural authenticity** with Ethiopian-language support (Amharic, Tigrinya, Afaan Oromoo)
- **Local payment integration** supporting Chapa, TeleBirr, and international processors
- **Economic opportunity** for property owners and local service providers

### Regulatory Compliance

Alga One Member PLC maintains full compliance with:
- **ERCA (Ethiopian Revenues and Customs Authority):** All transactions logged, 15% VAT applied, 2% withholding tax collected, ERCA-compliant invoices generated
- **National Bank of Ethiopia:** Using licensed payment processors (Chapa, TeleBirr)
- **Ethiopian Business Registry:** Active trade license, renewable annually
- **INSA (Information Network Security Administration):** Seeking security certification through this audit

### Company Values

1. **Security First:** Protecting user data and financial transactions with government-grade security
2. **Cultural Respect:** Honoring Ethiopian traditions while embracing modern technology
3. **Economic Empowerment:** Creating income opportunities for hosts, agents, and service providers
4. **Transparency:** Clear pricing, fair commission structures, and honest business practices
5. **Innovation:** Continuously improving platform features based on user feedback

---

## 2. INTRODUCTION

### Purpose of This Submission

Alga One Member PLC hereby submits this comprehensive security audit request to the Information Network Security Administration (INSA) Cyber Security Audit Division for review and certification of our mobile and web applications.

### Application Description

**Alga Platform** is a full-stack web and mobile application that enables:

**For Guests:**
- Browse and search properties across Ethiopia
- Book accommodations with secure payment processing
- Verify host identity through government-approved eKYC
- Access cultural AI assistant "Lemlem" for support
- Book add-on services (cleaning, food delivery, transportation)
- Leave reviews and ratings for properties

**For Hosts:**
- List properties with photos and detailed descriptions
- Manage bookings and availability calendars
- Receive 100% of booking amounts via Alga Pay
- Access host dashboard with earnings analytics
- Respond to guest reviews
- Configure Lemlem AI with property-specific information

**For Administrators:**
- Verify user identities and property listings
- Monitor platform financial transactions
- Generate ERCA-compliant tax reports
- Manage user roles and permissions
- Access comprehensive audit logs

**For Delala Agents:**
- Register as commission agents
- Link properties to earn 5% commission for 36 months
- Track earnings via TeleBirr payouts
- View real-time commission dashboard

### Technical Architecture

**Frontend:**
- React with TypeScript (Vite build tool)
- Responsive design for mobile and desktop
- Progressive Web App (PWA) with offline capabilities
- Native Android and iOS apps via Capacitor

**Backend:**
- Node.js with Express.js framework
- RESTful API architecture
- PostgreSQL database (Neon serverless)
- Session-based authentication

**Security Infrastructure:**
- OTP authentication via SMS/Email
- Bcrypt password hashing (10 salt rounds)
- Role-Based Access Control (4 roles)
- Rate limiting (100 req/15min global, 10 req/15min auth)
- Encryption at rest (AES-256) and in transit (TLS 1.2+)
- Input validation and sanitization on all endpoints

**Payment Integration:**
- Chapa (Ethiopian payment gateway)
- Stripe (international cards)
- PayPal (alternative international)
- TeleBirr (agent commission payouts)

### Scope of Audit Request

We request INSA to conduct a comprehensive security audit covering:

1. **Mobile Applications:**
   - Android application (APK)
   - iOS application (IPA)

2. **Web Application:**
   - Responsive web interface
   - Progressive Web App (PWA)
   - API backend services

3. **Security Assessment Areas:**
   - Authentication and authorization mechanisms
   - Data encryption (at rest and in transit)
   - Input validation and injection prevention
   - Session management and timeout policies
   - Payment security and PCI DSS compliance
   - Access control and privilege management
   - API security and rate limiting
   - Mobile application security (Android/iOS)
   - Compliance with OWASP Top 10 (2021)

### Deployment Environment

**Staging Environment (For INSA Testing):**
- URL: https://alga-staging.onrender.com
- Database: Neon PostgreSQL (serverless)
- Object Storage: Google Cloud Storage
- Hosting: Render platform (SOC 2 Type II certified)

**Production Environment (Future):**
- Will be deployed only after INSA security certification approval
- Same infrastructure as staging with production secrets

### User Base and Impact

**Current Status:** Pre-launch (awaiting INSA certification)

**Projected Impact:**
- **Year 1:** 1,000+ hosts, 10,000+ guests, 50,000+ bookings
- **Year 3:** 5,000+ hosts, 100,000+ guests, 500,000+ bookings
- **Economic Impact:** ETB 50+ million in host earnings, 500+ jobs created

**Data Protection:**
- Personal information of Ethiopian citizens and international visitors
- Payment transaction data
- Identity verification documents
- Property location data
- Communication records

Given the sensitive nature of this data and our commitment to protecting Ethiopian citizens, we seek INSA's expert evaluation and certification.

---

## 3. OBJECTIVE OF THIS CERTIFICATE REQUESTED

### Primary Objectives

#### 3.1 Cybersecurity Certification
We seek INSA's official certification confirming that the Alga platform meets all Ethiopian cybersecurity standards and regulations. This certification will:
- Validate our security architecture and implementation
- Confirm compliance with OWASP Top 10 and international best practices
- Demonstrate our commitment to protecting Ethiopian user data
- Enable safe public launch of the platform

#### 3.2 Regulatory Compliance
Obtain verification that our platform complies with:
- **INSA Security Requirements:** Government-mandated security standards for digital platforms
- **Ethiopian Data Protection:** Safeguarding personal information of Ethiopian citizens
- **Financial Transaction Security:** Secure handling of payment data in accordance with National Bank regulations
- **ERCA Tax Compliance:** Proper logging and reporting of all taxable transactions

#### 3.3 User Trust and Confidence
INSA certification will provide:
- **Trust Signal:** Visible security badge on our platform showing government approval
- **User Confidence:** Assurance to Ethiopian users that their data is protected
- **Investor Confidence:** Demonstrated regulatory compliance for funding and partnerships
- **International Recognition:** Credibility for partnerships with international travel platforms

#### 3.4 Platform Security Validation
We request INSA to validate:

**Authentication Security:**
- OTP delivery via Ethiopian Telecom SMS
- Password strength enforcement
- Multi-factor authentication readiness
- Session management and timeout policies
- Biometric authentication (mobile apps)

**Data Protection:**
- Encryption algorithms (AES-256, TLS 1.2+)
- Secure password storage (Bcrypt)
- Database security (Neon PostgreSQL)
- Backup and recovery procedures
- Data residency considerations

**Access Control:**
- Role-Based Access Control (RBAC) with 4 roles
- Resource-level authorization
- Principle of least privilege
- Admin action audit trails

**Payment Security:**
- PCI DSS compliance (via certified processors)
- No storage of raw card data
- Secure tokenization
- Transaction integrity validation
- Commission calculation accuracy

**API Security:**
- Input validation on all endpoints
- SQL injection prevention (Drizzle ORM)
- XSS protection (React auto-escape, xss-clean)
- CSRF protection (SameSite cookies)
- Rate limiting and DDoS mitigation

**Mobile Security:**
- Android APK code signing
- iOS certificate pinning readiness
- Secure local storage
- Network communication encryption

#### 3.5 Continuous Improvement
Through this audit, we aim to:
- Identify any security vulnerabilities before public launch
- Receive expert recommendations for security enhancements
- Establish baseline for ongoing security monitoring
- Demonstrate commitment to continuous security improvement

### Expected Deliverables from INSA

We respectfully request INSA to provide:

1. **Security Audit Report:** Comprehensive evaluation of all security measures
2. **Certification Letter:** Official document confirming compliance (if approved)
3. **Recommendations:** Guidance on any identified vulnerabilities or improvements
4. **Compliance Badge:** Logo/badge for displaying INSA certification on our platform
5. **Re-certification Timeline:** Guidance on periodic re-audits (annual/bi-annual)

### Timeline and Urgency

**Requested Timeline:**
- Audit submission: November 7, 2025
- INSA review period: 2-4 weeks
- Final approval: December 2025

**Business Impact:**
- Platform launch is contingent on INSA certification
- 50+ early-access hosts waiting for platform approval
- Partnership agreements with Ethiopian tourism boards pending certification
- Investor funding milestone tied to security certification

We are committed to addressing all INSA feedback promptly and thoroughly to ensure full compliance before public launch.

---

## 4. CONCLUSION

### Summary

Alga One Member PLC has developed a comprehensive, secure, and culturally authentic property rental platform designed specifically for the Ethiopian market. We have invested significant resources in implementing government-grade security measures, including:

- ✅ **OWASP Top 10 (2021) - 100% Coverage:** All critical web application security risks addressed
- ✅ **ERCA Tax Compliance:** Full compliance with Ethiopian tax laws (TIN: 0101809194)
- ✅ **NIST Cybersecurity Framework:** Core security functions implemented
- ✅ **PCI DSS by Proxy:** Payment security through Level 1 certified processors
- ✅ **SOC 2 Type II Infrastructure:** Certified cloud hosting providers
- ✅ **Comprehensive Documentation:** 9 security documents, 7 architecture diagrams, 5,164+ lines of technical documentation

### Our Commitment

We are fully committed to:

1. **Collaboration with INSA:** Working closely with the Cyber Security Audit Division to address all findings and recommendations
2. **Timely Response:** Providing any additional documentation or information within specified timelines
3. **Remediation:** Promptly fixing any identified vulnerabilities before public launch
4. **Transparency:** Full disclosure of all technical architecture, third-party services, and security measures
5. **Ongoing Compliance:** Maintaining security standards and seeking periodic re-certification

### Impact of Certification

INSA's security certification will:
- **Protect Ethiopian Citizens:** Ensure their personal and financial data is secured to government standards
- **Enable Economic Growth:** Allow safe launch of a platform creating jobs and income opportunities
- **Strengthen Digital Trust:** Demonstrate that Ethiopian tech companies can meet international security standards
- **Set Industry Benchmark:** Establish security best practices for the Ethiopian tech ecosystem

### Readiness for Audit

We have prepared:
- ✅ **Staging Environment:** Fully deployed at https://alga-staging.onrender.com
- ✅ **Test Accounts:** 6 accounts covering all user roles (password: INSA_Test_2025!)
- ✅ **Test Data:** 10 properties, 50 bookings, complete dataset for testing
- ✅ **Mobile Builds:** Android APK and iOS IPA (pending final builds)
- ✅ **Documentation Package:** Complete technical, security, and compliance documentation
- ✅ **INSA Team Access:** Ready to provide read-only access to deployment logs and metrics

### Appreciation

We deeply appreciate INSA's dedication to strengthening Ethiopia's digital security posture. By conducting this thorough audit, INSA not only protects our users but also helps build a safer digital ecosystem for all Ethiopians.

We look forward to working collaboratively with the Cyber Security Audit Division to enhance our platform's security, strengthen compliance, and reduce exposure to cyber threats.

Thank you for your consideration of our audit request.

---

**Submitted by:**  
[Your Name]  
[Your Title]  
Alga One Member PLC  
TIN: 0101809194  

**Date:** November 7, 2025  

**Contact:**  
Email: [your-email@alga.et]  
Phone: [+251 9xx xxx xxx]  

---

**Attachments:**
1. Architecture Diagrams (7 documents)
2. Security Documentation (9 documents)
3. Test Account Credentials
4. Mobile Application Builds (APK/IPA)
5. Deployment Configuration
6. Compliance Certificates (SOC 2, PCI DSS)

---

**Declaration:**

I hereby declare that all information provided in this submission is accurate, complete, and truthful. I understand that providing false or misleading information may result in rejection of this audit request and potential legal consequences.

The Alga platform has been developed in full compliance with Ethiopian laws and regulations, and we are committed to maintaining the highest standards of cybersecurity to protect Ethiopian citizens and visitors.

---

**Signature:** _______________________  
**Name:** [Your Name]  
**Title:** [Your Title]  
**Date:** November 7, 2025  

---

**For INSA Use Only:**

**Received Date:** ______________  
**Assigned Auditor:** ______________  
**Audit Completion Date:** ______________  
**Certification Decision:** ☐ Approved ☐ Conditional ☐ Rejected  
**INSA Signature:** _______________________
