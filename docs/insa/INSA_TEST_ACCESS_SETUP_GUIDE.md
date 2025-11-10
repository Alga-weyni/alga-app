# INSA Mobile App Test Access Setup Guide

## Overview
This guide explains how to set up test accounts and access for INSA security auditors to test the Alga mobile application.

---

## Step 1: Create Test Database Accounts

### Option A: Using the Admin Dashboard (Recommended)

1. **Log in as Admin:**
   - Go to https://alga-app.replit.app
   - Email: `your-admin@email.com`
   - Password: `your-admin-password`

2. **Navigate to User Management:**
   - Click on "Admin Dashboard" (top right)
   - Go to "Users" section
   - Click "Create Test User"

3. **Create 5 Test Accounts:**

   **Test Account 1 - Guest (Traveler)**
   - First Name: `Test`
   - Last Name: `Guest`
   - Email: `test-guest@alga.et`
   - Phone: `+251900000001`
   - Password: `Test@1234`
   - Role: `guest`
   - Verified: ✅ Yes
   - Click "Create User"

   **Test Account 2 - Host (Property Owner)**
   - First Name: `Test`
   - Last Name: `Host`
   - Email: `test-host@alga.et`
   - Phone: `+251900000002`
   - Password: `Test@1234`
   - Role: `host`
   - Verified: ✅ Yes
   - Click "Create User"

   **Test Account 3 - Delala Agent**
   - First Name: `Test`
   - Last Name: `Agent`
   - Email: `test-agent@alga.et`
   - Phone: `+251900000003`
   - Password: `Test@1234`
   - Role: `agent`
   - Verified: ✅ Yes
   - Business Name: `Test Agency PLC`
   - TIN: `0100000001`
   - Click "Create User"

   **Test Account 4 - Operator (Verification Team)**
   - First Name: `Test`
   - Last Name: `Operator`
   - Email: `test-operator@alga.et`
   - Phone: `+251900000004`
   - Password: `Test@1234`
   - Role: `operator`
   - Verified: ✅ Yes
   - Click "Create User"

   **Test Account 5 - Admin (Platform Manager)**
   - First Name: `INSA`
   - Last Name: `Admin`
   - Email: `test-admin@alga.et`
   - Phone: `+251900000005`
   - Password: `Test@1234`
   - Role: `admin`
   - Verified: ✅ Yes
   - Click "Create User"

---

### Option B: Using SQL (If No Admin Dashboard)

Run these SQL commands in your database:

```sql
-- 1. Create Test Guest Account
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status, is_verified)
VALUES (
  'Test',
  'Guest',
  'test-guest@alga.et',
  '+251900000001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU0iYY.xPqJy', -- Test@1234
  'guest',
  'active',
  true
);

-- 2. Create Test Host Account
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status, is_verified)
VALUES (
  'Test',
  'Host',
  'test-host@alga.et',
  '+251900000002',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU0iYY.xPqJy', -- Test@1234
  'host',
  'active',
  true
);

-- 3. Create Test Agent Account
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status, is_verified, business_name, tin)
VALUES (
  'Test',
  'Agent',
  'test-agent@alga.et',
  '+251900000003',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU0iYY.xPqJy', -- Test@1234
  'agent',
  'active',
  true,
  'Test Agency PLC',
  '0100000001'
);

-- 4. Create Test Operator Account
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status, is_verified)
VALUES (
  'Test',
  'Operator',
  'test-operator@alga.et',
  '+251900000004',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU0iYY.xPqJy', -- Test@1234
  'operator',
  'active',
  true
);

-- 5. Create Test Admin Account
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status, is_verified)
VALUES (
  'INSA',
  'Admin',
  'test-admin@alga.et',
  '+251900000005',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU0iYY.xPqJy', -- Test@1234
  'admin',
  'active',
  true
);
```

**Note:** The password hash above is for `Test@1234` (already Bcrypt hashed, cost factor 12)

---

## Step 2: Create Test Properties (For Host Account)

1. **Log in as Test Host:**
   - Email: `test-host@alga.et`
   - Password: `Test@1234`

2. **Create 3 Sample Properties:**

   **Property 1: Lalibela Guesthouse**
   - Title: `Cozy Guesthouse in Lalibela`
   - Description: `Beautiful traditional guesthouse near the rock-hewn churches`
   - City: `Lalibela`
   - Price per Night: `1500 ETB`
   - Max Guests: `4`
   - Bedrooms: `2`
   - Bathrooms: `1`
   - Amenities: WiFi, Breakfast, Parking
   - Status: `approved` (pre-verified for testing)

   **Property 2: Addis Ababa Apartment**
   - Title: `Modern Apartment in Bole`
   - Description: `Fully furnished 1-bedroom apartment in Bole business district`
   - City: `Addis Ababa`
   - Price per Night: `2500 ETB`
   - Max Guests: `2`
   - Bedrooms: `1`
   - Bathrooms: `1`
   - Amenities: WiFi, Kitchen, Air Conditioning
   - Status: `approved`

   **Property 3: Bahir Dar Lake View**
   - Title: `Lake Tana View Hotel`
   - Description: `Hotel room with stunning Lake Tana views`
   - City: `Bahir Dar`
   - Price per Night: `1800 ETB`
   - Max Guests: `3`
   - Bedrooms: `1`
   - Bathrooms: `1`
   - Amenities: WiFi, Breakfast, Lake View
   - Status: `approved`

