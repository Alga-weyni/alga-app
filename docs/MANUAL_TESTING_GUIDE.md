# 🧪 Alga - Manual Testing Guide

## 🎯 **Complete Testing Walkthrough**

This guide provides step-by-step instructions to test all features of Alga without automation.

---

## 🚀 **Quick Access**

- **Live App**: Your Replit URL
- **Test Admin**: `test-admin@alga.et` / `Test@1234`
- **Default OTP**: `1234` (for all test accounts)

---

## 1️⃣ **GUEST JOURNEY** (10 minutes)

### **Step 1: Browse Properties**

1. Go to `/properties`
2. Verify you see ~50 properties
3. Try filters:
   - City: Addis Ababa, Gondar, Bahir Dar
   - Price range slider
   - Property type (apartment, villa, studio)
   - Guest count

**✅ Success**: Filters update property list in real-time

---

### **Step 2: View Property Details**

1. Click any property card
2. Verify you see:
   - Photo gallery (swipe through images)
   - Price per night
   - Amenities list
   - Location (mini map if Google Maps configured)
   - Host information
   - Reviews & ratings

**✅ Success**: All property details load correctly

---

### **Step 3: Create Booking**

1. Click "Book Now"
2. Sign up with phone: `+251922334455`
3. Enter OTP: `1234`
4. Select check-in/check-out dates
5. Enter guest count
6. Review total price calculation
7. Click "Confirm Booking"

**Expected Calculation:**
```
Base Price: 2,500 ETB × 5 nights = 12,500 ETB
Service Fee (2.5%): 313 ETB
VAT (15%): 1,875 ETB
TOTAL: 14,688 ETB
```

**✅ Success**: Booking created, payment page shown

---

### **Step 4: Complete Payment**

1. Select payment method:
   - Chapa (card/mobile money)
   - Telebirr
   - Stripe (international)
   - PayPal

2. Complete test payment (use test card if available)
3. Wait for confirmation

**✅ Success**: Booking confirmed, lockbox code displayed

---

### **Step 5: View Lockbox Code**

1. After payment, see "Your Stay" page
2. Verify 4-digit lockbox PIN displayed
3. Note SMS/WhatsApp notification sent
4. Code format: `Your lockbox code: 4782`

**✅ Success**: Code visible and sent to phone

---

### **Step 6: Leave Review**

1. After checkout date passes
2. Go to "My Bookings"
3. Click "Write Review"
4. Rate 1-5 stars (overall + categories)
5. Write comment
6. Submit

**✅ Success**: Review appears on property page

---

## 2️⃣ **HOST JOURNEY** (15 minutes)

### **Step 1: Create Account**

1. Go to `/register`
2. Enter phone: `+251911223344`
3. Enter OTP: `1234`
4. Fill profile:
   - Name: Dawit Tesfaye
   - Email: dawit@host.et

**✅ Success**: Account created, redirected to dashboard

---

### **Step 2: Verify Fayda ID**

1. Go to `/profile` → "Verify Identity"
2. Enter Fayda ID: `987654321098`
3. Enter Date of Birth: `1988-03-20`
4. Click "Verify"

**Expected Response:**
```json
{
  "verified": true,
  "identity": {
    "fullName": "Dawit Tesfaye Alemayehu",
    "dateOfBirth": "1988-03-20",
    "gender": "Male",
    "nationality": "Ethiopian"
  }
}
```

**✅ Success**: Green checkmark "Verified" badge

---

### **Step 3: Create Property Listing**

1. Go to `/host-dashboard` → "Add Property"
2. Fill form:
   - **Title**: Luxury Villa in Bole
   - **Type**: Villa
   - **City**: Addis Ababa
   - **Address**: Bole Medhanialem, Building 12
   - **Price/Night**: 5,000 ETB
   - **Bedrooms**: 3
   - **Bathrooms**: 2
   - **Max Guests**: 6
   - **Amenities**: WiFi, Parking, Kitchen, Pool

3. **Hardware Verification**:
   - Lockbox Brand: TTLock KB01
   - Lockbox Serial: KB01-2024-XXXXX
   - Camera Brand: Hikvision
   - Camera Serial: CAM-2024-XXXXX
   - Upload photos of devices

4. Upload property photos (5+ images)
5. Submit

**✅ Success**: Property status "Pending Review"

---

### **Step 4: Wait for Operator Approval**

1. Check status: `/host-dashboard`
2. Status shows "Under Review"
3. Operator approves (see Operator Journey)
4. Status changes to "Active"

**✅ Success**: Property visible on `/properties`

---

### **Step 5: Manage Bookings**

