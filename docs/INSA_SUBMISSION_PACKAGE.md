# INSA Submission Package

**Platform:** Alga (አልጋ) - Ethiopian Property Booking Platform  
**Submission Date:** [To be filled when submitting]  
**Company:** Alga Technologies  
**Security Officer:** [To be assigned]

---

## 📋 Document Checklist

Use this checklist when submitting to INSA for security audit or compliance verification:

### Required Documents

- [ ] **1. Rules of Engagement (RoE)** - Signed copy (see template below)
- [ ] **2. INSA Security Compliance Report** - `docs/INSA_SECURITY_COMPLIANCE.md`
- [ ] **3. Latest Security Audit** - From `builds/security-reports/`
- [ ] **4. Network Architecture Diagram** - See Section 3 below
- [ ] **5. Data Flow Diagram** - See Section 4 below
- [ ] **6. Privacy Policy** - Live at `/privacy-policy` on website
- [ ] **7. Terms of Service** - Live at `/terms-of-service` on website
- [ ] **8. Incident Response Plan** - See Section 5 below
- [ ] **9. Proof of Insurance** - Cyber liability insurance (if required)
- [ ] **10. Contact Information** - Emergency security contacts

### Supporting Documents

- [ ] **11. npm audit report** - Latest from `builds/security-reports/`
- [ ] **12. Database schema** - Export from `shared/schema.ts`
- [ ] **13. API documentation** - Route list from `server/routes.ts`
- [ ] **14. Third-party processor agreements** - Chapa, Stripe, PayPal
- [ ] **15. Data retention policy** - See Section 6 below

---

## 1. Rules of Engagement (RoE) Template

**SECURITY TESTING AUTHORIZATION**

I, [Name], [Title] of Alga Technologies, hereby authorize the Ethiopian Information Network Security Agency (INSA) to conduct security testing of the Alga platform under the following terms:

### Scope of Testing

**In-Scope Systems:**
- Production website: `https://[your-domain].replit.app`
- API endpoints: `https://[your-domain].replit.app/api/*`
- Mobile application: Alga Android/iOS app (if deployed)

**Testing Methods Authorized:**
- [ ] Network scanning (Nmap, Nessus)
- [ ] Web application testing (Burp Suite, OWASP ZAP)
- [ ] Vulnerability scanning
- [ ] Penetration testing (with notice)
- [ ] Social engineering (email only, no phone)

**Out-of-Scope:**
- Payment processor systems (Chapa, Stripe, PayPal - managed externally)
- Replit infrastructure (hosting platform)
- Third-party email services (SendGrid)
- End-user devices

### Testing Window

**Authorized Period:**
- Start Date: [DD/MM/YYYY]
- End Date: [DD/MM/YYYY]
- Preferred Hours: 9:00 AM - 5:00 PM EAT (to minimize user impact)

**Blackout Periods:**
- Saturdays and Sundays (high booking traffic)
- Ethiopian holidays
- Peak hours: 6:00 PM - 10:00 PM daily

### Conditions

1. **Notice Requirement:** Provide 48-hour notice before penetration testing
2. **Coordination:** Security contact must be available during all tests
3. **Rate Limiting:** Respect rate limits to avoid service disruption
4. **Data Handling:** Do not modify, delete, or exfiltrate real user data
5. **Reporting:** Provide detailed report within 14 days of test completion

### Emergency Contacts

**Primary Security Contact:**
- Name: [Security Officer Name]
- Email: security@alga.app
- Phone: [Emergency Phone]
- Available: 24/7 for critical issues

**Technical Contact:**
- Name: [Developer Name]
- Email: dev@alga.app
- Phone: [Developer Phone]
- Available: Monday-Friday, 9:00 AM - 6:00 PM EAT

### Legal Acknowledgment

By signing this document, INSA agrees to:
1. Limit testing to authorized scope only
2. Report all findings confidentially
3. Provide reasonable notice for disruptive tests
4. Comply with Ethiopian cybersecurity laws
5. Maintain confidentiality of business operations

---

**Authorized by:**

Signature: ___________________________  
Name: [Authorized Officer]  
Title: [Title]  
Date: [DD/MM/YYYY]

**Accepted by INSA:**

Signature: ___________________________  
Name: [INSA Officer]  
Title: [Title]  
Date: [DD/MM/YYYY]

---

## 2. Pre-Submission Compliance Checklist

Verify these items before submitting to INSA:

