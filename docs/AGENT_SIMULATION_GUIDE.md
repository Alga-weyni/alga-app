# 🎭 Alga Agent Journey Simulation
**Complete Step-by-Step Guide: From Registration to First Property Upload**

---

## 📋 **Overview**
This simulation demonstrates the complete journey of a Delala Agent using Alga's platform with Fayda ID verification.

**Agent Profile (Test Character):**
- **Name**: Meron Tadesse
- **Phone**: +251911234567
- **TeleBirr Account**: 0911234567
- **Fayda ID**: 123456789012 (12 digits)
- **Date of Birth**: 1995-05-15
- **City**: Addis Ababa
- **Sub-City**: Bole

---

## 🚀 **Phase 1: Agent Registration**

### **Step 1.1: Navigate to Registration Page**
1. Open Alga web app
2. Click **💼 Agent Portal** in the navigation bar
3. You'll see "❌ No Agent Account" message
4. Click **"💼 Become an Agent"** button

**Alternatively:** Go directly to `/become-agent`

### **Step 1.2: Complete Registration Form**

Fill in the following test data:

```
Full Name: Meron Tadesse
Phone Number: +251911234567
TeleBirr Account: 0911234567
ID Number: (leave blank - will verify with Fayda)
Business Name: Meron Property Services
City: Addis Ababa
Sub-City: Bole
```

**Backend API Call:**
```bash
POST /api/agent/register
Content-Type: application/json

{
  "fullName": "Meron Tadesse",
  "phoneNumber": "+251911234567",
  "telebirrAccount": "0911234567",
  "businessName": "Meron Property Services",
  "city": "Addis Ababa",
  "subCity": "Bole"
}
```

**Expected Response:**
```json
{
  "message": "Agent registration successful",
  "agent": {
    "id": 1,
    "userId": "user-uuid-here",
    "fullName": "Meron Tadesse",
    "status": "pending",
    "referralCode": "MERON-1234"
  }
}
```

**Success Toast:**
```
🎉 Application Submitted!
Your agent application is under review. We'll notify you once verified.
```

### **Step 1.3: Automatic Redirect**
- After 2 seconds, you'll be redirected to `/agent-dashboard`
- Status will show: **⏳ Pending** (awaiting operator verification)

---

## 🔐 **Phase 2: Fayda ID Verification**

### **Step 2.1: Access Profile/Verification Page**
1. Click **👤 Me** in navigation
2. Scroll to "Identity Verification" section
3. Or directly access `/profile`

### **Step 2.2: Enter Fayda ID Details**

**Form Data:**
```
Fayda ID: 123456789012 (exactly 12 digits)
Date of Birth: 1995-05-15
```

**Backend API Call:**
```bash
POST /api/fayda/verify
Content-Type: application/json
Authorization: Session Cookie

{
  "faydaId": "123456789012",
  "dateOfBirth": "1995-05-15",
  "phoneNumber": "+251911234567"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Fayda ID verified successfully",
  "identity": {
    "fullName": "Meron Tadesse",
    "dateOfBirth": "1995-05-15",
    "phoneNumber": "+251911234567"
  }
}
```

**Success Toast:**
```
✓ Verification Successful
Your Fayda ID has been verified successfully!
```

### **Step 2.3: Verification Status**
- Green badge appears: **✅ Fayda ID Verified**
- User profile updated with:
  - `faydaId`: "123456789012"
  - `faydaVerified`: true
  - `faydaVerifiedAt`: "2025-11-12T12:00:00Z"

---

## 🏠 **Phase 3: Property Upload**

### **Step 3.1: Navigate to Property Upload**
1. Go to **👤 Me** → **My Dashboard**
2. If you're a host: Click **"List New Property"**
3. Or go directly to `/host-dashboard` → **"+ Add Property"**

### **Step 3.2: Complete Property Form**

**Basic Information:**
```
Title: Cozy Studio in Bole
Type: Apartment
City: Addis Ababa
Address: Bole Atlas Road, Building 5A
Price per Night: 2500 ETB
Max Guests: 2
Bedrooms: 1
Bathrooms: 1
```

