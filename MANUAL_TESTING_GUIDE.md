# 🧪 Alga Platform - Comprehensive Manual Testing Guide

**IMPORTANT**: Since I cannot interactively test login flows via screenshots, you'll need to perform these tests manually. Use this guide to systematically test each user role.

---

## 🔑 Test Accounts

Based on your database:
- **Guest**: `+251904188274` (phone) or any email
- **Host**: `yekiberk@gmail.com` (email)
- **Admin**: `ethiopianstay@gmail.com` (email)
- **Operator**: `operator@gmail.com` (email)

**Note**: The system uses 4-digit OTP authentication. In development, the OTP will be displayed in the toast notification!

---

## 📋 TEST 1: GUEST USER JOURNEY

### 1.1 Property Browsing (No Login Required)
- [ ] Visit `/properties`
- [ ] **Verify**: 15 properties display in grid/list view
- [ ] Click city filter chips (Addis Ababa, Bahir Dar, etc.)
- [ ] **Verify**: Properties filter correctly
- [ ] Click **Filters** button
- [ ] **Verify**: Advanced filter panel opens
- [ ] Try price range, property type, guests, bedrooms filters
- [ ] **Verify**: Active filters show as badges
- [ ] Change sort order (Recommended, Price, Rating)
- [ ] **Verify**: Properties re-sort

### 1.2 Property Details
- [ ] Click any property card
- [ ] **Verify**: Property details page loads with:
  - Property images carousel
  - Title, location, price
  - Amenities list
  - Host information
  - Reviews section
  - Booking calendar (if logged out, prompts login)
  
### 1.3 Guest Registration & Login
- [ ] Click **Sign In** button in header
- [ ] **Verify**: Auth dialog opens
- [ ] Switch to **Create Account** tab
- [ ] Choose **Phone** tab
- [ ] Enter: `+251912345678`, First Name: `Test`, Last Name: `Guest`
- [ ] Click **Send OTP**
- [ ] **Verify**: Toast shows "Development OTP: XXXX"
- [ ] Enter the 4-digit OTP
- [ ] Click **Verify**
- [ ] **Expected**: Redirect to `/welcome` page
- [ ] **Verify**: Welcome page shows 3 action cards

### 1.4 Booking Flow (Authenticated Guest)
- [ ] From welcome page, click "Stay Somewhere"
- [ ] Select a property
- [ ] Click **Book** button
- [ ] **Verify**: Booking dialog opens with:
  - Check-in/check-out date pickers
  - Guest count selector
  - Price breakdown
- [ ] Select dates (e.g., tomorrow to 3 days from now)
- [ ] Select 2 guests
- [ ] **Verify**: Total price calculates correctly
- [ ] Click **Confirm Booking**
- [ ] **Verify**: Payment options appear (Chapa, Stripe, PayPal, Telebirr)
- [ ] Select a payment method
- [ ] Complete payment (test mode)
- [ ] **Expected**: Redirect to `/booking/success`
- [ ] **Verify**: Success page shows booking details

### 1.5 My Bookings
- [ ] Navigate to `/bookings` (or click "👤 Me" → My Bookings)
- [ ] **Verify**: Recent booking appears
- [ ] **Verify**: Shows status, dates, property, price
- [ ] Click booking card
- [ ] **Verify**: Booking details page shows:
  - 6-digit access code (if payment confirmed)
  - Property details
  - Host contact
  - Cancel button (if cancellation allowed)

### 1.6 Favorites
- [ ] Browse properties
- [ ] Click heart icon on any property
- [ ] **Verify**: Heart fills with color
- [ ] Navigate to `/favorites`
- [ ] **Verify**: Favorited property appears
- [ ] Click heart again to unfavorite
- [ ] **Verify**: Property removes from favorites

---

## 🏠 TEST 2: HOST USER JOURNEY

### 2.1 Become a Host
- [ ] **If no host account**: Visit `/become-host`
- [ ] **Verify**: Host onboarding page explains benefits
- [ ] Scroll through features (Earn Income, Verified Guests, etc.)
- [ ] Click **Get Started** or **List Your Property**
- [ ] **If logged out**: Auth dialog appears
- [ ] Register or login with email (e.g., `newhost@test.com`)
- [ ] **Expected**: After login, user role should allow host actions