### Security Hardening
- [x] Helmet security headers active
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] XSS protection (multi-layer)
- [x] SQL injection prevention
- [x] NoSQL injection sanitization
- [x] HPP protection
- [x] CSRF tokens
- [x] HSTS enforced (production)
- [x] Error message sanitization

### Authentication & Sessions
- [x] Password hashing (Bcrypt)
- [x] Session security (PostgreSQL)
- [x] OTP authentication
- [x] Rate-limited login attempts
- [x] Secure cookies (HttpOnly, Secure, SameSite)

### Data Protection
- [x] TLS/HTTPS enforced
- [x] No sensitive data in logs
- [x] Encrypted file storage
- [x] Database credentials in environment variables
- [x] Payment data never stored (tokenized)

### Compliance
- [x] Privacy policy published
- [x] Terms of service published
- [x] User consent mechanisms
- [x] Data deletion workflow
- [x] GDPR-style data export (if applicable)

### Monitoring & Logging
- [x] Security event logging
- [x] Failed login tracking
- [x] Audit trail for sensitive operations
- [x] Intrusion detection alerts

---

## 3. Network Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS (TLS 1.2+)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   REPLIT PROXY                              │
│  • TLS Termination                                          │
│  • DDoS Protection                                          │
│  • Load Balancing                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Port 5000 (Internal)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   ALGA APPLICATION                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Express.js Server (Node.js 20)                      │   │
│  │  • Helmet Security Headers                          │   │
│  │  • CORS Protection                                  │   │
│  │  • INSA Hardening Middleware                        │   │
│  │  • Rate Limiting                                    │   │
│  │  • Session Management                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│     ┌─────────────────────┼─────────────────────┐          │
│     │                     │                     │          │
│     ▼                     ▼                     ▼          │
│  ┌────────┐      ┌─────────────┐      ┌──────────────┐    │
│  │ Vite   │      │   API       │      │   WebSocket  │    │
│  │ Frontend│     │   Routes    │      │   (Lemlem)   │    │
│  │ Server │      │   /api/*    │      │   /ws        │    │
│  └────────┘      └─────────────┘      └──────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌─────────────┐ ┌──────────┐ ┌────────────────┐
│  PostgreSQL │ │  Object  │ │   External     │
│  (Neon)     │ │  Storage │ │   Services     │
│             │ │ (Replit) │ │ • Chapa        │
│ • Users     │ │          │ │ • Stripe       │
│ • Properties│ │ • Images │ │ • PayPal       │
│ • Bookings  │ │ • IDs    │ │ • SendGrid     │
│ • Sessions  │ │ • Docs   │ │ • Google Maps  │
└─────────────┘ └──────────┘ └────────────────┘

FIREWALL RULES:
• Port 5000: OPEN (HTTPS only via Replit proxy)
• All other ports: BLOCKED by Replit infrastructure
```

---

## 4. Data Flow Diagram

### User Authentication Flow
```
User → Frontend → /api/auth/request-otp
                      ↓
                 Generate OTP (4 digits)
                      ↓
                 Hash with Bcrypt
                      ↓
                 Store in PostgreSQL
                      ↓
                 Send via SendGrid/SMS
                      ↓
User receives OTP → /api/auth/verify-otp
                      ↓
                 Verify hash match
                      ↓
                 Create session (PostgreSQL)
                      ↓
                 Set secure cookie
                      ↓
                 Return user data
```

### Payment Flow (Alga Pay)
```
User → Select property → Create booking
                            ↓
                      Calculate total
                      (Property + Services + Tax)
                            ↓
                      Create payment intent
                            ↓
              ┌─────────────┴──────────────┐
              ▼                            ▼
        Chapa (ETB)                  Stripe (USD)
              │                            │
              └─────────────┬──────────────┘
                            ▼
                      Webhook callback
                            ↓
                      Verify signature
                            ↓
                      Update booking status
                            ↓
                      Send confirmation email
                            ↓
                      Generate invoice (PDF)
```

### ID Verification Flow
```
User uploads ID → Frontend (Camera/Upload)
                      ↓
                 Compress image
                      ↓
                 Upload to Object Storage
                      ↓
                 OCR processing (Tesseract.js)
                      ↓
                 Extract data
                      ↓
                 Flag for operator review
                      ↓
                 Operator dashboard
                      ↓
                 Approve/Reject
                      ↓
                 Update user status
                      ↓
                 Send notification
```

---

## 5. Incident Response Plan

### Severity Levels

**Level 1: CRITICAL**
- Active data breach
- Payment system compromise
- Complete service outage
- **Response Time:** Immediate (within 1 hour)

**Level 2: HIGH**
- Unauthorized access attempt successful
- Database exposure
- Authentication bypass
- **Response Time:** 4 hours

**Level 3: MEDIUM**
- Failed intrusion attempts
- DDoS attack
- Individual account compromise
- **Response Time:** 24 hours

**Level 4: LOW**
- Security scan detected
- Minor vulnerability
- Configuration issue
- **Response Time:** 7 days

### Response Procedure

**Step 1: Detection & Triage (0-15 minutes)**
1. Security alert triggered (logs, monitoring, user report)
2. Security officer reviews alert
3. Determine severity level
4. Activate incident response team

**Step 2: Containment (15-60 minutes)**
1. Isolate affected systems (if possible without full outage)
2. Block malicious IPs (via Replit support)
3. Revoke compromised credentials
4. Enable emergency rate limiting

**Step 3: Investigation (1-4 hours)**
1. Analyze logs (`/tmp/logs/`, security audit logs)
2. Identify attack vector
3. Assess data exposure
4. Document findings

**Step 4: Eradication (4-24 hours)**
1. Remove malicious code/access
2. Patch vulnerabilities
3. Reset affected user passwords
4. Update security rules

**Step 5: Recovery (24-72 hours)**
1. Restore services incrementally
2. Monitor for re-infection
3. Validate all systems operational
4. Resume normal operations

**Step 6: Post-Incident (Within 7 days)**
1. Write incident report
2. Update security measures
3. Notify affected users (if required)
4. Report to INSA (if required)
5. Implement lessons learned

### Communication Plan

**Internal:**
- Security Officer → CTO → CEO
- Developer team notified via Slack/Email
- Status updates every 2 hours during active incident

**External:**
- Users: Email notification (only if data affected)
- INSA: Report within 72 hours of detection
- Law Enforcement: If criminal activity suspected
- Media: Via PR team only (no individual statements)

---

## 6. Data Retention Policy

### User Data
- **Active users:** Retained indefinitely
- **Inactive users (no login 2+ years):** Anonymize PII after 2 years
- **Deleted accounts:** Hard delete after 30-day grace period

### Transaction Data
- **Bookings:** Retained 7 years (Ethiopian tax law)
- **Payments:** Retained 7 years (ERCA compliance)
- **Invoices:** Retained 7 years (legal requirement)

### Security Logs
- **Authentication logs:** 1 year
- **Security incident logs:** 3 years
- **Audit trails:** 5 years
- **npm audit reports:** 12 weeks (rolling)

### Images & Files
- **Property photos:** Retained while property active
- **ID documents:** 5 years after last booking
- **User uploads:** Deleted with account deletion

---

## 7. Submission Instructions

### How to Submit to INSA

**Option 1: Physical Submission**
1. Print all required documents
2. Sign Rules of Engagement (original signature)
3. Bind in folder with cover letter
4. Submit to INSA office:
   ```
   Information Network Security Agency (INSA)
   [Address - To be confirmed]
   Addis Ababa, Ethiopia
   ```

**Option 2: Email Submission**
1. Compile all documents into single PDF
2. Digitally sign RoE (if accepted)
3. Send to: [INSA email - to be confirmed]
4. CC: security@alga.app
5. Subject: "INSA Security Audit Submission - Alga Platform"

**Option 3: Online Portal** (if available)
1. Visit INSA portal: [URL - to be confirmed]
2. Create account/login
3. Upload all required documents
4. Pay submission fee (if applicable)
5. Track application status

### Follow-Up Timeline

| Day | Action |
|-----|--------|
| Day 0 | Submit package to INSA |
| Day 3 | Confirm receipt (email/phone) |
| Day 7 | Follow up if no acknowledgment |
| Day 14 | Request preliminary feedback |
| Day 30 | Full audit complete (estimated) |
| Day 45 | Receive official report |
| Day 60 | Address findings (if any) |
| Day 90 | Re-submit for clearance (if needed) |

---

## ✅ Pre-Flight Checklist

Before submitting to INSA, verify:

- [ ] All security protections are ACTIVE (check server logs)
- [ ] Latest npm audit shows 0 critical/high vulnerabilities
- [ ] Weekly security audit script tested and working
- [ ] Intrusion detection logging is active
- [ ] All documents signed and dated
- [ ] Emergency contacts are correct and tested
- [ ] Backup of all data completed
- [ ] Team briefed on potential INSA testing
- [ ] Rate limits configured to handle scanning traffic
- [ ] Monitoring dashboard accessible for real-time review

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Next Review:** Before each INSA submission
