# System Architecture Diagram (Part 3/3)
## Security Layers - Defense in Depth Architecture

```mermaid
flowchart LR
    %% Layer 0: Internet
    subgraph L0["🌐 L0: INTERNET"]
        direction TB
        Threats["⚠️ THREATS<br/>DDoS/Bots<br/>Malicious"]
        Users["👥 USERS<br/>Web/Mobile"]
    end
    
    %% Layer 1: Edge Security
    subgraph L1["🛡️ L1: EDGE"]
        direction TB
        Edge["DNS/WAF<br/>━━━━━━━<br/>• DNSSEC<br/>• DDoS Block<br/>• OWASP Rules<br/>• TLS 1.2+<br/>• HSTS"]
    end
    
    %% Layer 2: Network Security
    subgraph L2["🔒 L2: NETWORK"]
        direction TB
        Network["Firewall<br/>━━━━━━━<br/>• Load Balance<br/>• HTTPS Only<br/>• IP Filtering<br/>• TLS Inspect"]
    end
    
    %% Layer 3: Application Security
    subgraph L3["🔐 L3: APP"]
        direction TB
        Middleware["MIDDLEWARE<br/>━━━━━━━<br/>• Helmet CSP<br/>• CORS Control<br/>• Rate Limit<br/>• XSS/SQL Block<br/>• HPP Protect"]
        Auth["AUTH<br/>━━━━━━━<br/>• OTP Bcrypt<br/>• Session 24hr<br/>• httpOnly<br/>• SameSite"]
        Validate["VALIDATION<br/>━━━━━━━<br/>• Zod Schema<br/>• Type Check<br/>• Sanitize IO"]
    end
    
    %% Layer 4: Data Security
    subgraph L4["💾 L4: DATA"]
        direction TB
        Access["ACCESS<br/>━━━━━━━<br/>• RBAC 5 Roles<br/>• Row-Level<br/>• Drizzle ORM<br/>• Zero Raw SQL"]
        Encrypt["ENCRYPTION<br/>━━━━━━━<br/>• TLS 1.2+<br/>• AES-256 Rest<br/>• Bcrypt Pass<br/>• 27 Fields 🔒"]
    end
    
    %% Layer 5: Monitoring
    subgraph L5["📊 L5: MONITOR"]
        direction TB
        Logs["AUDIT LOGS<br/>━━━━━━━<br/>• Activity Track<br/>• Security Event<br/>• 90-Day Keep<br/>• INSA/ERCA"]
    end
    
    %% Layer 6: Incident Response
    subgraph L6["🚨 L6: RESPONSE"]
        direction TB
        Incident["INCIDENT<br/>━━━━━━━<br/>• Auto Alert<br/>• IP Block<br/>• Account Lock<br/>• DB Restore"]
    end
    
    %% External Security
    subgraph External["🔗 EXTERNAL"]
        direction TB
        ExtSec["APIs<br/>━━━━━━━<br/>• Fayda eKYC<br/>• PCI DSS<br/>• Key Rotation"]
    end
    
    %% Horizontal Flow
    L0 -->|Traffic| L1
    L1 -->|TLS| L2
    L2 -->|Filter| L3
    L3 --> Middleware
    Middleware --> Auth
    Auth --> Validate
    Validate --> L4
    L4 --> Access
    Access --> Encrypt
    
    L3 & L4 -.->|Events| L5
    L5 -.->|Alert| L6
    L3 & L4 -->|Secure| External
    
    %% Styling - Compact for A4
    classDef l0Class fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef l1Class fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#000
    classDef l2Class fill:#f3e5f5,stroke:#6a1b9a,stroke-width:3px,color:#000
    classDef l3Class fill:#fff3e0,stroke:#e65100,stroke-width:3px,color:#000
    classDef l4Class fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#000
    classDef l5Class fill:#e0f2f1,stroke:#00695c,stroke-width:3px,color:#000
    classDef l6Class fill:#fce4ec,stroke:#ad1457,stroke-width:3px,color:#000
    classDef extClass fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#000
    
    class Threats,Users l0Class
    class Edge l1Class
    class Network l2Class
    class Middleware,Auth,Validate l3Class
    class Access,Encrypt l4Class
    class Logs l5Class
    class Incident l6Class
    class ExtSec extClass
```

## Security Control Details

### **LAYER 1: Edge Security (DMZ)**

**Purpose:** First line of defense against internet threats

**Technologies:**
- **TLS/SSL:** TLS 1.2+ mandatory, TLS 1.0/1.1 disabled
- **HSTS:** HTTP Strict Transport Security (max-age: 31536000)
- **WAF Rules:** OWASP ModSecurity Core Rule Set
- **DDoS Mitigation:** L3/L4/L7 protection, rate limiting at edge

**Configuration:**
```nginx
# HTTPS only (no HTTP)
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

### **LAYER 2: Network Security**

**Firewall Rules:**
```
INGRESS:
  Allow: TCP 443 (HTTPS) from 0.0.0.0/0
  Allow: TCP 22 (SSH) from admin IPs only
  Block: All other inbound traffic

EGRESS:
  Allow: TCP 443 to Payment APIs (Chapa, Stripe, PayPal)
  Allow: TCP 5432 to Neon DB (AWS US-East)
  Allow: TCP 443 to Google Cloud Storage
  Allow: TCP 443 to SendGrid, Ethiopian Telecom
  Block: All other outbound traffic