**Description:**
```
Modern studio apartment in the heart of Bole. 
Walking distance to restaurants, cafes, and shopping centers. 
Perfect for business travelers and tourists.
```

**Amenities:**
- ✅ WiFi
- ✅ Kitchen
- ✅ Air Conditioning
- ✅ Parking

**Property Images:**
- Upload 5-10 high-quality photos
- File size: < 10MB each
- Formats: JPEG, PNG, WebP

**Hardware Verification (Mandatory):**
```
Smart Lockbox:
- Brand: LILIWISE KB01
- Serial Number: KB01-2024-12345
- Photo Upload: lockbox-installed.jpg

Security Camera:
- Brand: Hikvision
- Model: DS-2CD1043G0-I
- Photo Upload: camera-installed.jpg
```

### **Step 3.3: Submit Property**

**Backend API Call:**
```bash
POST /api/properties
Content-Type: application/json
Authorization: Session Cookie

{
  "title": "Cozy Studio in Bole",
  "type": "apartment",
  "city": "Addis Ababa",
  "address": "Bole Atlas Road, Building 5A",
  "pricePerNight": "2500",
  "maxGuests": 2,
  "bedrooms": 1,
  "bathrooms": 1,
  "description": "Modern studio apartment...",
  "amenities": ["WiFi", "Kitchen", "Air Conditioning", "Parking"],
  "images": ["url1", "url2", "url3"],
  "lockboxSerialNumber": "KB01-2024-12345",
  "cameraSerialNumber": "DS-2CD1043G0-I",
  "agentId": 1  // Automatically linked to Meron's agent account
}
```

**Expected Response:**
```json
{
  "id": 1,
  "title": "Cozy Studio in Bole",
  "status": "pending_verification",
  "verificationStatus": "pending",
  "hostId": "user-uuid-here",
  "agentId": 1,
  "createdAt": "2025-11-12T12:00:00Z"
}
```

**Success Toast:**
```
🏠 Property Submitted!
Your property is pending operator verification. 
We'll review the hardware photos and approve it soon.
```

---

## 💼 **Phase 4: Access Agent Dashboard**

### **Step 4.1: Navigate to Dashboard**
1. Click **💼 Agent Portal** in navigation
2. Or go to `/dellala/dashboard`

### **Step 4.2: Dashboard Overview**

**Stats Displayed:**
```
┌─────────────────────────────────────────┐
│  💼 Agent Dashboard - Meron Tadesse     │
│  📱 +251911234567                       │
│  Status: ✅ Verified                    │
├─────────────────────────────────────────┤
│  💰 Total Earnings: 0 ETB               │
│  ⏳ Pending: 0 ETB                      │
│  ✅ Paid: 0 ETB                         │
│  🏠 Properties Listed: 1                │
│  ✓ Active: 0 (pending verification)    │
│  ⏰ Expired: 0                          │
└─────────────────────────────────────────┘
```

**Referral Code:**
```
Your Referral Code: MERON-1234
Share this code to invite other agents and earn bonuses!
```

**Recent Activity:**
```
┌────────────────────────────────────────┐
│  📋 Recent Commissions                 │
├────────────────────────────────────────┤
│  (empty - no bookings yet)             │
└────────────────────────────────────────┘
```

### **Step 4.3: Property Status**
- Go to **"My Properties"** tab
- See property: **"Cozy Studio in Bole"**
- Status: **⏳ Pending Verification**
- Message: _"Awaiting operator approval for hardware verification"_

---

## ✅ **Phase 5: Operator Approval (Admin Action)**

### **Step 5.1: Operator Logs In**
1. Admin/Operator logs in at `/operator-dashboard`
2. Navigates to **"Property Verification"** section

### **Step 5.2: Review Property**

**Verification Checklist:**
- ✅ Smart Lockbox installed (photo verified)
- ✅ Security Camera installed (photo verified)
- ✅ Property details complete
- ✅ Agent verified with Fayda ID

**Operator Action:**
```bash
POST /api/operator/properties/1/approve
Authorization: Operator Session

{
  "verifierId": "operator-uuid"
}
```

**Success:**
```
Property "Cozy Studio in Bole" approved!
Status changed: pending → approved
Now visible to guests on /properties
```

---

## 💰 **Phase 6: Commission Earning Flow**