1. When guest books your property
2. View in `/host-dashboard` → "Bookings"
3. See booking details:
   - Guest name & contact
   - Check-in/out dates
   - Payment status
   - Lockbox code (auto-generated)

**✅ Success**: All booking info visible

---

### **Step 6: Receive Payout**

1. After guest checks in
2. Payout automatically calculated:
   - Guest paid: 14,688 ETB
   - Host receives: 11,563 ETB (78.7%)
   - Agent commission: 625 ETB (5%)
   - Alga fee: 313 ETB (2.5%)
   - VAT: 1,875 ETB (15%)

3. View in "Earnings" tab
4. Withdraw to bank account

**✅ Success**: Correct payout calculation

---

## 3️⃣ **AGENT (DELLALA) JOURNEY** (12 minutes)

### **Step 1: Register as Agent**

1. Click **💼 Agent Portal** in navigation
2. Click "Become an Agent"
3. Fill form:
   - **Name**: Meron Tadesse
   - **Phone**: `+251911234567`
   - **Business Name**: Meron Property Services
   - **City**: Addis Ababa
   - **TeleBirr Account**: 0911234567

4. Verify Fayda ID: `123456789012`
5. Submit application

**✅ Success**: Application submitted, pending approval

---

### **Step 2: Get Approved**

1. Operator reviews application
2. Approves agent account
3. Agent status: "Active"

**✅ Success**: Can now source properties

---

### **Step 3: Source Property**

1. Find property owner (Dawit)
2. Convince them to list on Alga
3. Dawit lists property
4. In property form, enters Agent Referral Code: `MERON123`

**✅ Success**: Property linked to agent

---

### **Step 4: Earn Commission**

1. Guest books Dawit's property
2. Agent automatically earns 5% commission
3. Calculation:
   - Guest total: 14,688 ETB
   - Base price: 12,500 ETB
   - Agent commission: 625 ETB

**Expected Formula:**
```
Commission = (Booking Total - VAT) × 5%
           = (14,688 - 1,875) × 0.05
           = 12,813 × 0.05
           = 625 ETB
```

**✅ Success**: Commission credited to agent account

---

### **Step 5: View Dashboard**

1. Go to `/dellala/dashboard`
2. Verify you see:
   - Total earnings: 625 ETB
   - Active properties: 1
   - Total bookings: 1
   - Commission rate: 5% (36 months)
   - Next payout date

**✅ Success**: All stats accurate

---

### **Step 6: Withdraw Earnings**

1. Click "Withdraw"
2. Enter amount: 625 ETB
3. Select TeleBirr account
4. Confirm withdrawal
5. Funds sent to TeleBirr: 0911234567

**✅ Success**: Withdrawal processed

---

## 4️⃣ **OPERATOR JOURNEY** (8 minutes)

### **Step 1: Login as Operator**

1. Go to `/login`
2. Email: `test-admin@alga.et`
3. Password: `Test@1234`

**✅ Success**: Redirected to `/operator-dashboard`

---

### **Step 2: Review Pending Property**

1. See "Pending Verifications" section
2. Click property: "Luxury Villa in Bole"
3. Review details:
   - Property info (address, price, amenities)
   - Host identity (Fayda ID verified?)
   - Hardware photos (lockbox + camera)
   - Property photos

**Verification Checklist:**
- [ ] Valid address
- [ ] Reasonable pricing
- [ ] Hardware properly installed
- [ ] Clear photos
- [ ] Host verified

**✅ Success**: All info displayed for review

---

### **Step 3: Approve/Reject Property**

**Option A: Approve**
1. Click "Approve Property"
2. Add approval note: "All requirements met"
3. Submit

**Option B: Reject**
1. Click "Request Changes"
2. Select reason:
   - Missing hardware photos
   - Invalid address
   - Poor photo quality
3. Add comment explaining what to fix
4. Submit

**✅ Success**: Property status updated, host notified

---

### **Step 4: Verify Agent Application**

1. Go to "Agent Applications" tab
2. Review: Meron Tadesse
3. Check:
   - Fayda ID verified? ✅
   - Valid phone number? ✅
   - Business name provided? ✅
   - TeleBirr account? ✅

4. Click "Approve Agent"

**✅ Success**: Agent activated, can source properties

---

### **Step 5: Access INSA Compliance**

1. Go to `/insa-compliance`
2. View 4 tabs:
   - **Completed** (98/100 items)
   - **Missing** (2 items)
   - **Legal** (proclamations & regulations)
   - **Test** (security tests)

3. Export JSON report
4. Test offline mode:
   - Disconnect internet
   - Refresh page
   - Page still works (cached in IndexedDB)

**✅ Success**: Offline access works

---

## 5️⃣ **ADMIN JOURNEY** (10 minutes)