---

## Step 3: Configure Test Mode for Payments

### Enable Sandbox Mode for Payment Processors:

1. **Update Environment Variables:**

   Edit your `.env` file:

   ```bash
   # Chapa Test Mode
   CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxx  # Use TEST key, not live
   CHAPA_MODE=test  # Enable test mode
   
   # Stripe Test Mode
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx  # Use test key
   VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxx  # Use test public key
   
   # PayPal Sandbox
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=sandbox_client_id
   PAYPAL_CLIENT_SECRET=sandbox_secret
   ```

2. **Test Payment Credentials for INSA:**

   **Chapa (TeleBirr) Test Mode:**
   - Test Phone: `+251900000000`
   - Test Card: `4200000000000000` (Visa)
   - Test CVV: `123`
   - Test Expiry: Any future date
   - Result: Always succeeds in test mode

   **Stripe Test Mode:**
   - Test Card (Success): `4242 4242 4242 4242`
   - Test Card (Declined): `4000 0000 0000 0002`
   - Test Card (3D Secure): `4000 0025 0000 3155`
   - Test CVV: Any 3 digits
   - Test Expiry: Any future date

---

## Step 4: Configure OTP Bypass for Testing

### Option A: Universal Test OTP (Recommended for INSA)

Add this to your backend OTP verification logic:

```typescript
// server/routes.ts - OTP verification
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  // INSA TEST MODE: Accept universal OTP "1234" for test accounts
  const isTestAccount = phoneNumber.startsWith('+2519000000');
  if (isTestAccount && otp === '1234') {
    // Bypass OTP verification for INSA testing
    const user = await storage.getUserByPhone(phoneNumber);
    req.session.user = user;
    return res.json({ success: true, user });
  }
  
  // Normal OTP verification for production users
  const isValid = await storage.verifyOTP(phoneNumber, otp);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  
  const user = await storage.getUserByPhone(phoneNumber);
  req.session.user = user;
  res.json({ success: true, user });
});
```

### Option B: Disable SMS for Test Accounts

```typescript
// server/routes.ts - OTP generation
app.post('/api/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  
  const otp = generateOTP(); // e.g., "4738"
  await storage.saveOTP(phoneNumber, otp);
  
  // Skip SMS for test accounts (log to console instead)
  const isTestAccount = phoneNumber.startsWith('+2519000000');
  if (isTestAccount) {
    console.log(`[TEST MODE] OTP for ${phoneNumber}: ${otp}`);
    return res.json({ 
      success: true, 
      message: 'OTP sent (test mode - check server logs)' 
    });
  }
  
  // Send real SMS for production users
  await sendSMS(phoneNumber, `Your Alga OTP: ${otp}`);
  res.json({ success: true });
});
```

**INSA Testing Instructions:**
- When logging in with test accounts (+2519000000XX), use OTP: `1234`
- This bypasses SMS sending and works immediately

---

## Step 5: Prepare Test Access Document for INSA

Create a simple credential sheet to send to INSA:

```
ALGA MOBILE APP - TEST ACCESS CREDENTIALS
==========================================

Test Environment: https://alga-app.replit.app
Mobile Apps: [Provide APK/IPA files on CD/DVD]

TEST ACCOUNTS:
--------------

1. Guest (Traveler)
   Email: test-guest@alga.et
   Password: Test@1234
   Phone: +251900000001
   OTP Code: 1234 (universal for testing)

2. Host (Property Owner)
   Email: test-host@alga.et
   Password: Test@1234
   Phone: +251900000002
   OTP Code: 1234
   
3. Delala Agent
   Email: test-agent@alga.et
   Password: Test@1234
   Phone: +251900000003
   OTP Code: 1234
   Business TIN: 0100000001

4. Operator (Verification Team)
   Email: test-operator@alga.et
   Password: Test@1234
   Phone: +251900000004
   OTP Code: 1234

5. Admin (Full Access)
   Email: test-admin@alga.et
   Password: Test@1234
   Phone: +251900000005
   OTP Code: 1234

TEST PAYMENT METHODS:
---------------------

TeleBirr (via Chapa):
- Phone: +251900000000
- Result: Always succeeds

Credit Card (via Stripe):
- Card Number: 4242 4242 4242 4242
- CVV: 123
- Expiry: 12/25
- Result: Always succeeds

PayPal Sandbox:
- Create test account at: https://developer.paypal.com/dashboard/accounts
- Or use: test-buyer@alga.et / Test@1234

NOTES:
------
- All test accounts are pre-verified (no email confirmation needed)
- OTP code "1234" works for all test phone numbers
- Test properties already created by test-host@alga.et
- Payment processors are in SANDBOX mode (no real money charged)
- Session timeout: 24 hours

SUPPORT CONTACT:
----------------
Name: Weyni Abraha
Email: Winnieaman94@gmail.com
Phone: +251 996 034 044
Available: Mon-Fri, 9:00 AM - 5:00 PM (Ethiopian Time)
```

