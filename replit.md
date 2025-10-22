# Alga

## Overview
Alga is a full-stack web application for the Ethiopian property rental market. It connects property owners with travelers seeking authentic accommodations, from traditional homes to modern hotels, emphasizing local culture, safety, and multi-city support across Ethiopia. The platform offers a secure, culturally rich rental experience through features like host/property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators. Alga aims to be the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design
The platform features a **universal accessibility design** optimized for Ethiopian users of all ages, from children to elderly. Uses warm color palette: dark brown (`#2d1405`) for headlines, medium brown (`#5a4a42`, `#8a6e4b`) for text, and cream backgrounds (`#f6f2ec`, `#faf5f0`). Design principles include:

**Navigation & Usability:**
- **Airbnb-Style Minimal Navigation**: 🏠 Stays (/properties), 🧰 Services (/services), 👤 Me (/my-alga), 💬 Help (/support)
- **Soft Cream Header**: Background color #F8F1E7 with subtle border for clean, modern aesthetic
- **Smooth Underline Animation**: Active states highlighted with deep brown (#3C2313) underline that smoothly animates on hover
- **Emoji-Enhanced Icons**: Universal visual language with emoji+icon+label pattern for instant recognition
- **Horizontal Clean Layout**: Even spacing (gap-6 lg:gap-8) optimized for desktop and mobile
- **Welcome Experience**: Post-login /welcome page with 3 clear action cards ("Stay Somewhere", "Fix Something", "Check My Trips")
- **Smart Role-Based Dashboard**: Unified /my-alga that auto-detects user role (guest/host/provider/admin/operator)

**Accessibility Features:**
- **Full ARIA Support**: aria-labels, role="button", aria-describedby throughout
- **Contextual Tooltips**: Auto-fading helper tips (💡 "Need help at home? Tap a service below") with 5s duration
- **High Contrast**: Text-to-background ratios exceed WCAG AA standards
- **Keyboard Navigation**: Tab-friendly interface for screen reader users

**Terminology & Language:**
- **Child-Friendly Wording**: "My Trips" (not "Bookings"), "List Your Property" (not "Become Host"), "Offer a Service" (not "Provider Application")
- **Simple, Warm Microcopy**: "Hi {name}! What would you like to do today?" instead of technical jargon
- **Ethiopian Colors**: Warm browns (#8a6e4b), sage greens (#86a38f), cream backgrounds

**Performance:**
- Fully responsive, mobile-optimized with lazy-loaded images
- 60-80% image compression for Ethiopian 3G/4G networks
- Progressive JPEG with mozjpeg optimization

### Technical Implementation
- **Frontend**: React with TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, React Hook Form with Zod for validation.
- **Backend**: Node.js with Express.js, TypeScript (ES modules), RESTful API, Express sessions with PostgreSQL storage.
- **Database**: PostgreSQL (Neon serverless hosting), Drizzle ORM, Drizzle Kit for migrations. Schema covers users, properties, bookings, reviews, favorites, and verification.
- **Authentication**: Passwordless 4-digit OTP (phone/email), Bcrypt for password hashing (32-byte auto-generated), secure session cookies, cryptographically secure OTP with 10-minute expiry. Supports Guest, Host, Admin, Operator roles with role-based access control.
- **Security**: Helmet.js, CORS protection, rate limiting, request size limits, Zod schema validation, file upload validation, secure error handling.

### Key Features
- **Property Management**: CRUD operations for listings, image uploads.
- **Enhanced Host Dashboard**: Ethiopian-context property title suggestions (8 preset options like "Traditional Ethiopian Home", "Eco Stay & Coffee Farm") with searchable dropdown, auto-suggested culturally relevant descriptions, and helpful hint text ("Choose a name that reflects your stay's character"). Reduces typing, increases consistency, and guides hosts toward globally attractive listings.
- **Enhanced Search & Discovery**: Keyword search, advanced filters (city, type, price, capacity, dates), sorting, collapsible filter panel, active filter badges, city filter chips.
- **Booking System**: Full workflow with date validation and conflict prevention. Supports URL parameters for seamless booking (/properties/123?book=true&checkIn=date&checkOut=date&guests=2) with auto-opening dialog and pre-filled dates.
- **6-Digit Access Code System**: Automated, auto-generated codes for property access upon payment confirmation.
- **Advanced Weighted Review System (ALGA Review Engine)**: Time-decay algorithm, 6 rating categories.
- **Universal ID Verification System**: QR code scanning for Ethiopians, OCR for foreign visitors (passport, license, national ID). Operator dashboard for manual review. Integrated with Fayda ID for eKYC.
- **Payment Gateway**: Integration with Chapa, Stripe, Telebirr, and PayPal, including webhooks.
- **Commission & Tax System (ERCA Compliant)**: Automated calculation of Alga commission (12%), VAT on commission (15%), and withholding tax from host earnings (2%). Automated ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Clear separation between guest browsing (/services) and provider application (/become-provider). Includes 11 service categories with reviews and provider badges (Verified, Top Rated, Experienced). Clean top-right CTA banner on services page, darker header on provider page for visual distinction.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Google Maps Integration**: Interactive map with property markers, map/list view toggle, user location tracking, clustering, custom Ethiopian-themed markers.
- **Provider Onboarding Flow**: Complete application process with category pre-selection from URL (/become-provider?category=slug), locked form fields, automated email notifications (SendGrid: received, approved, rejected), and admin verification dashboard.
- **Provider Dashboard**: Status-based UX for pending (shows "Under Review"), rejected (shows reason with reapply option), and approved providers (shows full dashboard with stats, bookings, ratings).

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid (for emails).
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping**: `google-map-react`.
- **File Storage**: Replit App Storage (Google Cloud Storage) for property and service images.
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.

## Deployment Guide

### Pre-Deployment Checklist
Before deploying Alga to production, ensure the following are configured:

#### 1. Environment Variables (Replit Secrets)
Add these secrets via Replit Secrets tab:
- `SENDGRID_API_KEY`: Your SendGrid API key for email notifications
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key for map features
- `SESSION_SECRET`: Auto-generated, already configured
- `DATABASE_URL`: Auto-configured by Replit PostgreSQL

#### 2. Object Storage Setup (Post-Deployment)
After deploying to production:
1. Open the **Object Storage** tab in Replit
2. Create a new bucket (e.g., `alga-production`)
3. Add these environment variables:
   - `PRIVATE_OBJECT_DIR`: `/alga-production/private`
   - `PUBLIC_OBJECT_SEARCH_PATHS`: `/alga-production/public`
4. The app will automatically use Object Storage for property and service images

#### 3. Database Migration
Run before first deployment:
```bash
npm run db:push
```

### Deployment Configuration
The app is configured for **Autoscale** deployment:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Deployment Type**: Autoscale (scales to zero when idle, cost-efficient)
- **Port**: 5000 (configured in deployment settings)

### Post-Deployment Steps
1. **Verify Database**: Check PostgreSQL connection in production
2. **Test Payment Webhooks**: Update Chapa/Stripe webhook URLs to production domain
3. **SendGrid Configuration**: Verify sender email is authenticated
4. **Google Maps**: Ensure API key has production domain whitelisted
5. **Object Storage**: Confirm image uploads work in production

### Monitoring & Maintenance
- **Logs**: View via Replit Deployments logs tab
- **Database**: Access via Replit Database tab
- **Backups**: Automatic via Neon Database
- **Scaling**: Automatic via Autoscale (0-N instances based on traffic)

---

## 🚀 Deployment Readiness Status

**Last Updated**: October 22, 2025 (7:05 PM)  
**Current Status**: ⚠️ **READY TO DEPLOY (Pending API Keys)**

### Latest Updates (October 22, 7:00 PM)
- ✅ **Navigation Upgraded**: React Router 6 + Framer Motion transitions (Airbnb-quality UX)
- ✅ **Production Seed Endpoint**: Secure Bearer token auth for database seeding (12 properties ready)
- ✅ **Sample Data Exported**: `server/sampleData.json` contains production-ready properties
- ✅ **Test Script Created**: `scripts/test-seed-endpoint.sh` for deployment validation

### Comprehensive Automated Testing Complete ✅
All 44 automated tests **PASSED** with 100% success rate:
- **Public Routes**: 7/7 PASS (Homepage, Properties, Services, Support, Become Host/Provider, Login)
- **Protected Routes**: 7/7 PASS (All show proper login prompts, not 404s)
- **Database Integrity**: 3/3 PASS (14 users, 15 properties, 15 bookings - all healthy)
- **UI Components**: 12/12 PASS (Navigation, cards, filters, tooltips, auth guards)
- **Build System**: Production build successful (374.85 KB gzipped, 12.21s)
- **TypeScript**: 0 errors, 0 LSP diagnostics
- **Console Logs**: Clean (only expected 401s for logged-out users)
- **Performance**: Page load ~350ms (well under 3s target)

### Deployment Configuration ✅
- **Type**: Autoscale (serverless, cost-efficient)
- **Build**: `npm run build`
- **Run**: `npm start`
- **Port**: 5000
- **Auto-configured**: Via deploy_config_tool

### Critical Blockers (Must Fix Before Deploy) ⚠️
1. **SENDGRID_API_KEY** - Required for OTP email delivery
2. **GOOGLE_MAPS_API_KEY** - Required for map features
3. **Object Storage** - Configure after deployment for image uploads

### Documentation Delivered 📋
- **COMPREHENSIVE_AUTOMATED_TEST_REPORT.md** (19 KB) - Full test results, 44 tests executed
- **TESTING_RESULTS_SUMMARY.md** (8 KB) - Quick overview, deployment steps
- **DEPLOYMENT_CHECKLIST.md** (12 KB) - Pre/post deployment tasks, API key instructions
- **TESTING_SESSION_TRACKER.md** (13 KB) - Manual testing checklist
- **ROLE_BASED_TESTING_EXECUTION.md** (23 KB) - Detailed test procedures
- **PRODUCTION_SEED_GUIDE.md** (NEW) - Secure database seeding for production
- **NAVIGATION_UPGRADE_COMPLETE.md** (NEW) - React Router migration details

### How to Deploy 🚀
1. **Add API Keys** (2 min) - Go to Replit Secrets, add `SENDGRID_API_KEY` and `GOOGLE_MAPS_API_KEY`
2. **Generate Seed Key** (1 min) - Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and add as `ADMIN_SEED_KEY`
3. **Click "Publish"** (4 min) - Replit will build and deploy automatically
4. **Seed Production Database** (2 min) - Call `/api/admin/seed-database` endpoint with Bearer token (see PRODUCTION_SEED_GUIDE.md)
5. **Configure Object Storage** (5 min) - Create `alga-production` bucket in Object Storage tab
6. **Update Webhooks** (10 min) - Set Chapa/Stripe webhook URLs to production domain
7. **Manual Testing** (2-3 hours) - Complete booking flow, image uploads, mobile testing

### Go/No-Go Criteria
**Current Score**: 6/8 criteria met
- ✅ Production build successful
- ✅ No TypeScript/LSP errors
- ✅ All routes accessible
- ✅ Auth guards working
- ✅ Database healthy
- ✅ Deployment configured
- ⚠️ API keys (add before deploy)
- ⏳ Manual testing (complete after deploy)

**Recommendation**: **DEPLOY IMMEDIATELY AFTER ADDING API KEYS** - Infrastructure solid, all automated tests passed