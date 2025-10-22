# 🎭 ALGA - ROLE-BASED TESTING EXECUTION GUIDE

**Created**: October 22, 2025  
**Status**: READY FOR EXECUTION  
**Goal**: Verify every user role's data flow from login → action → dashboard → logout

---

## 📊 TESTING OVERVIEW

### Four Critical Flows (Each Must Pass TWICE)
1. **Admin Flow**: Login → Approve listings → Check profiles → Verify counts
2. **Host Flow**: Register → Add property → Refresh → See in "My Listings"
3. **Guest Flow**: Browse → Filter → Book → Confirm → View "My Bookings"
4. **Service Provider Flow**: Register → Offer service → Get confirmation → Check requests

### Additional Validations
- **Session Persistence**: 30-minute idle test
- **Profile Management**: Edit → Save → Verify persistence
- **Mobile Optimization**: iPhone, Samsung, Pixel testing

---

## ✅ AUTOMATED PRE-CHECKS (COMPLETED)

Before manual testing, these have been verified:

### App Status ✅
- [x] Server running on port 5000
- [x] Homepage loads successfully
- [x] 15 properties visible in database
- [x] Navigation menu functional (Stays, Services, Me, Help)
- [x] Search bar and filters present
- [x] No React warnings in console
- [x] Only expected 401s for auth endpoints (normal when logged out)

### Build Quality ✅
- [x] Production build: 374.85 KB gzipped
- [x] TypeScript: 0 errors
- [x] LSP diagnostics: 0 errors
- [x] Console: Clean (no errors)

**Conclusion**: Infrastructure is solid, ready for manual testing ✅

---

## 1️⃣ CROSS-ROLE DATA VALIDATION (Round 1)

### 🛡️ ADMIN FLOW

**Test Sequence**: Login → Approve new listings → Check host profiles → Verify user counts

#### Step-by-Step Procedure

1. **Login as Admin**
   - Go to `/login`
   - Enter email: `ethiopianstay@gmail.com`
   - Click "Send OTP"
   - Enter OTP code
   - Verify redirect to /welcome or /admin/dashboard

2. **Navigate to Admin Dashboard**
   - URL: `/admin/dashboard`
   - Verify stats cards visible:
     - [ ] Total Users count
     - [ ] Total Properties count
     - [ ] Total Bookings count
     - [ ] Pending Approvals count

3. **Approve New Listings**
   - Find "Pending Properties" section
   - Click on a pending property
   - Click "Approve" button
   - Verify:
     - [ ] Status changes to "Approved"
     - [ ] Success toast appears
     - [ ] Property disappears from pending list

4. **Check Host Profiles**
   - Navigate to "Users" or "Hosts" section
   - Click on a host profile
   - Verify:
     - [ ] Host information displays
     - [ ] Properties list shows
     - [ ] Booking history visible

5. **Verify Approved Property Appears Publicly**
   - **Logout** (important!)
   - Browse to `/properties` (logged out)
   - Search for the approved property
   - Verify:
     - [ ] Property appears in search results
     - [ ] All details visible (price, images, description)
     - [ ] Can view property detail page

6. **Verify User Counts Updated**
   - Login as admin again
   - Check dashboard stats
   - Verify:
     - [ ] User count accurate
     - [ ] Property count includes newly approved
     - [ ] Dashboard updates instantly (no stale data)

**Expected Behavior**: 
- ✅ Dashboard updates instantly
- ✅ Approved listings appear publicly within seconds
- ✅ No refresh errors
- ✅ No data loss

**Completion Checklist**:
- [ ] Round 1 completed
- [ ] Round 2 completed (repeat all steps)
- [ ] Both rounds successful without errors

---

### 🏠 HOST FLOW

**Test Sequence**: Register → Add new property → Refresh → See under "My Listings"

#### Step-by-Step Procedure

1. **Register New Host** (if needed) OR **Login as Existing Host**
   - Option A: Go to `/become-host` and complete registration
   - Option B: Login with `yekiberk@gmail.com`
   - Verify redirect to /host/dashboard or /welcome

