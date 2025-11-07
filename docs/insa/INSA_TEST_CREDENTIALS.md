# INSA Security Audit - Test Account Credentials
**Prepared for:** Information Network Security Administration (INSA)  
**Prepared by:** Alga One Member PLC (TIN: 0101809194)  
**Date:** November 7, 2025  
**Environment:** Staging (alga-staging.onrender.com)

---

## 🔒 Security Notice
**These are test accounts for security audit purposes only**
- All credentials are for a **staging environment with test data**
- No production data or real customer information is exposed
- Accounts will be deactivated after audit completion
- Password complexity meets INSA security requirements

---

## 📋 Universal Test Password
**All test accounts use the same password for convenience:**

```
Password: INSA_Test_2025!
```

**Password meets requirements:**
- ✅ Minimum 12 characters
- ✅ Contains uppercase letters (I, N, S, A, T)
- ✅ Contains lowercase letters (est)
- ✅ Contains numbers (2025)
- ✅ Contains special characters (!_)

---

## 👤 Test User Accounts

### 1. Guest Account (End User)
**Purpose:** Test booking properties, accessing services, using Lemlem AI assistant

| Field | Value |
|-------|-------|
| **Role** | Guest (Customer) |
| **Email** | `insa-guest@test.alga.et` |
| **Password** | `INSA_Test_2025!` |
| **Phone** | `+251911111001` |
| **ID Number** | `TEST-ID-001` |
| **Status** | Active, Verified |

**Permissions:**
- ✅ Browse properties
- ✅ Make bookings
- ✅ Write reviews
- ✅ Book add-on services
- ✅ Chat with Lemlem AI
- ✅ Access booking history
- ❌ Cannot manage properties
- ❌ Cannot verify other users

**Test Data:**
- 3 confirmed bookings
- 1 review posted
- 2 service bookings
- Lemlem chat history

---

### 2. Host Account (Property Owner)
**Purpose:** Test property management, booking management, host dashboard

| Field | Value |
|-------|-------|
| **Role** | Host (Property Owner) |
| **Email** | `insa-host@test.alga.et` |
| **Password** | `INSA_Test_2025!` |
| **Phone** | `+251911111002` |
| **ID Number** | `TEST-ID-002` |
| **Status** | Active, Verified |

**Permissions:**
- ✅ Create/edit/delete properties
- ✅ View booking requests
- ✅ Manage property information for Lemlem
- ✅ Set pricing and availability
- ✅ View earnings dashboard
- ✅ Respond to reviews
- ❌ Cannot verify other hosts
- ❌ Cannot access admin panel

**Test Data:**
- 5 approved properties across Ethiopia
  - Addis Ababa (Traditional Tukul)
  - Bahir Dar (Lakeside Villa)
  - Lalibela (Historic Guesthouse)
  - Simien Mountains (Eco-Lodge)
  - Hawassa (Modern Apartment)
- 3 bookings received
- Total earnings: ETB 18,389

---

### 3. Admin Account (Platform Administrator)
**Purpose:** Test administrative functions, user management, security controls

| Field | Value |
|-------|-------|
| **Role** | Admin (Super User) |
| **Email** | `insa-admin@test.alga.et` |
| **Password** | `INSA_Test_2025!` |
| **Phone** | `+251911111003` |
| **ID Number** | `TEST-ID-003` |
| **Status** | Active, Verified |

**Permissions:**
- ✅ Full user management (create, suspend, delete)
- ✅ Approve/reject properties
- ✅ Verify service providers
- ✅ Approve Delala agents
- ✅ View all bookings and transactions
- ✅ Access financial reports
- ✅ Manage platform settings
- ✅ View audit logs

**Test Data:**
- Approved 5 properties
- Verified 1 Delala agent
- Verified 1 service provider
- Access to all platform data

---

### 4. Operator Account (Verification Specialist)
**Purpose:** Test ID verification workflow, property verification, content moderation

| Field | Value |
|-------|-------|
| **Role** | Operator (Verification Specialist) |
| **Email** | `insa-operator@test.alga.et` |
| **Password** | `INSA_Test_2025!` |
| **Phone** | `+251911111004` |
| **ID Number** | `TEST-ID-004` |
| **Status** | Active, Verified |

**Permissions:**
- ✅ Review and verify user IDs
- ✅ Review and approve properties
- ✅ Access verification queue
- ✅ OCR document scanning
- ✅ QR code verification
- ❌ Cannot delete users
- ❌ Cannot access financial data
- ❌ Cannot modify platform settings

**Test Data:**
- Verified 6 user IDs
- Approved 5 properties
- Pending verification queue: 0

---

### 5. Delala Agent Account (Commission Agent)
**Purpose:** Test Delala agent commission system, property linking, TeleBirr payouts