### **Step 6.1: Guest Books Property**

**Booking Details:**
```
Property: Cozy Studio in Bole
Guest: Ahmed Hassan
Check-in: 2025-11-15
Check-out: 2025-11-20
Nights: 5
Total: 12,500 ETB (5 nights × 2,500 ETB)
```

**Payment Breakdown:**
```
Subtotal:           12,500 ETB
VAT (15%):           1,875 ETB
Alga Fee (2.5%):       312.50 ETB
Agent Commission (5%): 625 ETB
Property Owner:     11,562.50 ETB
──────────────────────────────
Total Paid:         14,687.50 ETB
```

### **Step 6.2: Commission Recorded**

**Backend Creates Commission Record:**
```sql
INSERT INTO agent_commissions (
  agent_id, booking_id, property_id,
  booking_total, commission_amount, commission_rate,
  status, created_at
) VALUES (
  1, 1, 1,
  '12500', '625', '0.05',
  'pending', NOW()
);
```

### **Step 6.3: Agent Dashboard Updates**

**Updated Stats:**
```
💰 Total Earnings: 625 ETB
⏳ Pending: 625 ETB
✅ Paid: 0 ETB
🏠 Properties Listed: 1
✓ Active: 1
```

**Commission History:**
```
┌────────────────────────────────────────┐
│  📋 Recent Commissions                 │
├────────────────────────────────────────┤
│  Booking #1 - Cozy Studio in Bole      │
│  Guest: Ahmed Hassan                   │
│  Amount: 625 ETB (5%)                  │
│  Status: ⏳ Pending Payment            │
│  Date: Nov 15, 2025                    │
└────────────────────────────────────────┘
```

### **Step 6.4: Request Withdrawal**

**Agent Actions:**
1. Go to **"Withdraw"** tab
2. Enter withdrawal amount: **625 ETB**
3. Confirm TeleBirr account: **0911234567**
4. Click **"Request Withdrawal"**

**Backend API:**
```bash
POST /api/dellala/withdraw
Content-Type: application/json

{
  "amount": "625",
  "method": "telebirr",
  "accountNumber": "0911234567"
}
```

**Success:**
```
✅ Withdrawal Requested
Your withdrawal is being processed. 
You'll receive the funds within 24 hours.
```

---

## 🎯 **Key Features Demonstrated**

1. ✅ **Agent Registration** with TeleBirr account
2. ✅ **Fayda ID Verification** (eKYC compliance)
3. ✅ **Property Upload** with hardware requirements
4. ✅ **Operator Verification** workflow
5. ✅ **Commission Tracking** (5% for 36 months)
6. ✅ **Withdrawal System** (TeleBirr payouts)
7. ✅ **Referral System** (unique agent codes)

---

## 🧪 **Testing URLs**

```
Agent Registration:     /become-agent
Agent Dashboard:        /dellala/dashboard
Fayda Verification:     /profile (scroll to verification)
Property Upload:        /host-dashboard → Add Property
Operator Dashboard:     /operator-dashboard
```

---

## 📊 **Database Records Created**

1. **users** table: User with Fayda verification
2. **agents** table: Agent profile with referral code
3. **properties** table: Property linked to agent
4. **hardware_deployments** table: Lockbox + camera records
5. **bookings** table: Guest booking record
6. **agent_commissions** table: Commission calculation
7. **agent_withdrawals** table: Payout request

---

## 🔒 **Security & Compliance**

- ✅ **INSA Compliant**: Fayda ID integration
- ✅ **Electronic Signature**: All transactions logged
- ✅ **Encrypted Data**: IP addresses, device info
- ✅ **Audit Trail**: Complete commission history
- ✅ **Hardware Verification**: Mandatory lockbox + camera

---

## 🎉 **Success Criteria**

Agent simulation is complete when:
- ✅ Agent registered and verified
- ✅ Fayda ID linked to profile
- ✅ Property uploaded with hardware
- ✅ Operator approved property
- ✅ Commission earned on booking
- ✅ Withdrawal requested successfully

---

**Next Steps:** 
- Test on live environment
- Verify mobile app integration
- Check TeleBirr API sandbox
- Run end-to-end payment flow