2. **Navigate to Host Dashboard**
   - URL: `/host/dashboard`
   - Verify dashboard loads with:
     - [ ] "Add New Property" button visible
     - [ ] "My Properties" list
     - [ ] Stats: Total Bookings, Total Earnings

3. **Add New Property**
   - Click "Add New Property" button
   - Fill out form:
     - **Title**: Test Property $(date +%s) [use unique name]
     - **Type**: Select "Guesthouse" or "Apartment"
     - **City**: Select "Addis Ababa"
     - **Price**: 500 (ETB per night)
     - **Capacity**: 4 guests
     - **Bedrooms**: 2
     - **Bathrooms**: 1
     - **Description**: Use auto-suggested text OR write custom
     - **Amenities**: Check WiFi, Kitchen, Parking
     - **Images**: Upload 2-3 photos (if possible)
   
4. **Submit Property**
   - Click "Submit" or "Save"
   - Verify:
     - [ ] Success toast appears
     - [ ] Redirect to "My Properties" or dashboard
     - [ ] New property visible in list
     - [ ] Status shows "Pending Approval"

5. **Refresh Page**
   - Press F5 or Ctrl+R
   - Verify:
     - [ ] Still logged in
     - [ ] Property still visible in "My Properties"
     - [ ] All property details correct
     - [ ] Status still "Pending Approval"

6. **Edit Property** (Optional)
   - Click "Edit" on the property
   - Change price to 600
   - Save changes
   - Refresh
   - Verify:
     - [ ] Edits persist after refresh
     - [ ] Updated price shows as 600

**Expected Behavior**:
- ✅ Listing visible post-approval (requires admin to approve)
- ✅ Edits persist across sessions
- ✅ No data loss on refresh

**Database Verification** (Optional):
```sql
SELECT id, title, price, status, "hostId" FROM properties 
WHERE title LIKE 'Test Property%' 
ORDER BY id DESC LIMIT 5;
```

**Completion Checklist**:
- [ ] Round 1 completed
- [ ] Round 2 completed (create another property)
- [ ] Both rounds successful without errors

---

### 👥 GUEST FLOW

**Test Sequence**: Browse → Filter → Book → Confirm → View "My Bookings"

#### Step-by-Step Procedure

1. **Browse Properties (Logged Out)**
   - Start at `/` (homepage)
   - Verify:
     - [ ] Properties display (15+ properties)
     - [ ] Images load
     - [ ] Prices visible

2. **Use Search & Filters**
   - Destination: "Addis Ababa"
   - Check-in: Tomorrow's date
   - Check-out: 3 days from now
   - Guests: 2
   - Click "Search"
   - Verify:
     - [ ] Results update
     - [ ] Filtered properties match criteria

3. **Login as Guest**
   - Click "Sign In"
   - Enter phone: `+251904188274`
   - OR use email
   - Enter OTP
   - Verify redirect

4. **Select a Property**
   - Click on a property card
   - Verify property details page loads:
     - [ ] Images in carousel
     - [ ] Price per night
     - [ ] Amenities list
     - [ ] "Book Now" button visible

5. **Complete Booking**
   - Click "Book Now"
   - Verify booking dialog/form opens
   - Fill in:
     - [ ] Check-in date
     - [ ] Check-out date
     - [ ] Number of guests
   - Review booking summary:
     - [ ] Dates correct
     - [ ] Price calculation correct
     - [ ] Total amount shown
   - Click "Confirm Booking"

6. **Payment** (if configured)
   - Enter test card:
     - Card: 4242 4242 4242 4242
     - Expiry: 12/25
     - CVV: 123
   - Submit payment
   - Verify:
     - [ ] Payment processes
     - [ ] Confirmation page/toast appears
     - [ ] **Access code generated** (XXX-XXX format)

7. **View "My Bookings"**
   - Navigate to `/bookings` OR click "My Trips"
   - Verify:
     - [ ] Booking appears in list
     - [ ] Property name correct
     - [ ] Dates correct
     - [ ] Access code visible
     - [ ] Booking status shown

8. **Refresh Page**
   - Press F5
   - Verify:
     - [ ] Still logged in
     - [ ] Booking still visible
     - [ ] All details persist

