# 📱 ALGA - COMPREHENSIVE MANUAL TESTING SCRIPT

**Purpose**: Validate all user journeys before production deployment  
**Estimated Time**: 2-3 hours  
**Required**: Phone number for OTP, payment test cards

---

## 🎯 TESTING PHILOSOPHY

This script validates the **5 critical user personas**:
1. 👥 **Guest** - Books accommodation
2. 🏠 **Host** - Lists properties
3. 🛡️ **Admin** - Manages platform
4. 🔧 **Service Provider** - Offers services
5. 🛡️ **Operator** - Verifies identities

---

## 🔐 TEST ACCOUNTS

Use these pre-created accounts for testing:

| Role | Login Credential | Notes |
|------|------------------|-------|
| **Guest** | +251904188274 | Already registered |
| **Host** | yekiberk@gmail.com | Has properties |
| **Admin** | ethiopianstay@gmail.com | Full admin access |
| **Operator** | operator@gmail.com | ID verification access |
| **Provider** | [Create new] | Test provider onboarding |

---

## 📋 TEST ROUND 1: AUTHENTICATION & ACCESS

### Test 1.1: New User Registration (5 min)
**Goal**: Verify OTP authentication works

**Steps**:
1. Open homepage → Click "Sign In"
2. Enter new phone number: +251[your-number]
3. Click "Send OTP"
4. Check phone for OTP code
5. Enter 4-digit OTP
6. Verify redirected to /welcome page

**Expected Result**: ✅ Successfully logged in, welcome page shows

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 1.2: Email OTP Login (5 min)
**Goal**: Verify email-based OTP works

**Steps**:
1. Logout if logged in
2. Go to /login
3. Switch to "Email" tab
4. Enter email address
5. Click "Send OTP"
6. Check email inbox
7. Enter 4-digit OTP
8. Verify login successful

**Expected Result**: ✅ Login via email OTP works

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 1.3: Session Persistence (35 min)
**Goal**: Verify session lasts through idle time

**Steps**:
1. Login with any account
2. Note current time: __________
3. **WAIT 30 MINUTES** (grab coffee ☕)
4. Return at: __________
5. Refresh the page (F5)
6. Check if still logged in

**Expected Result**: ✅ User remains logged in after 30 min + refresh

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## 👥 TEST ROUND 2: GUEST JOURNEY (Full Booking Flow)

### Test 2.1: Browse & Search Properties (5 min)
**Goal**: Verify search and filtering works

**Steps**:
1. Go to homepage (/)
2. Use search bar:
   - **Destination**: Addis Ababa
   - **Check-in**: Tomorrow's date
   - **Check-out**: 3 days from now
   - **Guests**: 2
3. Click "Search"
4. Verify properties appear
5. Try filters: Price range, Property type
6. Try sorting: Price, Rating

**Expected Result**: ✅ Search results update based on filters

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 2.2: Property Details (5 min)
**Goal**: Verify property page shows all info

**Steps**:
1. Click any property card
2. Verify property details page loads
3. Check these elements present:
   - [ ] Property images (carousel)
   - [ ] Title and description
   - [ ] Price per night
   - [ ] Amenities list
   - [ ] Location on map
   - [ ] Host information
   - [ ] Reviews section
   - [ ] "Book Now" button

**Expected Result**: ✅ All property info displays correctly

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 2.3: Complete Booking Flow (15 min)
**Goal**: **CRITICAL** - End-to-end booking with payment

**Steps**:
1. Login as guest (+251904188274)
2. Select a property
3. Click "Book Now"
4. Enter dates and guest count
5. Review booking summary:
   - [ ] Dates correct
   - [ ] Guest count correct
   - [ ] Price breakdown shown
   - [ ] Total calculated correctly
6. Click "Confirm Booking"
7. Enter payment details (use test card):
   - **Card**: 4242 4242 4242 4242
   - **Expiry**: 12/25
   - **CVV**: 123
8. Complete payment
9. Verify booking confirmation page
10. Check "My Trips" (/bookings)
11. Verify booking appears

**Expected Result**: 
- ✅ Booking created
- ✅ Payment processed
- ✅ Confirmation shown
- ✅ Access code generated
- ✅ Appears in "My Trips"

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

**BLOCKER**: If this fails, **DO NOT DEPLOY**

---

### Test 2.4: Booking Details & Access Code (5 min)
**Goal**: Verify booking details accessible

**Steps**:
1. From "My Trips", click a booking
2. Verify booking details page shows:
   - [ ] Property information
   - [ ] Booking dates
   - [ ] Guest count
   - [ ] Payment status
   - [ ] **6-digit access code**
   - [ ] Cancellation option (if applicable)

**Expected Result**: ✅ Access code visible and formatted (XXX-XXX)

**Actual Result**: _________________

**Access Code**: ____________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 2.5: Favorites System (5 min)
**Goal**: Verify save/unsave properties