### **Step 1: Login as Admin**

1. Email: `test-admin@alga.et` (has admin role)
2. Password: `Test@1234`

**✅ Success**: Full admin access

---

### **Step 2: View Lemlem Dashboard**

1. Go to `/operator-dashboard`
2. See 5 operational pillars:
   - Agent Governance
   - Supply Curation
   - Hardware Deployment
   - Payments & Compliance
   - Marketing & Growth

3. Review KPIs:
   - Active agents: 1
   - Pending properties: 0
   - Today's bookings: 1
   - Commission paid: 625 ETB
   - Revenue (30 days): 313 ETB

**✅ Success**: Real-time KPIs displayed

---

### **Step 3: Ask Lemlem (AI Assistant)**

1. Click "Ask Lemlem Admin Chat"
2. Type query: "Show today's top agents"
3. AI responds with:
   - Agent name: Meron Tadesse
   - Earnings today: 625 ETB
   - Properties sourced: 1

4. Try voice command (click microphone):
   - Say: "List pending verifications"
   - AI responds in voice (Amharic/English)

**✅ Success**: Natural language queries work

---

### **Step 4: Manage Users**

1. Go to "User Management"
2. See all users (guests, hosts, agents, operators)
3. Filter by role
4. Edit user:
   - Change role
   - Activate/deactivate
   - Reset verification

**✅ Success**: User management functional

---

### **Step 5: View E-Signature Audit**

1. Go to `/admin/signatures`
2. See all electronic signatures:
   - User ID
   - Action (booking, agreement, etc.)
   - Timestamp
   - IP address (encrypted)
   - Verification status
   - Signature hash (SHA-256)

3. Test filters:
   - Date range
   - User ID
   - Action type

4. Export report (CSV, PDF, JSON)

**✅ Success**: Complete audit trail

---

### **Step 6: Generate Reports**

1. Click "Export CSV" on any dashboard section
2. Download reports:
   - Agent performance
   - Booking summary
   - Commission breakdown
   - Property listings
   - Revenue analysis

**✅ Success**: All reports downloadable

---

## 6️⃣ **SERVICE PROVIDER JOURNEY** (5 minutes)

### **Step 1: Register as Provider**

1. Go to `/services/apply`
2. Fill form:
   - **Name**: Amanuel Tesfaye
   - **Phone**: `+251933445566`
   - **Service Category**: Cleaning
   - **Experience**: 5 years
   - **Service Areas**: Addis Ababa, Bahir Dar

3. Submit application

**✅ Success**: Application submitted

---

### **Step 2: Get Approved**

1. Operator reviews application
2. Approves provider
3. Provider status: "Active"

**✅ Success**: Can accept jobs

---

### **Step 3: Receive Job Request**

1. Guest books property
2. Requests cleaning service
3. Provider gets notification:
   - Property: Luxury Villa in Bole
   - Service: Deep cleaning
   - Date: Check-out day
   - Payment: 900 ETB

**✅ Success**: Job details sent

---

### **Step 4: Complete Job**

1. Provider marks job "Complete"
2. Uploads before/after photos
3. Guest confirms service
4. Payment released: 900 ETB

**✅ Success**: Payment processed

---

## 7️⃣ **OFFLINE MODE** (PWA Testing)

### **Step 1: Install PWA**

**Android:**
1. Visit site in Chrome
2. Tap "Add to Home Screen"
3. App icon appears on home screen
4. Open app

**iOS:**
1. Visit site in Safari
2. Tap Share → "Add to Home Screen"
3. App icon appears
4. Open app

**✅ Success**: App installs without app store

---

### **Step 2: Test Offline Features**

1. Open PWA
2. Go to `/insa-compliance`
3. **Turn off internet**
4. Refresh page
5. Verify:
   - Page still loads
   - All tabs work
   - Cached data visible
   - "Offline Mode" indicator shown

**✅ Success**: Full offline functionality

---

### **Step 3: Test Auto-Sync**

1. While offline, browse properties (uses cached data)
2. **Turn on internet**
3. Page auto-refreshes
4. Latest data synced

**✅ Success**: Seamless sync

---

## 8️⃣ **HARDWARE INTEGRATION**

### **Step 1: Test Lockbox Code Generation**

1. Create booking (as guest)
2. Complete payment
3. Backend calls TTLock API:
   ```
   POST /api/lockbox/generate-code
   {
     "lockboxId": "KB01-2024-12345",
     "startTime": "2024-11-13 14:00",
     "endTime": "2024-11-18 11:00",
     "userId": "guest-123"
   }
   ```
4. Response: `{"code": "4782"}`
5. Code sent to guest via SMS/WhatsApp

**✅ Success**: 4-digit code generated