9. **View Booking Receipt**
   - Click on booking to view details
   - Verify:
     - [ ] Receipt/confirmation page loads
     - [ ] All booking info present
     - [ ] Access code displayed

**Expected Behavior**:
- ✅ Booking record created in database
- ✅ Receipt generated and accessible
- ✅ Visible post-refresh (no data loss)
- ✅ Access code auto-generated

**Database Verification** (Optional):
```sql
SELECT id, "guestId", "propertyId", "checkIn", "checkOut", status, "accessCode"
FROM bookings 
ORDER BY id DESC LIMIT 5;
```

**Completion Checklist**:
- [ ] Round 1 completed
- [ ] Round 2 completed (make another booking)
- [ ] Both rounds successful without errors

---

### 🔧 SERVICE PROVIDER FLOW

**Test Sequence**: Register → Offer service → Receive confirmation → Check requests

#### Step-by-Step Procedure

1. **Browse Services (Logged Out)**
   - Go to `/services`
   - Verify:
     - [ ] 11 service categories visible
     - [ ] "Want to join as provider?" CTA visible

2. **Register as Service Provider**
   - Click "Want to join as provider?" OR go to `/become-provider`
   - Fill application form:
     - **Service Category**: Select "Cleaning" (or any category)
     - **Business Name**: Test Cleaning Services
     - **Description**: Professional cleaning services
     - **Contact Phone**: +251999999999
     - **Email**: testprovider@example.com
     - **Experience**: 5 years
     - **Pricing**: 500 ETB/hour
   - Submit application

3. **Receive Confirmation**
   - Verify:
     - [ ] Success toast appears
     - [ ] Confirmation message: "Application submitted"
     - [ ] Email confirmation sent (check inbox)
     - [ ] Redirect to confirmation page

4. **Admin Approves Provider** (Switch to Admin)
   - Logout as provider
   - Login as admin (`ethiopianstay@gmail.com`)
   - Navigate to `/admin/service-providers` OR provider approval section
   - Find pending provider application
   - Click "Approve"
   - Verify:
     - [ ] Status changes to "Approved"
     - [ ] Approval email sent to provider

5. **Login as Approved Provider**
   - Logout as admin
   - Login as provider (testprovider@example.com)
   - Verify redirect to `/provider/dashboard`

6. **Check Provider Dashboard**
   - Verify dashboard shows:
     - [ ] Service status: "Active"
     - [ ] Booking requests (if any)
     - [ ] Ratings/Reviews (if any)
     - [ ] Earnings summary

7. **Verify Service Listed in Marketplace**
   - Logout
   - Browse to `/services` (logged out)
   - Find your service category (e.g., Cleaning)
   - Verify:
     - [ ] Your service appears
     - [ ] Business name correct
     - [ ] Description visible
     - [ ] Pricing shown
     - [ ] "Book Service" button works

8. **Refresh & Re-Login**
   - Login as provider again
   - Verify:
     - [ ] Dashboard still shows "Active"
     - [ ] All data persists

**Expected Behavior**:
- ✅ Services listed correctly in marketplace
- ✅ Provider sees notifications/requests
- ✅ Status persists across sessions

**Database Verification** (Optional):
```sql
SELECT id, "businessName", category, status, email 
FROM service_providers 
ORDER BY id DESC LIMIT 5;
```

**Completion Checklist**:
- [ ] Round 1 completed
- [ ] Round 2 completed (register another provider)
- [ ] Both rounds successful without errors

---

## 2️⃣ SESSION PERSISTENCE & TOKEN EXPIRY

### 30-Minute Idle Test

**Objective**: Verify sessions persist or gracefully expire

#### Procedure for Each Role

1. **Login as Role** (Admin, Host, Guest, Provider, Operator)
   - Complete login
   - Verify dashboard loads
   - **Note time**: _____________

2. **Idle for 30 Minutes**
   - Leave browser tab open
   - Do NOT interact with app
   - **Wait exactly 30 minutes**
   - Set timer: ⏰

3. **Return After 30 Minutes**
   - **Time returned**: _____________
   - **Elapsed time**: _____________ minutes