### 2.2 Host Dashboard Access
- [ ] Navigate to `/host/dashboard`
- [ ] **Verify**: Dashboard loads with:
  - Property management section
  - Booking calendar
  - Earnings overview
  - Recent bookings list
  - "Add New Property" button

### 2.3 Create Property Listing
- [ ] Click **Add New Property** button
- [ ] **Verify**: Property creation dialog opens
- [ ] **Test Title Suggestions** (Ethiopian context feature):
  - Click the **Title** dropdown
  - **Verify**: 8 preset options appear:
    - Traditional Ethiopian Home
    - Modern City Apartment
    - Mountain View Eco Lodge
    - etc.
  - Select "Traditional Ethiopian Home"
  - **Verify**: Description auto-fills with relevant text
  
- [ ] Fill out form:
  - **Type**: House
  - **Location**: `123 Bole Road`
  - **City**: Addis Ababa
  - **Region**: Addis Ababa
  - **Price**: `2500` ETB
  - **Max Guests**: `4`
  - **Bedrooms**: `2`
  - **Bathrooms**: `2`
  - **Amenities**: Check WiFi, Kitchen, Parking
  
- [ ] **Upload Images**:
  - Drag and drop 2-3 images OR click to browse
  - **Verify**: Images compress to 60-80% (check file size)
  - **Verify**: Image previews appear
  
- [ ] Click **Create Property**
- [ ] **Verify**: Success toast appears
- [ ] **Verify**: Property appears in dashboard (status: "pending" or "active")

### 2.4 Edit Property
- [ ] Click **Edit** on an existing property
- [ ] Change price to `3000` ETB
- [ ] Update description
- [ ] Add/remove an amenity
- [ ] Click **Save Changes**
- [ ] **Verify**: Updates reflect immediately

### 2.5 View Bookings
- [ ] In host dashboard, navigate to **Bookings** tab
- [ ] **Verify**: Shows all bookings for your properties
- [ ] **Verify**: Displays:
  - Guest name
  - Check-in/check-out dates
  - Status (confirmed, pending, cancelled)
  - Total price
  - Payment status

---

## 🔧 TEST 3: SERVICE PROVIDER JOURNEY

### 3.1 Browse Services Marketplace (Public)
- [ ] Visit `/services`
- [ ] **Verify**: 11 service categories display:
  - Cleaning, Laundry, Transport
  - Electrical, Plumbing, Driver Services
  - Meal Support, Local Guides, Photography
  - Landscaping, Welcome Pack
- [ ] **Verify**: Tooltip appears on page load (💡 "Need help at home...")
- [ ] **Verify**: Top-right banner shows "Want to join Alga as a service provider?"
- [ ] Click any service category (e.g., **Cleaning**)
- [ ] **Verify**: Service category page shows providers (if any exist)

### 3.2 Become a Service Provider
- [ ] From `/services`, click **"Want to join Alga as a service provider?"**
- [ ] **Expected**: Redirect to `/become-provider`
- [ ] **Verify**: Provider onboarding page loads with:
  - Darker header (visual distinction from guest pages)
  - Earn More, Verified Badge, Fast Payments cards
  - "Start Your Application" button
  
- [ ] Click **Start Your Application**
- [ ] **If logged out**: Login/register prompt appears
- [ ] Login with a test account (e.g., `provider@test.com`)

### 3.3 Provider Application Form
- [ ] **Verify**: Application form opens with:
  - Business Name
  - Service Type (dropdown with 11 categories)
  - Description
  - City dropdown
  - Region dropdown
  - Pricing Model (Fixed Price / Hourly Rate / Per Item)
  - Base Price (ETB)
  - Phone Number
  - Experience Years
  
- [ ] Fill out form:
  - **Business Name**: `Clean Home Services`
  - **Service Type**: `Cleaning`
  - **Description**: `Professional cleaning during or after your stay`
  - **City**: `Addis Ababa`
  - **Region**: `Addis Ababa`
  - **Pricing Model**: `Fixed Price`
  - **Base Price**: `500`
  - **Phone**: `+251911222333`
  - **Experience**: `3` years
  