---

### **Step 2: Test Physical Lockbox**

1. Go to property with lockbox
2. Enter code on keypad: `4 7 8 2`
3. Lockbox unlocks
4. Retrieve physical property key
5. Unlock property door

**✅ Success**: Physical access granted

---

### **Step 3: Test Code Expiration**

1. Wait until checkout time passes
2. Try entering same code
3. Lockbox remains locked (code expired)

**✅ Success**: Time-limited access works

---

### **Step 4: Test Camera Integration**

1. Camera captures:
   - Guest check-in timestamp
   - Guest check-out timestamp
   - Any alerts/incidents

2. View snapshots in operator dashboard

**✅ Success**: Security logging active

---

## 9️⃣ **FULL END-TO-END SCENARIO**

### **Complete Lifecycle (30 minutes)**

**Day 1: Agent Sources Property**
1. Meron (Agent) finds Dawit (Host)
2. Dawit lists property with agent code

**Day 2: Operator Approves**
1. Selamawit (Operator) reviews property
2. Approves listing
3. Property goes live

**Day 10: Guest Books**
1. Ahmed (Guest) searches properties
2. Books Dawit's villa (5 nights)
3. Pays 14,688 ETB via Chapa

**Day 11: Lockbox Code Sent**
1. Backend generates code: 4782
2. SMS sent to Ahmed
3. Ahmed receives notification

**Day 15: Check-In**
1. Ahmed arrives at property
2. Enters lockbox code: 4782
3. Retrieves key, unlocks door
4. Camera logs entry

**Day 16: Payouts Distributed**
1. Dawit receives: 11,563 ETB
2. Meron receives: 625 ETB
3. Alga retains: 313 ETB
4. VAT paid: 1,875 ETB

**Day 20: Check-Out & Review**
1. Ahmed checks out
2. Lockbox code expires
3. Ahmed leaves 5-star review

**Day 21: Cleaning Service**
1. Amanuel cleans property
2. Uploads completion photos
3. Receives 900 ETB

**Day 30: Agent Withdraws**
1. Meron withdraws 625 ETB
2. Funds sent to TeleBirr

**✅ Success**: Complete ecosystem functional

---

## ✅ **Testing Checklist**

### **Core Features**
- [ ] Property search & filters
- [ ] Booking creation
- [ ] Payment processing (Chapa, Telebirr, Stripe)
- [ ] Lockbox code generation
- [ ] Agent commission calculation
- [ ] Operator property approval
- [ ] Fayda ID verification
- [ ] Service provider marketplace

### **Security & Compliance**
- [ ] E-signature system
- [ ] INSA compliance (75%+)
- [ ] Encrypted IP addresses
- [ ] SHA-256 signature hashing
- [ ] Audit trail logging
- [ ] Rate limiting

### **Offline Capabilities**
- [ ] PWA installation (Android/iOS)
- [ ] INSA compliance page offline
- [ ] Auto-sync when online
- [ ] IndexedDB caching

### **Hardware Integration**
- [ ] TTLock API integration
- [ ] 4-digit PIN generation
- [ ] Time-limited codes
- [ ] Camera snapshot logging

### **Financial Accuracy**
- [ ] Booking price calculation
- [ ] VAT calculation (15%)
- [ ] Service fee calculation (2.5%)
- [ ] Agent commission (5%)
- [ ] Payout distribution

---

## 🐛 **Common Issues & Solutions**

### **Issue**: Property not showing after approval
**Solution**: Clear browser cache, refresh page

### **Issue**: OTP not working
**Solution**: Use default test OTP: `1234`

### **Issue**: Lockbox code not generating
**Solution**: Check TTLock API credentials in secrets

### **Issue**: Payment failing
**Solution**: Verify payment processor API keys (test mode)

### **Issue**: Mobile app shows 0 properties
**Solution**: Rebuild app: `npm run build && npx cap sync android`

### **Issue**: Offline mode not working
**Solution**: Ensure PWA installed, check service worker registration

---

## 📊 **Test Results Documentation**

### **Record Your Results:**

**Journey**: _______________  
**Tester**: _______________  
**Date**: _______________  

**Results:**
- [ ] All steps completed
- [ ] No errors encountered
- [ ] Performance acceptable
- [ ] UI responsive

**Issues Found:**
1. _______________
2. _______________
3. _______________

**Notes:**
_______________
_______________
_______________

---

**🎉 Complete this guide to ensure Alga is production-ready!**

---

**Duration**: ~90 minutes (all journeys)  
**Recommended**: Test in order (Guest → Host → Agent → Operator → Admin)  
**Tools Needed**: Phone for OTP verification, internet connection (test offline mode separately)