4. **Refresh Page** (F5)
   - Observe what happens

5. **Expected Outcomes** (One of these):
   - **Option A**: Session auto-restores
     - [ ] User still logged in
     - [ ] Dashboard loads normally
     - [ ] No data loss
   
   - **Option B**: Clean re-login prompt
     - [ ] "Sign In Again" message appears
     - [ ] No broken state
     - [ ] No infinite spinner
     - [ ] Can login again successfully

**Test Matrix**:

| Role | Login Time | Idle 30min | Refresh | Result | Status |
|------|------------|------------|---------|--------|--------|
| Admin | _______ | ✅ | ✅ | Option A or B | ⬜ |
| Host | _______ | ✅ | ✅ | Option A or B | ⬜ |
| Guest | _______ | ✅ | ✅ | Option A or B | ⬜ |
| Provider | _______ | ✅ | ✅ | Option A or B | ⬜ |
| Operator | _______ | ✅ | ✅ | Option A or B | ⬜ |

**Expected Behavior**:
- ✅ Session auto-restores OR clean "Sign In Again" prompt
- ✅ No broken state
- ✅ No infinite spinner
- ✅ No console errors

**Completion Checklist**:
- [ ] All 5 roles tested
- [ ] All pass with Option A or Option B
- [ ] No broken states encountered

---

## 3️⃣ ACCOUNT SETTINGS & PROFILE MANAGEMENT

### Profile Update Persistence Test

**Objective**: Verify profile changes persist across sessions

#### Procedure

1. **Login as Any User**
   - Choose a role (Guest, Host, Admin, Provider)
   - Navigate to `/profile`

2. **Record Current Values**
   - Current Name: _______________________
   - Current Phone: _______________________
   - Current Email: _______________________

3. **Edit Profile**
   - **New Name**: Test User Updated $(date)
   - **New Phone**: +251912345678 (or different)
   - **New Email**: (if editable)
   - Click "Save Changes"

4. **Verify Immediate Update**
   - Verify:
     - [ ] Success toast appears
     - [ ] Name updates in header/nav (if displayed)
     - [ ] No errors

5. **Navigate Away**
   - Go to `/properties` or any other page
   - Then return to `/profile`
   - Verify:
     - [ ] Updated values still showing

6. **Refresh Page**
   - Press F5
   - Verify:
     - [ ] Still logged in
     - [ ] Updated values persist

7. **Logout & Login Again**
   - Click "Logout"
   - Login with same credentials
   - Navigate to `/profile`
   - Verify:
     - [ ] Updated name shows immediately
     - [ ] Updated phone shows
     - [ ] All changes persisted in database

8. **Check Dashboard**
   - Navigate to dashboard (role-specific)
   - Verify:
     - [ ] Updated name reflects in dashboard
     - [ ] User info matches profile

**Database Verification**:
```sql
SELECT id, name, email, phone, role 
FROM users 
WHERE email = 'your-test-email@example.com';
```

**Expected Behavior**:
- ✅ Edits persist in database
- ✅ Reflect on dashboards immediately
- ✅ "Logout → Login Again" shows updated data instantly

**Completion Checklist**:
- [ ] Profile edit successful
- [ ] Data persists after refresh
- [ ] Data persists after logout/login
- [ ] Database updated correctly

---

## 4️⃣ MOBILE OPTIMIZATION & RESPONSIVENESS

### Device Testing Matrix

**Devices to Test**:
- iPhone 13 / 14 / 15 (390 × 844)
- Samsung Galaxy S22 (360 × 800)
- Google Pixel 7 (412 × 915)

**Browsers**:
- Chrome (priority)
- Safari (iOS only)

### How to Test (DevTools Method)

1. **Open Browser DevTools**
   - Press F12 (or Cmd+Option+I on Mac)

2. **Toggle Device Toolbar**
   - Press Ctrl+Shift+M (or Cmd+Shift+M)

3. **Select Device**
   - Choose from dropdown: iPhone 13, Galaxy S22, Pixel 7
   - OR enter custom dimensions

