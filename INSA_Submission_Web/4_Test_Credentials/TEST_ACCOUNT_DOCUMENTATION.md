# INSA Test Account Documentation
## Alga Property Rental Platform

**Company:** ALGA ONE MEMBER PLC  
**TIN:** 0101809194  
**Test Environment:** Production (Replit)  
**Created:** November 6, 2025

---

## Test Account Credentials

### 📊 **Quick Reference Table**

| Role | Email | Password | Phone Number | Access Level | Status |
|------|-------|----------|--------------|--------------|--------|
| **Guest** | guest@alga.et | `Guest@2025` | +251911000001 | Public browsing, booking | ✅ Active |
| **Host** | host@alga.et | `Host@2025` | +251911000002 | Property management | ✅ Active |
| **Agent (Delala)** | agent@alga.et | `Dellala#2025` | +251911000003 | Commission tracking | ✅ Active |
| **Operator** | operator@alga.et | `Operator#2025` | +251911000004 | ID verification | ✅ Active |
| **Admin** | admin@alga.et | `AlgaAdmin#2025` | +251911000005 | Full system control | ✅ Active |

---

## Detailed Account Information

### 1️⃣ **GUEST ACCOUNT** 🏠

**Purpose:** Standard user for browsing and booking properties

**Credentials:**
- **Email:** `guest@alga.et`
- **Password:** `Guest@2025`
- **Phone:** `+251911000001`
- **Role:** `guest`

**Capabilities:**
- ✅ Browse properties
- ✅ Search and filter listings
- ✅ Create bookings
- ✅ Submit reviews
- ✅ Save favorites
- ✅ View booking history
- ✅ Request add-on services
- ✅ Chat with Lemlem AI assistant
- ❌ Cannot manage properties
- ❌ Cannot access admin features

**Verification Status:**
- Phone Verified: ✅ Yes
- ID Verified: ❌ No (standard guest)

**Test Scenarios:**
1. Login to public portal
2. Search for properties in Addis Ababa
3. Create a booking for 3 nights
4. Leave a review for a property
5. Request airport pickup service

---

### 2️⃣ **HOST ACCOUNT** 🏡

**Purpose:** Property owner/manager account

**Credentials:**
- **Email:** `host@alga.et`
- **Password:** `Host@2025`
- **Phone:** `+251911000002`
- **Role:** `host`

**Capabilities:**
- ✅ All guest capabilities
- ✅ Create and manage property listings
- ✅ Upload property images
- ✅ Set pricing and availability
- ✅ Manage bookings
- ✅ View earnings dashboard
- ✅ Configure property access codes
- ✅ Manage Lemlem AI responses for properties
- ✅ View analytics (occupancy, revenue)
- ❌ Cannot verify other users' IDs
- ❌ Cannot access platform administration

**Verification Status:**
- Phone Verified: ✅ Yes
- ID Verified: ✅ Yes (required for hosts)

**Test Scenarios:**
1. Login to host dashboard
2. Create a new property listing
3. Upload 5+ property images
4. Set dynamic pricing (weekday/weekend)
5. Generate 6-digit access code
6. View earnings and commission breakdown
7. Configure Lemlem AI property information

---

### 3️⃣ **AGENT (DELALA) ACCOUNT** 💼

**Purpose:** Property referral agent (commission-based)

**Credentials:**
- **Email:** `agent@alga.et`
- **Password:** `Dellala#2025`
- **Phone:** `+251911000003`
- **TeleBirr Account:** `+251911000003`
- **Role:** `agent`

**Capabilities:**
- ✅ All guest capabilities
- ✅ Register as agent (already done)
- ✅ Link properties to earn 5% commission
- ✅ View commission dashboard
- ✅ Track earnings (36-month period)
- ✅ Request commission payouts via TeleBirr
- ✅ View property referral statistics
- ❌ Cannot manage other users' properties
- ❌ Cannot verify users or properties

**Agent Profile:**
- **Agent ID:** 2
- **Full Name:** INSA Delala
- **City:** Addis Ababa
- **Status:** Approved
- **Commission Rate:** 5% of booking amount
- **Commission Duration:** 36 months from first booking

**Verification Status:**
- Phone Verified: ✅ Yes
- ID Verified: ✅ Yes (required for agents)
- Agent Status: ✅ Approved

**Test Scenarios:**
1. Login to agent dashboard
2. Link a property using property ID
3. View commission calculations
4. Track 36-month commission timeline
5. Request TeleBirr payout
6. View total earnings and active properties

**Commission System Details:**
- **How It Works:** Agents earn 5% from EVERY booking for 36 months
- **Payment Source:** Platform's 12% service fee (NOT from host)
- **Host Payment:** Hosts receive 100% of booking amount via Alga Pay
- **Agent Payment:** Separate TeleBirr transfer from platform revenue
- **Trade License:** AACATB/14/665/43714893/2018 (Commission/Brokers)

---

### 4️⃣ **OPERATOR ACCOUNT** 🔍

**Purpose:** Backend staff for ID verification and document review