| Field | Value |
|-------|-------|
| **Role** | Guest (with Agent status) |
| **Email** | `insa-agent@test.alga.et` |
| **Password** | `INSA_Test_2025!` |
| **Phone** | `+251911111005` |
| **TeleBirr Account** | `+251911111005` |
| **ID Number** | `TEST-ID-005` |
| **Agent Status** | Approved |
| **Commission Rate** | 5% |

**Permissions:**
- ✅ Register as Delala agent
- ✅ Link properties to agent account
- ✅ View commission dashboard
- ✅ Track earnings per property
- ✅ Request TeleBirr payouts
- ❌ Cannot verify properties
- ❌ Cannot access other agents' data

**Test Data:**
- Linked to 2 properties
- Earned 1 commission: ETB 300 (paid via TeleBirr)
- Commission validity: 36 months from first booking
- Total earnings: ETB 300

---

### 6. Service Provider Account (Add-On Services)
**Purpose:** Test service provider marketplace, booking management, reviews

| Field | Value |
|-------|-------|
| **Role** | Guest (Service Provider) |
| **Email** | `insa-service@test.alga.et` |
| **Password** | `INSA_Test_2025!` |
| **Phone** | `+251911111006` |
| **ID Number** | `TEST-ID-006` |
| **Service Type** | Cleaning Services |
| **Business Name** | INSA Test Cleaning Services |
| **Status** | Approved |

**Permissions:**
- ✅ Register as service provider
- ✅ Manage service offerings
- ✅ Accept/reject service bookings
- ✅ View earnings (85% of service fee)
- ✅ Update availability
- ❌ Cannot access property data
- ❌ Cannot verify other providers

**Test Data:**
- 1 cleaning service listing
- 1 confirmed booking
- Rating: 4.8/5 (15 completed jobs)
- Commission split: 15% Alga, 85% Provider

---

## 🔐 API Access (for Security Testing)

### Test API Endpoints
**Base URL:** `https://alga-staging.onrender.com/api`

**Authentication:**
All test accounts can obtain session cookies by:
1. POST `/api/auth/login` with email/password
2. Receive session cookie in response
3. Include cookie in subsequent requests

**Sample API Call:**
```bash
curl -X POST https://alga-staging.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "insa-guest@test.alga.et",
    "password": "INSA_Test_2025!"
  }'
```

---

## 📊 Test Database Access

**Database Access:** Read-Only via Render Dashboard  
**Invite INSA Auditors:**
1. Dashboard → Team Settings
2. Add auditor emails
3. Assign "Viewer" role

**Database Schema:**
- 27 tables covering all platform features
- Test data seeded via `server/seed-insa-test-data.ts`
- All sensitive fields encrypted (passwords, payment data)

---

## 🏗️ Platform Access Points

### Web Application
**URL:** `https://alga-staging.onrender.com`
- Responsive web interface
- Works on desktop and mobile browsers

### Progressive Web App (PWA)
**Install:** Visit URL in Chrome/Edge → Install App
- Offline capabilities
- Push notifications
- Native app-like experience

### Mobile Applications (Via Capacitor)
**Android APK:** Available upon request  
**iOS IPA:** Available upon request (requires TestFlight)

---

## 📱 Additional Test Resources

### Lemlem AI Assistant
Access via any logged-in account:
- Click chat icon (bottom-right)
- Ask questions in English or Amharic
- Test template responses (0 AI cost)
- Test AI fallback (costs tracked)

### Payment Testing
**Test Payment Credentials:**
- Chapa: Sandbox mode enabled
- Stripe: Test card `4242 4242 4242 4242`
- TeleBirr: Sandbox mode
- No real money will be charged

### Security Features to Test
1. **OTP Authentication:** Phone/email OTP login
2. **Session Management:** 24-hour timeout
3. **Rate Limiting:** 100 requests/15 minutes per IP
4. **CSRF Protection:** Token validation
5. **XSS Prevention:** Input sanitization
6. **SQL Injection Protection:** Parameterized queries (Drizzle ORM)
7. **Access Control:** Role-based permissions
8. **Encryption:** Bcrypt passwords, HTTPS only

---

## 🛠️ Audit Support

**For Technical Questions:**
- Platform architecture: See `docs/diagrams/`
- API documentation: See `docs/insa/API_DOCUMENTATION.md`
- Security measures: See `docs/insa/SECURITY_FUNCTIONALITY.md`

**Need More Access?**
Contact: [Your contact email]
Phone: [Your contact phone]

---

## ⚠️ Important Notes

1. **Data Retention:** Test data will be **retained for 90 days** after audit
2. **Account Deactivation:** All INSA test accounts will be **deactivated** after audit approval
3. **No Production Data:** This environment contains **zero** real customer data
4. **Audit Logs:** All INSA auditor actions are **logged** in Render audit trail
5. **Data Export:** CSV exports available via Render Dashboard (requires Team Member access)

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Valid Until:** Audit Completion Date