```

**VPN/Bastion (Future Enhancement):**
- Admin access via VPN (not yet implemented)
- Database access via SSH tunnel (optional)

---

### **LAYER 3: Application Security**

**OWASP Top 10 2021 Coverage:**

| Vulnerability | Protection Mechanism | Implementation |
|---------------|---------------------|----------------|
| A01: Broken Access Control | RBAC + Server-side checks | 5 roles, granular permissions |
| A02: Cryptographic Failures | TLS + Bcrypt + AES-256 | All data encrypted |
| A03: Injection | Drizzle ORM (100%) | Zero raw SQL queries |
| A04: Insecure Design | Threat modeling + INSA hardening | Security-by-design |
| A05: Security Misconfiguration | Helmet.js + INSA hardening | 14 security controls active |
| A06: Vulnerable Components | npm audit (weekly) | All packages up-to-date |
| A07: Authentication Failures | Bcrypt + Rate limiting + OTP | Multi-factor security |
| A08: Software/Data Integrity | Audit logs + Validation | Integrity checks |
| A09: Logging Failures | PostgreSQL logs | 90-day retention |
| A10: SSRF | No user-controlled URLs | Controlled external calls |

**Active Security Middleware (14 controls):**
1. ✅ Helmet.js (13 security headers)
2. ✅ CORS (origin validation)
3. ✅ Rate Limiting (100 req/15min)
4. ✅ XSS Clean (input sanitization)
5. ✅ INSA Hardening (XSS, SQL, CSRF, Path Traversal)
6. ✅ HPP Protection (parameter pollution)
7. ✅ Express Mongo Sanitize (NoSQL injection)
8. ✅ Session Security (httpOnly, secure, sameSite)
9. ✅ Bcrypt (password hashing, 10 rounds)
10. ✅ Zod Validation (type-safe schemas)
11. ✅ Express Validator (server-side validation)
12. ✅ File Upload Limits (5MB, type validation)
13. ✅ Error Sanitization (no stack traces in prod)
14. ✅ Content Security Policy (CSP headers)

---

### **LAYER 4: Data Security**

**Encryption Standards:**
- **In-Transit:** TLS 1.2+ (AES-256-GCM cipher)
- **At-Rest:** AES-256 (Neon database encryption)
- **Password Hashing:** Bcrypt (cost factor: 10)
- **Session Tokens:** SHA-256 hashed

**Data Classification:**

| Classification | Examples | Protection |
|----------------|----------|------------|
| **Critical** | Passwords, Payment info, IDs | Bcrypt/AES-256, encrypted storage |
| **Sensitive** | Phone, Email, TeleBirr account | TLS in-transit, encrypted at-rest |
| **Confidential** | Bookings, Reviews, Commission | Access control, audit logs |
| **Public** | Property listings (active) | No encryption (public data) |

**RBAC Permission Matrix:**

| Action | Guest | Host | Agent | Operator | Admin |
|--------|-------|------|-------|----------|-------|
| View public properties | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book property | ✅ | ❌ | ❌ | ❌ | ✅ |
| List property | ❌ | ✅ | ❌ | ❌ | ✅ |
| Link property (agent) | ❌ | ❌ | ✅ | ❌ | ✅ |
| Verify IDs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Access all data | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### **LAYER 5: Monitoring & Audit**

**Logged Events (user_activity_log table):**
- ✅ Login attempts (success & failure)
- ✅ Password changes
- ✅ Role changes (admin actions)
- ✅ Property creation/modification
- ✅ Booking creation/cancellation
- ✅ Payment transactions
- ✅ Commission calculations
- ✅ Agent verifications
- ✅ ID verification attempts
- ✅ Failed authorization attempts
- ✅ Rate limit violations
- ✅ Suspicious activity patterns

**Log Format:**
```json
{
  "timestamp": "2025-11-06T10:30:45Z",
  "userId": 123,
  "action": "login_attempt",
  "result": "success",
  "ipAddress": "196.188.xxx.xxx",
  "userAgent": "Mozilla/5.0...",
  "metadata": { "method": "otp" }
}
```

**Retention Policy:**
- Security logs: 90 days
- Audit logs: 1 year
- Payment logs: 7 years (ERCA requirement)

---

### **LAYER 6: Incident Response**

**Automated Responses:**
- **Brute Force Detection:** Lock account after 5 failed attempts (15-min lockout)
- **Rate Limit Violation:** Temporary IP block (1 hour)
- **Suspicious Pattern:** Admin alert + session termination
- **Payment Fraud:** Transaction hold + operator review

**Manual Response Procedures:**
1. **Detection:** Alert triggered in monitoring system
2. **Triage:** Admin reviews security logs
3. **Containment:** Block IP, suspend account, invalidate sessions
4. **Investigation:** Analyze logs, identify attack vector
5. **Remediation:** Patch vulnerability, update firewall rules
6. **Recovery:** Restore service, notify affected users
7. **Post-Incident:** Document lessons learned, update procedures

---

### **Ethiopian Regulatory Compliance:**

**INSA Requirements:**
- ✅ Government-grade security hardening
- ✅ 90-day security log retention
- ✅ Audit trail for all sensitive operations
- ✅ Encryption at-rest and in-transit
- ✅ Role-based access control
- ✅ Incident response procedures

**ERCA (Tax Authority):**
- ✅ 7-year payment record retention
- ✅ Tamper-proof transaction logs
- ✅ PDF invoice generation (jsPDF)

**Fayda ID Integration:**
- ✅ Secure government API communication
- ✅ Encrypted ID data storage
- ✅ Operator review workflow

---

**Document:** Security Layers  
**Created:** November 6, 2025  
**Standard:** INSA Security Architecture Requirements  
**Compliance:** OWASP Top 10, INSA Guidelines, ERCA Regulations  
**Export:** Use mermaid.live to export to PNG/PDF