- [ ] Click **Submit Application**
- [ ] **Verify**: Success toast appears
- [ ] **Verify**: Email sent to provider: "Application Received" (check SendGrid logs if configured)

### 3.4 Provider Dashboard - Pending Status
- [ ] Navigate to `/provider/dashboard`
- [ ] **Verify**: Shows "Under Review" status with message:
  - "Your application is being reviewed"
  - Expected review time
  - No service stats visible yet

### 3.5 Provider Dashboard - After Approval (Admin Action Required)
- [ ] Admin must approve provider first (see Admin Testing section)
- [ ] After approval, revisit `/provider/dashboard`
- [ ] **Verify**: Full dashboard loads with:
  - Service bookings list
  - Earnings stats
  - Ratings summary
  - Active/completed jobs

---

## 👑 TEST 4: ADMIN USER JOURNEY

### 4.1 Admin Login
- [ ] Visit any page, click **Sign In**
- [ ] Login with: `ethiopianstay@gmail.com`
- [ ] Enter OTP when received
- [ ] **Expected**: Redirect to `/admin/dashboard`

### 4.2 Admin Dashboard Overview
- [ ] **Verify**: Dashboard loads with tabs:
  - **Overview** (stats dashboard)
  - **Users** (user management)
  - **Properties** (property verification)
  - **Documents** (ID verification)
  - **Providers** (service provider approvals)
  
- [ ] **Overview Tab** should show:
  - Total users count
  - New users this month
  - Active properties
  - Pending properties
  - Pending documents
  - Total revenue
  - Monthly revenue

### 4.3 User Management
- [ ] Click **Users** tab
- [ ] **Verify**: Table shows all users with:
  - Name, Email, Phone, Role, Status
  - Action buttons (View, Edit, Suspend)
- [ ] Click **View** on any user
- [ ] **Verify**: User details dialog shows:
  - Full profile info
  - Verification status
  - Booking history (if guest)
  - Properties (if host)

### 4.4 Property Verification
- [ ] Click **Properties** tab
- [ ] **Verify**: Shows pending properties (if any from host testing)
- [ ] Click **Review** on a pending property
- [ ] **Verify**: Property details dialog shows:
  - All property info
  - Images
  - Host details
  - **Approve** / **Reject** buttons
- [ ] Click **Approve**
- [ ] **Verify**: Property status changes to "active"
- [ ] **Verify**: Property now visible on `/properties` page

### 4.5 Service Provider Approval
- [ ] Click **Providers** tab (or visit `/admin/service-providers`)
- [ ] **Verify**: Shows pending provider applications
- [ ] Click **Review** on the provider from Testing 3.3
- [ ] **Verify**: Application details show
- [ ] Click **Approve**
- [ ] **Verify**: Success toast
- [ ] **Verify**: Email sent to provider: "Application Approved"
- [ ] **Verify**: Provider now appears on `/services/{category}` page

### 4.6 Provider Rejection Flow
- [ ] Submit another provider application
- [ ] As admin, click **Reject**
- [ ] **Verify**: Rejection reason textarea appears
- [ ] Enter reason: `Incomplete business information`
- [ ] Confirm rejection
- [ ] **Verify**: Email sent to provider: "Application Rejected" with reason
- [ ] Login as rejected provider
- [ ] **Verify**: Provider dashboard shows rejection reason
- [ ] **Verify**: "Reapply" button appears

---

## 🛡️ TEST 5: OPERATOR USER JOURNEY

### 5.1 Operator Login
- [ ] Login with: `operator@gmail.com`
- [ ] **Expected**: Redirect to `/operator/dashboard`

### 5.2 Operator Dashboard
- [ ] **Verify**: Dashboard shows tabs:
  - **Documents** (ID/passport verification)
  - **Properties** (property verification - similar to admin)
  
### 5.3 Document Verification
- [ ] Click **Documents** tab
- [ ] **Verify**: Shows pending verification documents (from ID scanner)
- [ ] Click **Review** on any document
- [ ] **Verify**: Document image displays
- [ ] **Verify**: User info shows (name, ID number, expiry, etc.)
- [ ] Click **Approve**
- [ ] **Verify**: Document status changes to "verified"
- [ ] **Verify**: User's verification status updates