**Steps**:
1. Browse properties
2. Click heart icon on 3 properties
3. Go to /favorites
4. Verify all 3 properties appear
5. Unfavorite one property
6. Verify it disappears

**Expected Result**: ✅ Favorites system works correctly

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## 🏠 TEST ROUND 3: HOST JOURNEY

### Test 3.1: Host Registration (10 min)
**Goal**: Verify host onboarding flow

**Steps**:
1. Logout current user
2. Go to /become-host
3. Complete host registration form:
   - [ ] Full name
   - [ ] Phone number
   - [ ] Email address
   - [ ] ID verification (upload ID photo)
4. Submit application
5. Check email for confirmation

**Expected Result**: ✅ Host application submitted

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 3.2: Create Property Listing (15 min)
**Goal**: **CRITICAL** - Verify property creation

**Steps**:
1. Login as host (yekiberk@gmail.com)
2. Go to /host/dashboard
3. Click "Add New Property"
4. Fill out property form:
   - **Title**: Test Ethiopian Guesthouse
   - **Type**: Guesthouse
   - **City**: Addis Ababa
   - **Price**: 500 ETB
   - **Capacity**: 4 guests
   - **Bedrooms**: 2
   - **Bathrooms**: 1
   - **Description**: [Use auto-suggested text]
   - **Amenities**: Select WiFi, Kitchen, Parking
   - **Images**: Upload 3 property photos
5. Submit listing
6. Verify appears in "My Properties"

**Expected Result**: 
- ✅ Property created
- ✅ Images uploaded successfully
- ✅ Status shows "Pending Approval"

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

**BLOCKER**: If image upload fails, **DO NOT DEPLOY**

---

### Test 3.3: Host Dashboard Stats (5 min)
**Goal**: Verify dashboard shows accurate data

**Steps**:
1. Stay logged in as host
2. View dashboard metrics:
   - [ ] Total properties count
   - [ ] Total bookings count
   - [ ] Total earnings (ETB)
   - [ ] Pending bookings
   - [ ] Upcoming check-ins
3. Click on a booking
4. Verify details correct

**Expected Result**: ✅ Dashboard shows real-time stats

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## 🛡️ TEST ROUND 4: ADMIN JOURNEY

### Test 4.1: Admin Login & Dashboard (5 min)
**Goal**: Verify admin access and overview

**Steps**:
1. Logout current user
2. Login as admin (ethiopianstay@gmail.com)
3. Go to /admin/dashboard
4. Verify dashboard loads with:
   - [ ] Total users count
   - [ ] Total properties count
   - [ ] Total bookings count
   - [ ] Revenue metrics
   - [ ] Pending approvals count

**Expected Result**: ✅ Admin dashboard accessible

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 4.2: Property Approval Workflow (10 min)
**Goal**: **CRITICAL** - Verify admin can approve listings

**Steps**:
1. Stay logged in as admin
2. View "Pending Properties" section
3. Click on the property created in Test 3.2
4. Review property details
5. Click "Approve"
6. Verify status changes to "Approved"
7. Logout
8. **As guest**: Browse /properties
9. Verify the approved property now appears in public feed

**Expected Result**: 
- ✅ Admin can approve properties
- ✅ Approved properties visible publicly

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

**BLOCKER**: If approval doesn't make property public, **DO NOT DEPLOY**

---

### Test 4.3: User Management (5 min)
**Goal**: Verify admin can view/manage users

**Steps**:
1. Login as admin
2. Go to "Users" section
3. Verify user list shows:
   - [ ] All registered users
   - [ ] User roles (Guest, Host, etc.)
   - [ ] Registration dates
   - [ ] Account status
4. Click on a user
5. Verify user details accessible

**Expected Result**: ✅ Admin can view all users

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## 🔧 TEST ROUND 5: SERVICE PROVIDER JOURNEY

### Test 5.1: Provider Application (10 min)
**Goal**: Verify provider onboarding

**Steps**:
1. Logout
2. Go to /services
3. Click "Want to join as a service provider?"
4. Fill provider application:
   - **Service Category**: Cleaning
   - **Business Name**: Test Cleaning Services
   - **Description**: Professional cleaning
   - **Contact**: +251999999999
   - **Email**: test@provider.com
   - **Experience**: 5 years
5. Submit application
6. Verify confirmation message

**Expected Result**: 
- ✅ Application submitted
- ✅ Email confirmation sent

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 5.2: Admin Approves Provider (5 min)
**Goal**: Verify provider approval workflow

**Steps**:
1. Login as admin
2. Go to /admin/service-providers
3. Find the pending provider application
4. Click "Approve"
5. Verify status changes

**Expected Result**: ✅ Provider approved

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 5.3: Provider Dashboard (5 min)
**Goal**: Verify provider can access dashboard