4. **Test Both Orientations**
   - Portrait (default)
   - Landscape (rotate icon)

---

### Mobile Checklist (For Each Device)

#### Visual Elements
- [ ] No text overflow or clipped buttons
- [ ] All text legible without zooming
- [ ] Images scale properly (no distortion)
- [ ] Colors consistent (cream #F8F1E7, brown #2d1405)
- [ ] Emoji icons render correctly

#### Layout & Spacing
- [ ] No horizontal scroll (except intentional carousels)
- [ ] Property cards stack vertically (1 column on phone)
- [ ] Forms fit screen width
- [ ] Buttons not too close together (8px+ spacing)

#### Header & Navigation
- [ ] Header sticky on scroll
- [ ] Scroll smooth (no jank)
- [ ] Navigation icons tappable (56px+ recommended)
- [ ] Active state shows correctly

#### Forms & Inputs
- [ ] Sign-in modal positions correctly
- [ ] Keyboard doesn't block input fields
- [ ] Keyboard doesn't hide submit buttons
- [ ] Input fields auto-scroll into view when typing
- [ ] Date pickers open properly
- [ ] Dropdowns work on touch

#### Touch Targets
- [ ] All buttons ≥ 40px height/width (minimum)
- [ ] Links easy to tap (not too small)
- [ ] No accidental taps (proper spacing)

#### Performance
- [ ] Pages load under 3 seconds
- [ ] Smooth scrolling
- [ ] No layout shift when loading
- [ ] Images lazy load

#### Browser-Specific
- [ ] Chrome renders correctly
- [ ] Safari renders correctly (iOS)
- [ ] No browser-specific bugs

---

### Key Pages to Test

| Page | iPhone 13 | Galaxy S22 | Pixel 7 | Portrait | Landscape |
|------|-----------|------------|---------|----------|-----------|
| `/` (Homepage) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/properties` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/properties/:id` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/login` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/services` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/bookings` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/profile` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/admin/dashboard` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/host/dashboard` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 📊 MASTER TESTING SCORECARD

### Summary of All Tests

| Test Category | Round 1 | Round 2 | Status |
|---------------|---------|---------|--------|
| **Admin Flow** | ⬜ | ⬜ | ⬜ PASS ⬜ FAIL |
| **Host Flow** | ⬜ | ⬜ | ⬜ PASS ⬜ FAIL |
| **Guest Flow** | ⬜ | ⬜ | ⬜ PASS ⬜ FAIL |
| **Provider Flow** | ⬜ | ⬜ | ⬜ PASS ⬜ FAIL |
| **Session Persistence** | ⬜ | N/A | ⬜ PASS ⬜ FAIL |
| **Profile Management** | ⬜ | N/A | ⬜ PASS ⬜ FAIL |
| **Mobile (iPhone)** | ⬜ | N/A | ⬜ PASS ⬜ FAIL |
| **Mobile (Samsung)** | ⬜ | N/A | ⬜ PASS ⬜ FAIL |
| **Mobile (Pixel)** | ⬜ | N/A | ⬜ PASS ⬜ FAIL |

---

## ✅ FINAL SIGN-OFF

### Criteria for Production Deployment

All must be checked:

- [ ] All 4 role flows pass (Round 1 & Round 2)
- [ ] Session persistence works correctly
- [ ] Profile updates persist across sessions
- [ ] Mobile responsive on 3+ devices
- [ ] No refresh errors or data loss
- [ ] No console errors (except expected 401s)
- [ ] Touch targets meet 40px minimum
- [ ] Load times under 3 seconds

---

### Sign-Off

**Testing Completed By**: _______________________  
**Date**: _______________________  
**Total Time Spent**: _______ hours  
**Issues Found**: _______ (see TESTING_LOG.md)  
**Issues Resolved**: _______  

**Overall Status**: ⬜ PASS ⬜ FAIL ⬜ PASS WITH CONDITIONS

**Ready for Production**: ⬜ YES ⬜ NO ⬜ WITH RESERVATIONS

**Notes**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

*Created by: Replit Agent*  
*Based on: CEO Testing Directive + Manual Testing Requirements*  
*Ready for execution* ✅
