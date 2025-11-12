# 🚀 Alga - Quick Start Testing Guide

## 📋 **5-Minute Quick Test**

### **Option 1: Automated Test Script** (Recommended)
```bash
# Make sure server is running
npm run dev

# In another terminal, run simulation
npx tsx scripts/test-agent-journey.ts
```

**What it does:**
- ✅ Registers test agent (Meron Tadesse)
- ✅ Verifies Fayda ID
- ✅ Creates property listing
- ✅ Generates commission
- ✅ Shows dashboard stats

---

### **Option 2: Manual Web Testing**

#### **Test 1: Guest Booking (2 minutes)**
```
1. Go to /properties
2. Click any property
3. Click "Book Now"
4. Sign in: +251922334455, OTP: 1234
5. Complete booking
6. See confirmation
```

#### **Test 2: Agent Portal (1 minute)**
```
1. Click 💼 Agent Portal
2. Click "Become an Agent"
3. Fill form with test data
4. Submit application
5. View dashboard
```

#### **Test 3: Operator Verification (1 minute)**
```
1. Login as operator: operator@alga.et
2. Go to /operator-dashboard
3. View pending properties
4. Click "Approve"
5. Property goes live
```

---

## 🎯 **Test Credentials**

### **Guest**
```
Phone: +251922334455
OTP: 1234
Name: Ahmed Hassan
```

### **Host**
```
Phone: +251911223344
OTP: 1234
Name: Dawit Tesfaye
Fayda ID: 987654321098
```

### **Agent**
```
Phone: +251911234567
OTP: 1234
Name: Meron Tadesse
Fayda ID: 123456789012
TeleBirr: 0911234567
```

### **Operator**
```
Email: operator@alga.et
Password: Operator@1234
(or use existing test-admin@alga.et)
```

---

## 📚 **Complete Documentation**

- **Full Journey Guide**: `docs/COMPLETE_USER_JOURNEY_SIMULATION.md` (9 journeys)
- **Agent Journey**: `docs/AGENT_SIMULATION_GUIDE.md` (detailed)
- **Test Script**: `scripts/test-agent-journey.ts` (automated)

---

## 🔍 **What to Test**

### **Core Features:**
- ✅ Property search and filtering
- ✅ Booking flow and payment
- ✅ Lockbox code generation
- ✅ Commission calculation
- ✅ Operator approvals
- ✅ Fayda ID verification

### **Offline Mode (PWA):**
- ✅ INSA compliance page (works offline)
- ✅ Cached dashboard stats
- ✅ Auto-sync when online

### **Mobile App:**
- ✅ Rebuild: `npm run build && npx cap sync android`
- ✅ Install APK on phone
- ✅ Test lockbox codes
- ✅ Offline property viewing

---

## ✅ **Success Criteria**

**Journey Complete When:**
- [x] Guest can book and pay
- [x] Host receives payout
- [x] Agent earns commission
- [x] Operator approves properties
- [x] Hardware integration works
- [x] Offline mode functional

---

## 🐛 **Troubleshooting**

**Issue:** Mobile app shows 0 properties
**Fix:** Rebuild app: `npm run build && npx cap sync android`

**Issue:** OTP not working
**Fix:** Use default test OTP: `1234`

**Issue:** Lockbox code not generating
**Fix:** Check TTLock API credentials in backend

**Issue:** Payment failing
**Fix:** Use Chapa test mode credentials

---

## 📞 **Support**

- **Documentation**: All guides in `docs/` folder
- **Test Scripts**: `scripts/` folder
- **Test Accounts**: See credentials above

---

**Ready to test!** 🎉