**Steps**:
1. Logout
2. Login as the approved provider (test@provider.com)
3. Go to /provider/dashboard
4. Verify dashboard shows:
   - [ ] Service status (Active)
   - [ ] Booking requests
   - [ ] Ratings
   - [ ] Earnings

**Expected Result**: ✅ Provider dashboard accessible

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## 👤 TEST ROUND 6: PROFILE MANAGEMENT

### Test 6.1: Update Profile Information (5 min)
**Goal**: **CRITICAL** - Verify profile updates persist

**Steps**:
1. Login as any user
2. Go to /profile
3. Update these fields:
   - **Name**: Change to "Test User Updated"
   - **Phone**: Keep same or change
4. Click "Save Changes"
5. Verify success message
6. Refresh page (F5)
7. Verify changes persisted

**Expected Result**: 
- ✅ Profile updates save
- ✅ Changes persist after refresh

**Actual Result**: _________________

**Name after refresh**: _________________

**Status**: ⬜ PASS ⬜ FAIL

**BLOCKER**: If updates don't persist, **DO NOT DEPLOY**

---

## 📱 TEST ROUND 7: MOBILE OPTIMIZATION

### Test 7.1: iPhone Viewport (10 min)
**Goal**: Verify responsive design on mobile

**Browser Setup**:
1. Open Chrome/Firefox DevTools (F12)
2. Click "Toggle Device Toolbar"
3. Select "iPhone 12" (390x844)

**Tests**:
1. Navigate to / (homepage)
   - [ ] Navigation menu responsive
   - [ ] Search form stacks vertically
   - [ ] Property cards stack (1 column)
   - [ ] Touch targets ≥ 56px
   - [ ] No horizontal scroll

2. Test /login page
   - [ ] Login form fits screen
   - [ ] Buttons finger-friendly
   - [ ] Keyboard doesn't cover inputs

3. Test /properties/:id
   - [ ] Images render properly
   - [ ] Text doesn't overflow
   - [ ] "Book Now" button accessible

**Expected Result**: ✅ All pages mobile-friendly

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 7.2: Android Viewport (10 min)
**Goal**: Verify Android compatibility

**Browser Setup**:
1. DevTools → Select "Galaxy S20" (360x800)

**Tests**:
- Repeat all tests from 7.1
- [ ] Verify no Android-specific layout issues

**Expected Result**: ✅ Works on Android viewport

**Actual Result**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## ⚡ TEST ROUND 8: PERFORMANCE

### Test 8.1: Page Load Times (10 min)
**Goal**: Verify performance < 3s per page

**Method**: Use browser DevTools Network tab

**Measure These Pages**:
1. Homepage (/): _______ seconds
2. Properties (/properties): _______ seconds
3. Login (/login): _______ seconds
4. Dashboard (/host/dashboard): _______ seconds

**Expected Result**: ✅ All pages load < 3 seconds

**Status**: ⬜ PASS ⬜ FAIL

---

### Test 8.2: Console Errors (5 min)
**Goal**: Verify no critical errors

**Steps**:
1. Open DevTools Console
2. Navigate through entire app
3. Note any errors

**Expected Result**: ✅ No 500 errors, no React warnings

**Errors Found**: _________________

**Status**: ⬜ PASS ⬜ FAIL

---

## 📊 TESTING SCORECARD

### Critical Tests (BLOCKERS)
These **must pass** before deployment:

| Test | Status | Blocker? |
|------|--------|----------|
| Complete booking flow | ⬜ | ⚠️ YES |
| Payment processing | ⬜ | ⚠️ YES |
| Property approval → public | ⬜ | ⚠️ YES |
| Image uploads | ⬜ | ⚠️ YES |
| Profile updates persist | ⬜ | ⚠️ YES |
| Session persistence | ⬜ | ⚠️ YES |

**Blockers Failed**: _____ / 6

---

### Non-Critical Tests
Important but not deployment blockers:

| Test | Status |
|------|--------|
| Favorites system | ⬜ |
| Service provider flow | ⬜ |
| Mobile optimization | ⬜ |
| Performance < 3s | ⬜ |
| Console errors | ⬜ |

**Non-Critical Failed**: _____ / 5

---

## 🎯 FINAL DECISION

### GO Criteria
- [ ] All 6 critical tests **PASS**
- [ ] At least 80% of non-critical tests **PASS**
- [ ] No blocker issues discovered
- [ ] API keys configured
- [ ] Database migration successful

### DECISION: ⬜ GO ⬜ NO-GO

**Rationale**: _________________________________

**Deployment Date**: _________________________________

**Deployed By**: _________________________________

---

## 📝 NOTES & ISSUES

Use this space to document any bugs or issues found:

**Issue 1**: _________________________________

**Issue 2**: _________________________________

**Issue 3**: _________________________________

---

*Testing completed by: _______________*  
*Date: _______________*  
*Total time spent: _______________*