### 5.4 Document Rejection
- [ ] Click **Reject** on a document
- [ ] **Verify**: Rejection reason field appears
- [ ] Enter: `Document image is blurry`
- [ ] Confirm rejection
- [ ] **Verify**: User notified (if notification system configured)

---

## 🧪 CROSS-FUNCTIONAL TESTS

### Navigation & Routing
- [ ] Test all header navigation links:
  - **🏠 Stays** → `/properties`
  - **🧰 Services** → `/services`
  - **👤 Me** → `/my-alga` (or login prompt if logged out)
  - **💬 Help** → `/support`
- [ ] **Verify**: Active route has smooth brown underline
- [ ] **Verify**: Hover animations work
- [ ] Test mobile menu (resize browser to <768px)
- [ ] **Verify**: Mobile menu opens with sheet/drawer
- [ ] **Verify**: All navigation items work on mobile

### Authentication Persistence
- [ ] Login as any user
- [ ] Refresh page (F5)
- [ ] **Verify**: User stays logged in
- [ ] Close browser completely
- [ ] Reopen and visit site
- [ ] **Verify**: User stays logged in (session cookie)

### Role-Based Access Control
- [ ] Login as **Guest**
- [ ] Try to visit `/admin/dashboard`
- [ ] **Expected**: Either redirected or shown "unauthorized" message
- [ ] Try to visit `/operator/dashboard`
- [ ] **Expected**: Same unauthorized behavior
- [ ] Try to visit `/host/dashboard`
- [ ] **Expected**: Only accessible if user is also a host

### Error Handling
- [ ] Try to book a property with past dates
- [ ] **Verify**: Validation error appears
- [ ] Try to submit property form with missing required fields
- [ ] **Verify**: Form validation errors show
- [ ] Enter invalid phone format (e.g., `1234567`)
- [ ] **Verify**: "Phone must be in format +251XXXXXXXXX" error

### Image Uploads
- [ ] Upload very large image (>5MB) to property form
- [ ] **Verify**: Image compresses to ~60-80% of original size
- [ ] **Verify**: Upload completes successfully
- [ ] **Verify**: Image displays in property listing

### Payment Integration
- [ ] Try booking with Chapa payment
- [ ] **Verify**: Redirects to Chapa payment gateway (test mode)
- [ ] Complete payment (if test credentials available)
- [ ] **Verify**: Booking status updates to "confirmed"
- [ ] **Verify**: 6-digit access code generates

---

## 📊 KEY SUCCESS CRITERIA

Your platform is production-ready when:

✅ All user roles can login successfully
✅ Guests can browse, search, filter, and book properties
✅ Hosts can create and manage property listings
✅ Service providers can apply and get approved
✅ Admin can manage users, properties, and approvals
✅ Operator can verify documents
✅ All dashboards load without errors
✅ Navigation works across all pages
✅ Auth persists across page refreshes
✅ Role-based access control prevents unauthorized access
✅ Forms validate inputs correctly
✅ Images upload and compress properly
✅ Booking flow completes end-to-end
✅ Payment redirects work (even in test mode)

---

## 🐛 HOW TO REPORT BUGS

When you find a bug, add it to `TESTING_LOG.md` using this format:

```markdown
### [ROLE] - [PAGE] - [ISSUE]
**Steps to Reproduce**:
1. Login as guest
2. Navigate to /properties
3. Click on first property

**Expected**: Property details page loads
**Actual**: 404 error page

**Solution**: [Will be filled in when fixed]
```

---

## 🎯 NEXT STEPS AFTER TESTING

1. Complete all tests in this guide
2. Document all bugs in TESTING_LOG.md
3. I'll review and fix all documented bugs
4. Re-run critical tests to verify fixes
5. Run final production build: `npm run build`
6. Deploy to Replit using the **Deploy** button
7. Configure production secrets (SENDGRID_API_KEY, GOOGLE_MAPS_API_KEY)
8. Test again on production URL
9. 🎉 Launch!
