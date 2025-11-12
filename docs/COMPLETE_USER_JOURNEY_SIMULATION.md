# 🌍 ALGA – Complete User Journey Simulation Guide
**Your Ultimate End-to-End Testing & Demonstration Resource**

**Last Updated:** November 12, 2025  
**Version:** 2.0  
**Platform:** Alga (አልጋ) - Ethiopian Property Rental Marketplace

---

## 📚 **Table of Contents**

1. [Guest Journey](#1-guest-journey) - Browse, Book, Pay, Stay
2. [Host Journey](#2-host-journey) - List Property, Manage Bookings, Get Paid
3. [Agent Journey](#3-agent-journey) - Source Properties, Earn Commissions
4. [Operator Journey](#4-operator-journey) - Approve Properties, Resolve Issues
5. [Admin Journey](#5-admin-journey) - System Governance, Analytics, Security
6. [Service Provider Journey](#6-service-provider-journey) - Apply, Get Jobs, Earn
7. [Offline Mode Simulation](#7-offline-mode-simulation) - All Roles Offline
8. [Hardware Integration](#8-hardware-integration) - Lockbox, Camera, Access Codes
9. [Full End-to-End Scenario](#9-full-end-to-end-scenario) - Complete Lifecycle

---

## 🎯 **1. GUEST JOURNEY**
**"From Searching to Staying - The Complete Guest Experience"**

### **Test Guest Profile**
```
Name: Ahmed Hassan
Email: ahmed.guest@alga.et
Phone: +251922334455
OTP: 1234
Payment: Chapa/Telebirr
```

---

### **Step 1.1: Browse Properties**

**Actions:**
1. Open Alga homepage: `/`
2. Click **🏠 Stays** in navigation
3. View 50 available properties

**Search Filters:**
```
Destination: Addis Ababa
Check-in: November 15, 2025
Check-out: November 20, 2025
Guests: 2 adults
```

**API Call:**
```bash
GET /api/properties?city=Addis%20Ababa&checkIn=2025-11-15&checkOut=2025-11-20&maxGuests=2
```

**Expected Results:**
- Properties filtered by city and availability
- 50 stays displayed with images
- Price shown: "2,500 ETB/night"

---

### **Step 1.2: View Property Details**

**Actions:**
1. Click on **"Cozy Studio in Bole"** property card
2. View property details page: `/property/1`

**Details Shown:**
```
Title: Cozy Studio in Bole
Host: Dawit Tesfaye (⭐ 4.8)
Location: Bole, Addis Ababa
Price: 2,500 ETB/night
Amenities: WiFi, Kitchen, A/C, Parking
Hardware: ✅ Smart Lockbox, ✅ Security Camera
Reviews: 12 reviews (4.8 average)
```

**Map Integration:**
- Google Maps mini-map showing location
- Distance calculator from current location

---

### **Step 1.3: Create Account / Sign In**

**Actions:**
1. Click **"Book Now"** button
2. System prompts: **"Sign in to continue"**
3. Click **"Sign In"** in header
4. Choose **"Phone Number"** login

**Registration Flow:**
```
Phone: +251922334455
→ OTP sent to phone
→ Enter OTP: 1234
→ Enter Full Name: Ahmed Hassan
→ Account created! ✅
```

**API Calls:**
```bash
POST /api/auth/register/phone
{
  "phoneNumber": "+251922334455",
  "fullName": "Ahmed Hassan"
}

POST /api/auth/verify-otp
{
  "phoneNumber": "+251922334455",
  "otp": "1234"
}
```

**Success:**
- User logged in
- Redirected to booking page

---

### **Step 1.4: Make Booking**

**Booking Details:**
```
Property: Cozy Studio in Bole
Check-in: Nov 15, 2025 (3:00 PM)
Check-out: Nov 20, 2025 (11:00 AM)
Nights: 5
Guests: 2 adults
```

**Price Breakdown:**
```
5 nights × 2,500 ETB        = 12,500 ETB
VAT (15%)                   =  1,875 ETB
Platform Fee (2.5%)         =    313 ETB
──────────────────────────────────────
Total:                        14,688 ETB
```

**API Call:**
```bash
POST /api/bookings
{
  "propertyId": 1,
  "checkIn": "2025-11-15",
  "checkOut": "2025-11-20",
  "guests": 2,
  "totalPrice": "14688"
}
```

**Success Message:**
```
📅 Booking Created!
Your reservation is pending payment.
Booking ID: #12345
```

---

### **Step 1.5: Payment (Alga Pay)**

**Payment Methods:**
- ✅ Chapa (Cards, Mobile Money)
- ✅ Telebirr
- ✅ Stripe (International)
- ✅ PayPal

**Selected: Chapa**

**Actions:**
1. Click **"Pay with Chapa"**
2. Enter payment details
3. Complete 2FA verification
4. Payment processed

**API Call:**
```bash
POST /api/payment/chapa/initialize
{
  "bookingId": 12345,
  "amount": "14688",
  "currency": "ETB",
  "email": "ahmed.guest@alga.et",
  "phoneNumber": "+251922334455"
}
```

**Success:**
```
✅ Payment Successful!
Booking confirmed: #12345
Check-in code will be sent 24hrs before arrival.
```

**Commission Distribution:**
```
Property Owner:    11,562.50 ETB (92.5%)
Agent Commission:      625.00 ETB (5%)
Alga Platform:         312.50 ETB (2.5%)
```

---

### **Step 1.6: Receive Check-in Details**

**24 Hours Before Check-in:**

**SMS/WhatsApp Message:**
```
🏠 Alga Booking Reminder

Property: Cozy Studio in Bole
Check-in: Nov 15, 2025 at 3:00 PM
Address: Bole Atlas Road, Building 5A

🔑 Lockbox Code: 4782
Valid: Nov 15, 3:00 PM - Nov 20, 11:00 AM

Steps:
1. Find lockbox at main entrance
2. Enter code: 4782
3. Retrieve physical key
4. Unlock apartment
5. Enjoy your stay!

Emergency: +251-911-ALGA-HELP
```

**Lockbox PIN Generation (Backend):**
```bash
POST /api/lockbox/generate-code
{
  "bookingId": 12345,
  "propertyId": 1,
  "checkIn": "2025-11-15T15:00:00Z",
  "checkOut": "2025-11-20T11:00:00Z"
}

Response:
{
  "code": "4782",
  "validFrom": "2025-11-15T15:00:00Z",
  "validUntil": "2025-11-20T11:00:00Z",
  "lockboxId": "KB01-2024-12345"
}
```

---

### **Step 1.7: Check-In (Lockbox Entry)**

**Physical Steps:**
1. Arrive at property (Bole Atlas Road, Building 5A)
2. Locate smart lockbox at entrance
3. Enter 4-digit PIN: **4782**
4. Lockbox opens, retrieve physical key
5. Use key to unlock apartment door

**Backend Audit Log:**
```bash
POST /api/lockbox/audit
{
  "lockboxId": "KB01-2024-12345",
  "bookingId": 12345,
  "action": "unlock",
  "timestamp": "2025-11-15T15:23:00Z",
  "success": true
}
```

**Security Camera Snapshot:**
- Camera automatically captures photo at unlock
- Stored in audit trail for 30 days
- Host can review via dashboard

---

### **Step 1.8: During Stay**

**Guest Actions:**
1. Access WiFi password (in property info)
2. Use amenities (Kitchen, A/C)
3. Contact host if issues arise

**Safety Features:**
- Emergency contact button in app
- Location sharing with trusted contacts
- 24/7 Lemlem AI support

---

### **Step 1.9: Check-Out**

**Actions:**
1. Clean apartment (basic courtesy)
2. Lock apartment door
3. Return key to lockbox
4. Close lockbox securely

**Automatic Check-out:**
- Lockbox code expires at 11:00 AM
- System sends check-out confirmation
- Review request sent to guest

---

### **Step 1.10: Leave Review**

**Review Form:**
```
Property: Cozy Studio in Bole
Host: Dawit Tesfaye

Rating: ⭐⭐⭐⭐⭐ (5 stars)

Categories:
- Cleanliness: 5/5
- Location: 5/5
- Value: 5/5
- Communication: 5/5

Review Text:
"Perfect studio in Bole! Clean, modern, and exactly as described. 
Lockbox entry was seamless. Highly recommend!"

Would you stay again? ✅ Yes
```

**API Call:**
```bash
POST /api/reviews
{
  "bookingId": 12345,
  "propertyId": 1,
  "rating": 5,
  "cleanliness": 5,
  "location": 5,
  "value": 5,
  "communication": 5,
  "comment": "Perfect studio in Bole!..."
}
```

**Success:**
```
✅ Review Posted!
Thank you for your feedback!
```

---

## 🏠 **2. HOST JOURNEY**
**"From Listing to Earning - The Host Experience"**

### **Test Host Profile**
```
Name: Dawit Tesfaye
Email: dawit.host@alga.et
Phone: +251911223344
Fayda ID: 987654321098
Bank: Commercial Bank of Ethiopia
Account: 1000123456789
```

---

### **Step 2.1: Create Host Account**

**Actions:**
1. Sign in with phone: `+251911223344`
2. Verify OTP: `1234`
3. Complete profile

**API Call:**
```bash
POST /api/auth/register/phone
{
  "phoneNumber": "+251911223344",
  "fullName": "Dawit Tesfaye"
}
```

---

### **Step 2.2: Fayda ID Verification (Required for Hosts)**

**Actions:**
1. Go to **👤 Me** → **Profile**
2. Scroll to "Identity Verification"
3. Enter Fayda ID: `987654321098`
4. Date of Birth: `1988-03-20`

**API Call:**
```bash
POST /api/fayda/verify
{
  "faydaId": "987654321098",
  "dateOfBirth": "1988-03-20",
  "phoneNumber": "+251911223344"
}
```

**Success:**
```
✓ Fayda ID Verified!
You can now list properties on Alga.
```

---

### **Step 2.3: List New Property**

**Actions:**
1. Go to **Host Dashboard** (accessible via **👤 Me**)
2. Click **"+ Add Property"**

**Property Form:**
```
Basic Info:
- Title: Cozy Studio in Bole
- Type: Apartment
- City: Addis Ababa
- Sub-City: Bole
- Address: Bole Atlas Road, Building 5A

Pricing:
- Price per Night: 2,500 ETB
- Cleaning Fee: 200 ETB
- Security Deposit: 5,000 ETB

Capacity:
- Max Guests: 2
- Bedrooms: 1
- Bathrooms: 1
- Beds: 1 Queen Bed

Amenities:
✅ WiFi
✅ Kitchen
✅ Air Conditioning
✅ Parking
✅ TV
✅ Washing Machine

Description:
"Modern studio apartment in the heart of Bole. 
Walking distance to restaurants, cafes, and shopping. 
Perfect for business travelers!"

House Rules:
- No smoking
- No pets
- Quiet hours: 10 PM - 7 AM
```

**Upload Photos:**
- 5-10 high-quality images
- Max 10MB per image
- Cover photo selected

---

### **Step 2.4: Hardware Deployment (Mandatory)**

**Actions:**
1. Purchase hardware:
   - Smart Lockbox (LILIWISE KB01): ~2,000 ETB
   - Security Camera (Hikvision): ~3,500 ETB

2. Install hardware:
   - Mount lockbox at main entrance
   - Install camera with property view
   - Test functionality

3. Upload verification photos:
   - Lockbox installed (exterior view)
   - Camera installed (wide angle)
   - Both devices visible and secure

**Hardware Form:**
```
Smart Lockbox:
- Brand: LILIWISE KB01
- Serial Number: KB01-2024-12345
- Installation Photo: lockbox-installed.jpg

Security Camera:
- Brand: Hikvision DS-2CD1043G0-I
- Serial Number: CAM-2024-67890
- Installation Photo: camera-installed.jpg
```

**API Call:**
```bash
POST /api/hardware/deploy
{
  "propertyId": 1,
  "lockboxBrand": "LILIWISE KB01",
  "lockboxSerialNumber": "KB01-2024-12345",
  "cameraBrand": "Hikvision DS-2CD1043G0-I",
  "cameraSerialNumber": "CAM-2024-67890",
  "installationPhotos": [
    "/uploads/lockbox-1234.jpg",
    "/uploads/camera-5678.jpg"
  ]
}
```

---

### **Step 2.5: Submit for Approval**

**Actions:**
1. Review all property details
2. Click **"Submit for Verification"**

**Backend:**
```bash
POST /api/properties
{
  ...property details...,
  "verificationStatus": "pending"
}
```

**Success:**
```
🏠 Property Submitted!
Your property is pending operator verification.
We'll review it within 24 hours.
```

**Status:** ⏳ Pending Verification

---

### **Step 2.6: Await Operator Approval**

**Operator Reviews:**
- Property details completeness
- Photo quality
- Hardware installation (lockbox + camera)
- Fayda ID verification status
- Compliance with INSA security standards

**Possible Outcomes:**
1. ✅ **Approved** → Property goes live
2. ❌ **Rejected** → Reason provided, resubmit option
3. ⚠️ **Needs Changes** → Specific feedback given

---

### **Step 2.7: Property Approved!**

**Email/SMS Notification:**
```
✅ Property Approved!

Your property "Cozy Studio in Bole" is now live on Alga!

Next Steps:
1. Set your calendar availability
2. Respond to booking requests
3. Keep your lockbox code updated

View Property: https://alga.et/property/1
```

**Status:** ✅ Active

---

### **Step 2.8: Receive Booking Request**

**Notification (SMS/App):**
```
🔔 New Booking Request!

Guest: Ahmed Hassan
Property: Cozy Studio in Bole
Check-in: Nov 15, 2025
Check-out: Nov 20, 2025
Guests: 2 adults
Total: 14,688 ETB

You'll earn: 11,562.50 ETB

Accept or Decline?
```

**Actions:**
1. Review guest profile
2. Check calendar availability
3. Click **"Accept Booking"**

**API Call:**
```bash
POST /api/bookings/12345/accept
{
  "hostId": "dawit-uuid",
  "message": "Welcome! Looking forward to hosting you!"
}
```

---

### **Step 2.9: Manage Booking**

**Host Dashboard Shows:**
```
Upcoming Bookings:
┌────────────────────────────────────────┐
│ Booking #12345                         │
│ Guest: Ahmed Hassan                    │
│ Check-in: Nov 15, 2025                 │
│ Check-out: Nov 20, 2025                │
│ Status: ✅ Confirmed & Paid            │
│ Earnings: 11,562.50 ETB                │
│                                        │
│ 🔑 Access Code: 4782                   │
│ Valid: Nov 15-20                       │
└────────────────────────────────────────┘
```

**Host Actions:**
- Message guest
- Update house manual
- Monitor lockbox access logs
- Review camera footage (if needed)

---

### **Step 2.10: Receive Payout**

**Payout Schedule:**
- Funds released 24 hours after check-in
- Transferred to bank account
- Commission already deducted

**Payout Details:**
```
Booking #12345 Payout
─────────────────────────
Booking Total:    12,500 ETB
VAT Collected:     1,875 ETB
─────────────────────────
Gross Earnings:   11,562.50 ETB
Agent Commission:    625.00 ETB (5%)
Platform Fee:        312.50 ETB (2.5%)
─────────────────────────
Net Payout:       11,562.50 ETB

Bank: Commercial Bank of Ethiopia
Account: 1000123456789
Status: ✅ Transferred
Date: Nov 16, 2025
```

**API Call:**
```bash
POST /api/payouts
{
  "bookingId": 12345,
  "hostId": "dawit-uuid",
  "amount": "11562.50",
  "method": "bank_transfer"
}
```

---

## 💼 **3. AGENT JOURNEY**
**"From Sourcing to Earning - The Delala Agent Experience"**

### **Test Agent Profile**
```
Name: Meron Tadesse
Phone: +251911234567
TeleBirr: 0911234567
Fayda ID: 123456789012
City: Addis Ababa
Business: Meron Property Services
```

---

### **Step 3.1: Agent Registration**

**Actions:**
1. Click **💼 Agent Portal** → **"No Agent Account"**
2. Click **"Become an Agent"**
3. Fill registration form

**Form Data:**
```
Full Name: Meron Tadesse
Phone Number: +251911234567
TeleBirr Account: 0911234567
Business Name: Meron Property Services
City: Addis Ababa
Sub-City: Bole
```

**API Call:**
```bash
POST /api/agent/register
{
  "fullName": "Meron Tadesse",
  "phoneNumber": "+251911234567",
  "telebirrAccount": "0911234567",
  "businessName": "Meron Property Services",
  "city": "Addis Ababa",
  "subCity": "Bole"
}
```

**Success:**
```
🎉 Application Submitted!
Agent ID: #001
Referral Code: MERON-1234
Status: ⏳ Pending Verification
```

---

### **Step 3.2: Fayda ID Verification**

**Same as Host Journey** (Step 2.2)

---

### **Step 3.3: Source Properties**

**Agent Activities:**
1. Find property owners in Addis Ababa
2. Pitch Alga platform benefits
3. Help owners register
4. List properties on their behalf

**Properties Sourced:**
```
1. Cozy Studio in Bole (Owner: Dawit Tesfaye)
2. 2BR Apartment in Piassa (Owner: Sara Alemayehu)
3. Villa in CMC (Owner: Yohannes Bekele)
```

**Commission Link:**
- Agent ID automatically linked to properties
- 5% commission for 36 months from first booking
- Recurring passive income

---

### **Step 3.4: Access Agent Dashboard**

**Dashboard URL:** `/dellala/dashboard`

**Stats Displayed:**
```
┌─────────────────────────────────────────┐
│  💼 Agent Dashboard - Meron Tadesse     │
│  Status: ✅ Verified                    │
│  Referral Code: MERON-1234              │
├─────────────────────────────────────────┤
│  💰 Total Earnings: 1,875 ETB           │
│  ⏳ Pending: 625 ETB                    │
│  ✅ Paid: 1,250 ETB                     │
│  🏠 Properties Listed: 3                │
│  ✓ Active: 3                            │
│  📊 Total Bookings: 5                   │
└─────────────────────────────────────────┘
```

---

### **Step 3.5: Earn Commissions**

**Booking Example:**
```
Property: Cozy Studio in Bole
Booking Total: 12,500 ETB
Agent Commission (5%): 625 ETB
Status: ⏳ Pending (24hrs after check-in)
```

**Commission Table:**
```
┌──────────┬─────────────────┬───────────┬──────────┐
│ Booking  │ Property        │ Amount    │ Status   │
├──────────┼─────────────────┼───────────┼──────────┤
│ #12345   │ Studio in Bole  │ 625 ETB   │ Pending  │
│ #12344   │ Apt in Piassa   │ 750 ETB   │ Paid ✅  │
│ #12343   │ Villa in CMC    │ 500 ETB   │ Paid ✅  │
└──────────┴─────────────────┴───────────┴──────────┘
```

**36-Month Recurring:**
- Property listed: Nov 1, 2025
- Commission period: Nov 1, 2025 - Nov 1, 2028
- All bookings in this period earn 5%

---

### **Step 3.6: Request Withdrawal**

**Actions:**
1. Go to **"Withdraw"** tab
2. Enter amount: **1,250 ETB**
3. Confirm TeleBirr: **0911234567**
4. Click **"Request Withdrawal"**

**API Call:**
```bash
POST /api/dellala/withdraw
{
  "amount": "1250",
  "method": "telebirr",
  "accountNumber": "0911234567"
}
```

**Success:**
```
✅ Withdrawal Requested
Processing to TeleBirr: 0911234567
Expected: Within 24 hours
```

**TeleBirr Transfer:**
- Automatic API call to TeleBirr
- Funds deposited to 0911234567
- SMS confirmation sent

---

## 👨‍💼 **4. OPERATOR JOURNEY**
**"Quality Control & Issue Resolution"**

### **Test Operator Profile**
```
Name: Selamawit Gebre
Email: operator@alga.et
Phone: +251900112233
Role: Operator
Access: Property Verification, User Support
```

---

### **Step 4.1: Access Operator Dashboard**

**URL:** `/operator-dashboard`

**Dashboard Sections:**
```
┌────────────────────────────────────────┐
│  ⚙️ Operator Dashboard                 │
├────────────────────────────────────────┤
│  📋 Pending Verifications: 8           │
│  🏠 Properties: 5                      │
│  👥 Users: 3                           │
│  🎫 Support Tickets: 2                 │
│  📊 INSA Compliance: 75%               │
└────────────────────────────────────────┘
```

---

### **Step 4.2: Verify Property**

**Pending Property:**
```
Property: Cozy Studio in Bole
Host: Dawit Tesfaye
Status: ⏳ Pending Verification
Submitted: Nov 12, 2025
```

**Verification Checklist:**
```
✅ Host Fayda ID verified
✅ Property details complete
✅ 10 photos uploaded (high quality)
✅ Smart lockbox installed (photo verified)
✅ Security camera installed (photo verified)
✅ Address valid (Google Maps check)
✅ Pricing reasonable (2,500 ETB/night)
✅ No policy violations
```

**Actions:**
1. Click **"Review Property"**
2. View all photos and details
3. Check hardware installation photos
4. Verify lockbox serial number
5. Click **"Approve Property"**

**API Call:**
```bash
POST /api/operator/properties/1/approve
{
  "verifierId": "operator-uuid",
  "notes": "Hardware verified. Property approved."
}
```

**Success:**
```
✅ Property Approved!
"Cozy Studio in Bole" is now live.
Host notified via SMS/email.
```

---

### **Step 4.3: Handle Rejection (If Issues Found)**

**Example: Missing Hardware**

**Actions:**
1. Click **"Reject Property"**
2. Select reason: **"Hardware not installed"**
3. Add note: _"Please install smart lockbox and camera before resubmitting."_

**API Call:**
```bash
POST /api/operator/properties/1/reject
{
  "verifierId": "operator-uuid",
  "reason": "Hardware not installed",
  "notes": "Please install smart lockbox and camera."
}
```

**Host Notification:**
```
❌ Property Rejected

Reason: Hardware not installed
Note: Please install smart lockbox and camera before resubmitting.

Resubmit after installing hardware.
```

---

### **Step 4.4: Resolve Support Tickets**

**Ticket Example:**
```
Ticket #567
From: Ahmed Hassan (Guest)
Property: Cozy Studio in Bole
Issue: "Lockbox code not working"
Priority: 🔴 High
```

**Actions:**
1. Contact host (Dawit) via phone
2. Verify lockbox code generation
3. Regenerate code if needed
4. Send new code to guest
5. Mark ticket resolved

**API Call:**
```bash
POST /api/support/tickets/567/resolve
{
  "operatorId": "operator-uuid",
  "resolution": "Code regenerated and sent to guest",
  "status": "resolved"
}
```

---

### **Step 4.5: INSA Compliance Monitoring**

**Access:** `/insa-compliance`

**Compliance Status:**
```
┌────────────────────────────────────────┐
│  🛡️ INSA Security Compliance           │
├────────────────────────────────────────┤
│  Overall Status: 75% Complete          │
│  Security Score: 98/100                │
│                                        │
│  ✅ Completed (8/11):                  │
│  • E-Signature System                  │
│  • Security Hardening (8 protections)  │
│  • Audit Logging                       │
│  • Data Encryption                     │
│  • Access Control (RBAC)               │
│  • Fayda ID Integration                │
│  • ERCA Tax Compliance                 │
│  • Electronic Transactions Law         │
│                                        │
│  ❌ Missing (3/11):                    │
│  • System Architecture Diagram         │
│  • Data Flow Diagram (DFD)             │
│  • Trade License                       │
└────────────────────────────────────────┘
```

**Export Options:**
- 📄 Export as JSON
- 📊 Generate INSA Report (PDF)

---

### **Step 4.6: Offline Mode (PWA)**

**Scenario:** Operator inspects property without internet

**Actions:**
1. Open Alga app (PWA installed)
2. Go to `/insa-compliance` (works offline)
3. View cached compliance data
4. Export report to show inspector
5. Return online → Data auto-syncs

**Offline Features:**
- ✅ INSA compliance page cached (1 year)
- ✅ Property verification checklist
- ✅ Support ticket queue cached
- ✅ Operator dashboard cached

---

## 🔐 **5. ADMIN JOURNEY**
**"System Governance & Analytics"**

### **Test Admin Profile**
```
Name: Bethlehem Alemu
Email: admin@alga.et
Phone: +251900998877
Role: Admin
Access: Full System Control
```

---

### **Step 5.1: Access Admin Dashboard**

**URL:** `/admin/dashboard`

**Dashboard Overview:**
```
┌────────────────────────────────────────┐
│  🎛️ Admin Dashboard                    │
├────────────────────────────────────────┤
│  👥 Total Users: 1,247                 │
│  🏠 Properties: 156 (124 active)       │
│  📊 Bookings: 567 (42 this month)      │
│  💰 Revenue: 2,450,000 ETB             │
│  💼 Agents: 23 (18 active)             │
│  🛠️ Service Providers: 45             │
│  ⚙️ Operators: 5                       │
└────────────────────────────────────────┘
```

---

### **Step 5.2: User Management**

**Access:** `/admin/users`

**Actions:**
1. View all users (Guests, Hosts, Agents, Operators)
2. Filter by role, status, verification
3. Modify user roles
4. Suspend/Ban users
5. View activity logs

**Example: Promote User to Operator**
```
User: Selamawit Gebre
Current Role: Host
Action: Promote to Operator

Confirm: ✅ Yes
```

**API Call:**
```bash
POST /api/admin/users/update-role
{
  "userId": "selamawit-uuid",
  "newRole": "operator",
  "reason": "Promoted to operator team"
}
```

---

### **Step 5.3: Agent Governance**

**Access:** `/admin/agents`

**Agent Table:**
```
┌─────┬──────────────────┬────────────┬──────────┬─────────┐
│ ID  │ Name             │ Properties │ Earnings │ Status  │
├─────┼──────────────────┼────────────┼──────────┼─────────┤
│ 001 │ Meron Tadesse    │ 3          │ 1,875    │ Active  │
│ 002 │ Yared Bekele     │ 7          │ 4,200    │ Active  │
│ 003 │ Tigist Hailu     │ 2          │ 950      │ Pending │
└─────┴──────────────────┴────────────┴──────────┴─────────┘
```

**Admin Actions:**
- Approve pending agents
- Suspend fraudulent agents
- Adjust commission rates (special cases)
- Export agent performance report (CSV)

---

### **Step 5.4: Security & Compliance**

**Access:** `/admin/signatures` (E-Signature Dashboard)

**Features:**
```
┌────────────────────────────────────────┐
│  🔏 Electronic Signature Dashboard     │
├────────────────────────────────────────┤
│  Total Signatures: 2,456               │
│  Today: 23                             │
│  Verified Sessions: 89%                │
│                                        │
│  Advanced Filters:                     │
│  • User ID                             │
│  • Action Type                         │
│  • Date Range                          │
│  • Verification Status                 │
│                                        │
│  Actions:                              │
│  • View Audit Trail                    │
│  • Decrypt IP Address                  │
│  • Verify SHA-256 Hash                 │
│  • Export Report (CSV/PDF/JSON)        │
└────────────────────────────────────────┘
```

**Compliance Reports:**
- INSA Inspection Report (PDF)
- ERCA Tax Compliance
- Data Protection Audit
- Electronic Signature Logs

---

### **Step 5.5: Analytics & Reports**

**Access:** `/admin/analytics`

**Charts & Metrics:**
```
📊 Booking Trends (Last 30 Days)
───────────────────────────────
Week 1: 42 bookings
Week 2: 58 bookings
Week 3: 67 bookings
Week 4: 78 bookings
Growth: +85% month-over-month

💰 Revenue Breakdown
───────────────────────────────
Bookings:        2,100,000 ETB
Service Fees:      105,000 ETB
Agent Commissions: 245,000 ETB

🏙️ Top Cities
───────────────────────────────
1. Addis Ababa: 234 properties
2. Bahir Dar: 45 properties
3. Gondar: 32 properties
```

**Export Options:**
- CSV, Excel, PDF
- Automated weekly reports
- Shareable dashboards

---

### **Step 5.6: Platform Settings**

**Access:** `/admin/settings`

**Configurable:**
```
Commission Rates:
- Platform Fee: 2.5%
- Agent Commission: 5%
- VAT Rate: 15%

Payment Settings:
- Chapa API Key: ••••••••
- Stripe API Key: ••••••••
- Telebirr Merchant ID: ••••••••

Security:
- Max Login Attempts: 5
- Session Timeout: 30 minutes
- 2FA Required: ✅ Enabled

Hardware:
- Lockbox Vendors: TTLock, LILIWISE
- Camera Brands: Hikvision, Dahua
```

---

## 🛠️ **6. SERVICE PROVIDER JOURNEY**
**"Apply, Get Jobs, Earn Money"**

### **Test Service Provider Profile**
```
Name: Amanuel Tesfaye
Phone: +251933445566
Service Category: Cleaning
Experience: 5 years
City: Addis Ababa
```

---

### **Step 6.1: Browse Service Categories**

**URL:** `/services`

**Categories Available:**
```
🧹 Cleaning & Housekeeping
🍳 Meal Delivery
🚗 Airport Transfer
🏛️ City Tours & Guides
📸 Photography
💆 Spa & Wellness
🔧 Maintenance & Repairs
🌍 Language Translation
🎉 Event Planning
🚕 Car Rental
🏔️ Adventure Activities
```

---

### **Step 6.2: Apply as Service Provider**

**Actions:**
1. Click **"Become a Provider"** button
2. Fill application form

**Form Data:**
```
Full Name: Amanuel Tesfaye
Phone: +251933445566
Service Category: Cleaning & Housekeeping
Experience: 5 years
City: Addis Ababa
Service Area: Bole, Piassa, CMC
Pricing: 500 ETB/hour
Portfolio: Upload 3 photos of past work
Certifications: Hospitality Training Certificate
```

**API Call:**
```bash
POST /api/service-providers/apply
{
  "fullName": "Amanuel Tesfaye",
  "phoneNumber": "+251933445566",
  "category": "cleaning",
  "experience": "5 years",
  "city": "Addis Ababa",
  "pricing": "500",
  "portfolio": ["/uploads/work1.jpg", "/uploads/work2.jpg"]
}
```

**Success:**
```
✅ Application Submitted!
We'll review your application within 48 hours.
```

---

### **Step 6.3: Get Approved**

**Operator Review:**
- Verify credentials
- Check portfolio photos
- Contact for interview (if needed)
- Approve or reject

**Approval Email:**
```
✅ Application Approved!

You're now a verified service provider on Alga!

Next Steps:
1. Complete your profile
2. Set your availability
3. Start receiving job requests

Login: https://alga.et/provider-dashboard
```

---

### **Step 6.4: Receive Job Request**

**Job Notification:**
```
🔔 New Job Request!

Service: Apartment Cleaning
Property: Cozy Studio in Bole
Date: Nov 21, 2025 (after guest check-out)
Duration: 2 hours
Pay: 1,000 ETB
Client: Dawit Tesfaye (Host)

Accept or Decline?
```

**Actions:**
1. Review job details
2. Check availability
3. Click **"Accept Job"**

---

### **Step 6.5: Complete Job**

**Steps:**
1. Arrive at property on time
2. Perform cleaning service
3. Take before/after photos
4. Click **"Mark as Complete"**

**API Call:**
```bash
POST /api/service-bookings/789/complete
{
  "providerId": "amanuel-uuid",
  "completionPhotos": ["/uploads/after-clean.jpg"],
  "notes": "Deep cleaned apartment, replaced linens"
}
```

---

### **Step 6.6: Get Paid**

**Payment Flow:**
```
Job Completed → Client Confirms → Payment Released

Job: Apartment Cleaning
Amount: 1,000 ETB
Platform Fee (10%): 100 ETB
Net Payout: 900 ETB

Paid to: TeleBirr 0933445566
Status: ✅ Transferred
```

---

## 📴 **7. OFFLINE MODE SIMULATION**
**"All Roles Work Without Internet"**

### **Offline Capabilities (PWA)**

---

### **Guest Offline:**
```
✅ View saved properties
✅ Access booking details
✅ View lockbox codes (cached)
✅ Contact emergency numbers
✅ View property map (cached)
❌ Cannot book new properties
❌ Cannot make payments
```

---

### **Host Offline:**
```
✅ View upcoming bookings
✅ Access guest contact info
✅ Generate lockbox codes (cached logic)
✅ View property calendar
❌ Cannot edit property details
❌ Cannot approve new bookings
```

---

### **Agent Offline:**
```
✅ View commission history
✅ Access dashboard stats (cached)
✅ View property portfolio
❌ Cannot request withdrawals
❌ Cannot add new properties
```

---

### **Operator Offline:**
```
✅ View INSA compliance page (1-year cache)
✅ Access verification checklist
✅ Export compliance report (PDF)
✅ View property queue (cached)
❌ Cannot approve properties
❌ Cannot resolve tickets
```

---

### **Offline Sync Flow:**

**Scenario:** Operator verifies property offline

1. **Offline:** Operator checks property hardware photos
2. **Offline:** Clicks "Approve" → Saved to IndexedDB queue
3. **Online:** App detects internet → Auto-syncs approval
4. **Backend:** Property status updated → Host notified

**Auto-Sync Queue:**
```
Pending Actions (IndexedDB):
1. Approve Property #12 (waiting to sync)
2. Resolve Ticket #567 (waiting to sync)
3. Update Agent Status (waiting to sync)

Status: 🔄 Syncing...
✅ All actions synced!
```

---

## 🔐 **8. HARDWARE INTEGRATION**
**"Smart Lockbox & Security Camera"**

### **Lockbox Flow (TTLock API)**

---

### **Step 8.1: Property Owner Pairs Lockbox**

**Actions:**
1. Purchase LILIWISE KB01 lockbox
2. Install at property entrance
3. Pair via TTLock app
4. Enter lockbox serial in Alga: `KB01-2024-12345`

**Backend Registration:**
```bash
POST /api/lockbox/register
{
  "propertyId": 1,
  "brand": "LILIWISE KB01",
  "serialNumber": "KB01-2024-12345",
  "apiAccessToken": "ttlock-api-token-here"
}
```

---

### **Step 8.2: Generate Access Code (Booking)**

**Trigger:** Guest completes payment

**Backend API Call:**
```bash
POST /api/lockbox/generate-code
{
  "bookingId": 12345,
  "propertyId": 1,
  "lockboxSerial": "KB01-2024-12345",
  "checkIn": "2025-11-15T15:00:00Z",
  "checkOut": "2025-11-20T11:00:00Z"
}

TTLock API Request:
POST https://api.ttlock.com/v3/keyboardPwd/add
{
  "lockId": "12345",
  "keyboardPwd": "4782",
  "startDate": 1700060400000,
  "endDate": 1700492400000
}

Response:
{
  "keyboardPwdId": 67890,
  "keyboardPwd": "4782"
}
```

**Code Sent to Guest:**
```
🔑 Your Access Code: 4782
Valid: Nov 15, 3:00 PM - Nov 20, 11:00 AM
```

---

### **Step 8.3: Guest Unlocks Lockbox**

**Physical Actions:**
1. Arrive at property
2. Enter code on lockbox keypad: `4782`
3. Lockbox opens
4. Retrieve physical key

**Backend Audit Log:**
```bash
Webhook from TTLock:
POST /api/lockbox/webhook
{
  "lockId": "12345",
  "action": "unlock",
  "keyboardPwd": "4782",
  "timestamp": 1700060450000,
  "success": true
}

Alga Logs:
{
  "bookingId": 12345,
  "lockboxId": "KB01-2024-12345",
  "action": "unlock",
  "timestamp": "2025-11-15T15:07:30Z",
  "guestId": "ahmed-uuid",
  "success": true,
  "ipAddress": "encrypted",
  "deviceInfo": "encrypted"
}
```

---

### **Step 8.4: Security Camera Snapshot**

**Trigger:** Lockbox unlocked

**Backend:**
```bash
POST /api/camera/capture
{
  "propertyId": 1,
  "cameraSerial": "CAM-2024-67890",
  "trigger": "lockbox_unlock",
  "timestamp": "2025-11-15T15:07:30Z"
}

Camera API Request:
POST https://api.hikvision.com/snapshot
{
  "cameraId": "CAM-2024-67890",
  "resolution": "1080p"
}

Response:
{
  "imageUrl": "https://storage.alga.et/snapshots/12345-1700060450.jpg",
  "timestamp": "2025-11-15T15:07:30Z"
}
```

**Storage:**
- Photo stored in Google Cloud Storage
- Accessible by host for 30 days
- Auto-deleted after retention period

---

### **Step 8.5: Lockbox Audit Trail**

**Host Dashboard:**
```
🔐 Lockbox Access History

Property: Cozy Studio in Bole

┌──────────────┬───────────────┬─────────┬────────┐
│ Date/Time    │ Guest         │ Code    │ Status │
├──────────────┼───────────────┼─────────┼────────┤
│ Nov 15 15:07 │ Ahmed Hassan  │ 4782    │ ✅ OK  │
│ Nov 16 08:23 │ Ahmed Hassan  │ 4782    │ ✅ OK  │
│ Nov 17 19:45 │ Ahmed Hassan  │ 4782    │ ✅ OK  │
│ Nov 20 10:58 │ Ahmed Hassan  │ 4782    │ ✅ OK  │
└──────────────┴───────────────┴─────────┴────────┘

No unauthorized attempts detected ✅
```

---

## 🎬 **9. FULL END-TO-END SCENARIO**
**"Complete Lifecycle: Agent → Operator → Guest → Host → Payouts → Commissions"**

### **Cast of Characters:**
```
👨‍💼 Agent: Meron Tadesse (sources properties)
🏠 Host: Dawit Tesfaye (property owner)
👤 Guest: Ahmed Hassan (books stay)
⚙️ Operator: Selamawit Gebre (approves property)
👨‍💼 Admin: Bethlehem Alemu (oversees platform)
🧹 Service Provider: Amanuel Tesfaye (cleans property)
```

---

### **Timeline:**

**Day 1: Nov 1, 2025**
1. **Meron (Agent)** finds Dawit's property
2. **Meron** helps Dawit register as host
3. **Dawit (Host)** creates account, verifies Fayda ID
4. **Dawit** lists "Cozy Studio in Bole" (2,500 ETB/night)
5. **Dawit** installs lockbox + camera, uploads photos
6. **Dawit** submits property for verification

**Day 2: Nov 2, 2025**
7. **Selamawit (Operator)** reviews property
8. **Selamawit** verifies hardware photos
9. **Selamawit** approves property ✅
10. **Property goes live** on Alga

**Day 10: Nov 10, 2025**
11. **Ahmed (Guest)** searches Addis Ababa properties
12. **Ahmed** finds "Cozy Studio in Bole"
13. **Ahmed** creates account via phone OTP
14. **Ahmed** books Nov 15-20 (5 nights)
15. **Ahmed** pays 14,688 ETB via Chapa

**Day 11: Nov 11, 2025**
16. **Dawit** accepts booking
17. **Backend** generates lockbox code: **4782**
18. **Backend** links code to booking
19. **Meron's** commission recorded: **625 ETB** (pending)

**Day 14: Nov 14, 2025**
20. **Ahmed** receives SMS with lockbox code
21. **Ahmed** reviews check-in instructions

**Day 15: Nov 15, 2025 (Check-in)**
22. **Ahmed** arrives at property
23. **Ahmed** enters code **4782** on lockbox
24. **Lockbox** unlocks, Ahmed retrieves key
25. **Camera** captures snapshot
26. **Audit log** records successful entry
27. **Dawit** notified: "Guest checked in"

**Day 16: Nov 16, 2025**
28. **Backend** releases payout to Dawit: **11,562.50 ETB**
29. **Meron's** commission status: **625 ETB (paid)** ✅

**Day 17-19: Nov 17-19, 2025 (During Stay)**
30. **Ahmed** enjoys stay
31. **Dawit** monitors via dashboard
32. **No issues** reported

**Day 20: Nov 20, 2025 (Check-out)**
33. **Ahmed** checks out at 11:00 AM
34. **Lockbox code** expires automatically
35. **Ahmed** leaves 5-star review
36. **Dawit** schedules cleaning

**Day 21: Nov 21, 2025 (Cleaning)**
37. **Dawit** requests cleaning service
38. **Amanuel (Service Provider)** accepts job
39. **Amanuel** cleans property (1,000 ETB)
40. **Amanuel** receives payout: **900 ETB**

**Day 30: Nov 30, 2025**
41. **Meron** requests withdrawal: **625 ETB**
42. **Backend** transfers to TeleBirr
43. **Meron** receives funds ✅

---

### **Final Financial Summary:**

```
┌─────────────────────────────────────────┐
│  💰 BOOKING #12345 FINANCIAL BREAKDOWN  │
├─────────────────────────────────────────┤
│  Guest Paid:           14,688 ETB       │
│  ├─ Booking Subtotal:  12,500 ETB       │
│  ├─ VAT (15%):          1,875 ETB       │
│  └─ Platform Fee:         313 ETB       │
│                                         │
│  Distribution:                          │
│  ├─ Host (Dawit):      11,563 ETB ✅    │
│  ├─ Agent (Meron):        625 ETB ✅    │
│  └─ Alga Platform:        313 ETB ✅    │
│                                         │
│  Additional Services:                   │
│  └─ Cleaning (Amanuel):   900 ETB ✅    │
│                                         │
│  Total Platform Revenue:  313 ETB       │
│  Agent Commission (36mo): Active        │
└─────────────────────────────────────────┘
```

---

## ✅ **SUCCESS CRITERIA**

### **Complete Journey Checklist:**

**✅ Guest Journey:**
- [x] Account created via phone OTP
- [x] Property searched and booked
- [x] Payment completed (Chapa)
- [x] Lockbox code received
- [x] Check-in successful
- [x] Stay completed
- [x] Review posted

**✅ Host Journey:**
- [x] Fayda ID verified
- [x] Property listed with hardware
- [x] Operator approved property
- [x] Booking received and accepted
- [x] Payout received (11,563 ETB)

**✅ Agent Journey:**
- [x] Agent registered with TeleBirr
- [x] Property sourced and linked
- [x] Commission earned (625 ETB)
- [x] Withdrawal successful

**✅ Operator Journey:**
- [x] Property verified
- [x] Hardware installation confirmed
- [x] INSA compliance accessed offline
- [x] Support tickets resolved

**✅ Admin Journey:**
- [x] System analytics reviewed
- [x] E-signature audit trail checked
- [x] User roles managed
- [x] Compliance reports exported

**✅ Service Provider Journey:**
- [x] Applied and approved
- [x] Job received and completed
- [x] Payment received (900 ETB)

**✅ Offline Mode:**
- [x] INSA page works offline (1-year cache)
- [x] Bookings cached for guests
- [x] Dashboard stats available offline
- [x] Auto-sync on reconnection

**✅ Hardware Integration:**
- [x] Lockbox code generated (4782)
- [x] Guest unlocked successfully
- [x] Audit trail logged
- [x] Camera snapshot captured

**✅ End-to-End:**
- [x] Complete lifecycle executed
- [x] All roles coordinated
- [x] Payments distributed correctly
- [x] 36-month commission active

---

## 🚀 **NEXT STEPS**

1. **Run Automated Test:** `npx tsx scripts/test-agent-journey.ts`
2. **Manual Testing:** Follow this guide step-by-step
3. **Mobile App:** Rebuild Android/iOS with latest code
4. **Production:** Deploy to Replit hosting
5. **INSA Inspection:** Submit compliance documentation

---

**🎉 Alga is ready for launch!**

**Documentation Created By:** Replit Agent  
**Women-Run Company:** Alga One Member PLC  
**TIN:** 0101809194