**Credentials:**
- **Email:** `operator@alga.et`
- **Password:** `Operator#2025`
- **Phone:** `+251911000004`
- **Role:** `operator`

**Capabilities:**
- ✅ Access ID verification dashboard
- ✅ Review uploaded ID documents
- ✅ Approve/reject user verifications
- ✅ Review property verification documents
- ✅ Process Fayda ID integrations (eKYC)
- ✅ OCR foreign passports (Tesseract.js)
- ✅ QR code scanning (Ethiopian IDs)
- ✅ View verification queue
- ✅ Add rejection reasons/notes
- ❌ Cannot manage user roles
- ❌ Cannot access financial transactions

**Verification Status:**
- Phone Verified: ✅ Yes
- ID Verified: ✅ Yes (required for operators)

**Test Scenarios:**
1. Login to operator dashboard
2. Review pending ID verifications
3. Approve a guest's ID document
4. Reject a document with reason
5. Process Fayda ID verification
6. Review property ownership documents
7. Scan QR code from Ethiopian ID

---

### 5️⃣ **ADMIN ACCOUNT** 👑

**Purpose:** Full platform administrator

**Credentials:**
- **Email:** `admin@alga.et`
- **Password:** `AlgaAdmin#2025`
- **Phone:** `+251911000005`
- **Role:** `admin`

**Capabilities:**
- ✅ **ALL system capabilities**
- ✅ User management (create, suspend, delete)
- ✅ Role management (change user roles)
- ✅ Property approval/rejection
- ✅ Agent verification and approval
- ✅ Service provider approval
- ✅ Platform configuration
- ✅ View all transactions
- ✅ Financial reporting
- ✅ Commission payout processing
- ✅ ERCA tax reports
- ✅ System analytics dashboard
- ✅ Emergency contacts management
- ✅ Security audit logs

**Admin Portal Access:**
- **URL:** `https://[project].replit.dev/admin`
- **Protected Route:** Requires `admin` role

**Verification Status:**
- Phone Verified: ✅ Yes
- ID Verified: ✅ Yes
- Highest Privilege Level: ✅ Yes

**Test Scenarios:**
1. Login to admin portal
2. Manage user accounts (view, suspend, reactivate)
3. Change user roles
4. Approve/reject property listings
5. Verify agent applications
6. Process commission payouts
7. Generate ERCA tax reports
8. View platform-wide analytics
9. Review security audit logs
10. Manage emergency contacts

---

## Testing Instructions for INSA Auditors

### 🔐 **Authentication Testing**

**Login via Email:**
```
URL: https://[project].replit.dev/login
1. Enter email (e.g., guest@alga.et)
2. Enter password
3. System validates and creates session
4. Redirects to appropriate dashboard
```

**Login via Phone (Alternative):**
```
URL: https://[project].replit.dev/login
1. Enter phone number (+251911000001)
2. Enter password
3. System validates
4. Creates secure session
```

**OTP Verification (If Enabled):**
```
Note: For testing purposes, accounts are pre-verified.
In production, 4-digit OTP sent via SMS (Ethiopian Telecom).
```

### 🧪 **Role-Based Access Control (RBAC) Testing**

**Test Separation of Duties:**
1. Login as Guest → Try to access `/admin` → Should be blocked
2. Login as Host → Try to verify IDs → Should be blocked
3. Login as Operator → Try to process payouts → Should be blocked
4. Login as Admin → Access all features → Should succeed

**Expected Behavior:**
- ✅ Each role sees only authorized features
- ✅ Unauthorized routes return 403 Forbidden
- ✅ Role checks on both frontend and backend
- ✅ No privilege escalation possible

### 🛡️ **Security Features to Test**

**Session Management:**
- ✅ Sessions stored in PostgreSQL (not in-memory)
- ✅ httpOnly cookies (not accessible to JavaScript)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=Strict (CSRF protection)
- ✅ 24-hour timeout
- ✅ Automatic cleanup

**Password Security:**
- ✅ Bcrypt hashing (10 rounds)
- ✅ Minimum 8 characters
- ✅ No plaintext storage
- ✅ Salt per password

**Input Validation:**
- ✅ Frontend: Zod schemas
- ✅ Backend: express-validator
- ✅ INSA hardening layer (XSS detection)
- ✅ SQL injection prevention (100% ORM)
- ✅ NoSQL injection sanitization

**Rate Limiting:**
- ✅ 100 requests per 15 minutes per IP
- ✅ Applied to all routes
- ✅ Returns 429 Too Many Requests

### 📡 **API Endpoint Testing**

**Authentication Endpoints:**
```bash
# Register new user
POST /api/auth/register
Body: { email, password, firstName, lastName }

# Login
POST /api/auth/login
Body: { email, password }

# Logout
POST /api/auth/logout

# Check session
GET /api/auth/check
```

**Property Endpoints (Host/Admin):**
```bash
# Get all properties
GET /api/properties

# Create property (requires host/admin role)
POST /api/properties
Headers: Cookie (session)
Body: { title, description, type, location, ... }

# Update property
PATCH /api/properties/:id

# Delete property
DELETE /api/properties/:id
```