---

## Step 6: Test the Accounts (Before Sending to INSA)

### Self-Testing Checklist:

1. **Test Guest Login:**
   ```
   ✅ Can log in with test-guest@alga.et / Test@1234
   ✅ OTP "1234" works
   ✅ Can browse properties
   ✅ Can create a booking
   ✅ Payment sandbox works
   ```

2. **Test Host Login:**
   ```
   ✅ Can log in with test-host@alga.et / Test@1234
   ✅ Can view properties dashboard
   ✅ Can create new property
   ✅ Can edit existing property
   ✅ Can view bookings for my properties
   ```

3. **Test Agent Login:**
   ```
   ✅ Can log in with test-agent@alga.et / Test@1234
   ✅ Can view agent dashboard
   ✅ Commission tracking visible
   ✅ Can add properties on behalf of owners
   ```

4. **Test Operator Login:**
   ```
   ✅ Can log in with test-operator@alga.et / Test@1234
   ✅ Can access verification dashboard
   ✅ Can approve/reject property verifications
   ✅ Can approve/reject ID verifications
   ```

5. **Test Admin Login:**
   ```
   ✅ Can log in with test-admin@alga.et / Test@1234
   ✅ Can view all users
   ✅ Can change user roles
   ✅ Can view all transactions
   ✅ Lemlem Operations dashboard loads
   ```

---

## Step 7: Deliver to INSA

### Delivery Package:

1. **Printed Credentials Sheet** (from Step 5)
2. **Android APK** (debug + release builds on CD/DVD)
3. **iOS IPA** (release build on CD/DVD)
4. **INSA Submission Document** (PDF with all requirements)
5. **Contact Card** (your name, email, phone)

### Delivery Methods:

**Option 1: Email (Quick Setup)**
- Send credentials sheet to: tilahune@insa.gov.et
- CC: Winnieaman94@gmail.com
- Subject: "ALGA Test Access Credentials - INSA Audit"

**Option 2: Physical Delivery**
- Print credentials sheet
- Burn APK/IPA to CD/DVD
- Deliver to:
  ```
  Information Network Security Administration (INSA)
  Cyber Security Audit Division
  Wollo Sefer, Addis Ababa, Ethiopia
  Attention: Dr. Tilahun Ejigu
  ```

**Option 3: INSA Portal**
- Upload to: https://cyberaudit.insa.gov.et
- Create account and submit materials

---

## Step 8: Support During INSA Testing

### Be Available For:

1. **Account Issues:**
   - "Test account not logging in" → Check password, verify account exists
   - "OTP not working" → Confirm OTP bypass is enabled
   - "Session expired" → Normal (24-hour timeout), just re-login

2. **Payment Issues:**
   - "Payment failing" → Confirm sandbox mode enabled
   - "Test card declined" → Use 4242 4242 4242 4242 (success card)

3. **Access Issues:**
   - "Cannot access admin dashboard" → Confirm test-admin@alga.et role is 'admin'
   - "Forbidden error" → Check RBAC permissions

4. **Questions:**
   - Respond within 24 hours (business days)
   - Be available for phone calls during business hours

---

## Security Reminders

⚠️ **IMPORTANT:**

1. **Delete test accounts after audit:**
   - Once INSA completes testing, delete all test-* accounts
   - Prevents unauthorized access

2. **Disable OTP bypass in production:**
   - Remove universal "1234" OTP code
   - Enable real SMS sending

3. **Switch to live payment keys:**
   - Replace `CHASECK_TEST-xxx` with `CHASECK_LIVE-xxx`
   - Replace `sk_test_xxx` with `sk_live_xxx`

4. **Monitor test account activity:**
   - Check logs during INSA testing period
   - Ensure only INSA auditors are using test accounts

---

## Troubleshooting

### Issue: "Invalid credentials"
**Solution:** 
- Confirm account created successfully (check database)
- Password must be exactly: `Test@1234` (case-sensitive)
- Email must be exactly: `test-guest@alga.et` (no extra spaces)

### Issue: "OTP not accepted"
**Solution:**
- Confirm OTP bypass code is `1234`
- Check that phone number starts with `+2519000000`
- Verify OTP bypass logic is deployed

### Issue: "Payment fails in test mode"
**Solution:**
- Confirm environment variables use TEST keys
- Check Chapa/Stripe dashboard (should show test mode)
- Try different test card: `4242424242424242`

### Issue: "Cannot access admin features"
**Solution:**
- Check user role in database: `SELECT role FROM users WHERE email = 'test-admin@alga.et';`
- Should return: `admin`
- If wrong, update: `UPDATE users SET role = 'admin' WHERE email = 'test-admin@alga.et';`

---

## Contact for Setup Help

**Weyni Abraha**  
Founder & CEO, Alga One Member PLC  
Email: Winnieaman94@gmail.com  
Phone: +251 996 034 044  
Available: Monday-Friday, 9:00 AM - 5:00 PM (Ethiopian Time)

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2025  
**Purpose:** INSA Mobile App Security Audit Test Access Setup