**Agent Endpoints:**
```bash
# Get agent dashboard
GET /api/agents/dashboard
Headers: Cookie (session - agent role)

# Link property
POST /api/agents/link-property
Body: { propertyId }

# Get commissions
GET /api/agents/commissions
```

**Admin Endpoints:**
```bash
# Get all users (admin only)
GET /api/admin/users

# Update user role (admin only)
PATCH /api/admin/users/:id/role
Body: { role: "admin" | "operator" | "host" | "guest" | "agent" }

# Verify agent
PATCH /api/admin/agents/:id/verify
```

### 🎯 **Functional Testing Scenarios**

**Scenario 1: Guest Booking Flow**
1. Login as Guest (guest@alga.et)
2. Search properties in "Addis Ababa"
3. Select a property
4. Choose dates (check-in, check-out)
5. Add guests count
6. Proceed to payment
7. Complete booking
8. Verify confirmation email/SMS

**Scenario 2: Host Property Management**
1. Login as Host (host@alga.et)
2. Create new property listing
3. Upload 5 images
4. Set amenities and pricing
5. Generate 6-digit access code
6. Submit for approval
7. View earnings dashboard

**Scenario 3: Agent Commission Tracking**
1. Login as Agent (agent@alga.et)
2. View agent dashboard
3. Link existing property
4. Track commission timeline (36 months)
5. View total earnings
6. Request TeleBirr payout

**Scenario 4: Operator ID Verification**
1. Login as Operator (operator@alga.et)
2. Access verification dashboard
3. Review pending documents
4. Approve/reject with notes
5. Process Fayda ID verification

**Scenario 5: Admin User Management**
1. Login as Admin (admin@alga.et)
2. Access admin portal (`/admin`)
3. View all users
4. Change user role
5. Suspend/reactivate account
6. View audit logs

---

## Database Verification

**Test accounts are stored in the following tables:**

```sql
-- View all test accounts
SELECT id, email, role, phone_number, phone_verified, id_verified, status 
FROM users 
WHERE email LIKE '%@alga.et' 
ORDER BY role;

-- View agent profile
SELECT * FROM agents WHERE phone_number = '+251911000003';

-- View admin user
SELECT * FROM users WHERE role = 'admin' AND email = 'admin@alga.et';
```

**Current Database IDs:**
- Guest: `3856f643-7446-485d-b59a-dcaad09bcf94`
- Host: `bbdf019b-0367-4a68-9f21-9c5e636d57b5`
- Agent: `d5b197ce-ac48-48cf-b2ec-43fe7f0bfe7f` (Agent ID: 2)
- Operator: `c29c44e4-779b-478e-adf7-30fe97261e36`
- Admin: `55eeecba-e830-4ef1-b117-01a53883f234`

---

## Security Testing Recommendations

### ✅ **Tests INSA Should Perform:**

1. **Authentication Bypass Attempts**
   - Try accessing `/admin` without login
   - Try changing role via cookie manipulation
   - Attempt session hijacking

2. **Input Validation**
   - SQL injection in login form
   - XSS in property description
   - Path traversal in file uploads
   - LDAP injection (if applicable)

3. **Authorization Testing**
   - Guest accessing host endpoints
   - Host accessing admin endpoints
   - Operator processing payouts

4. **Session Security**
   - Session fixation attempts
   - Concurrent session handling
   - Session timeout verification

5. **API Security**
   - Rate limiting effectiveness
   - CORS policy enforcement
   - API authentication bypass

6. **File Upload Security**
   - Upload malicious file types
   - Test file size limits (5MB max)
   - Verify image compression

7. **Payment Security**
   - Test Alga Pay integration
   - Verify commission calculations
   - Check transaction logging

8. **Data Protection**
   - Verify password hashing
   - Check sensitive data encryption
   - Test data access controls

---

## Support Information

**For INSA Auditors:**

If you encounter any issues with test accounts:

📧 **Email:** support@alga.et  
📱 **Phone:** +251 99 603 4044  
🌐 **Portal:** https://[project].replit.dev

**Expected Response Time:** Within 24 hours

**Technical Contact:**  
Alga Development Team  
Available: 9:00 AM - 6:00 PM EAT (UTC+3)

---

## Important Notes

⚠️ **Test Account Policies:**

1. **Password Security:**
   - Passwords use special characters for complexity
   - All accounts have unique, strong passwords
   - Bcrypt hashing with 10 rounds

2. **Data Isolation:**
   - Test accounts operate on production database
   - No mock data; real transactions
   - All actions logged in audit trail

3. **Verification Status:**
   - Guest: Not ID-verified (intentional)
   - All others: Pre-verified for testing

4. **Commission System:**
   - Agent account fully configured
   - 5% commission rate active
   - 36-month validity period
   - TeleBirr payout integration

5. **Session Duration:**
   - 24-hour automatic timeout
   - Manual logout available
   - PostgreSQL session persistence

---

**Document Prepared By:** Alga Development Team  
**Last Updated:** November 6, 2025  
**Version:** 1.0  
**Compliance:** INSA OF/AEAD/001

🇪🇹 **Ready for INSA Security Testing** ✨
