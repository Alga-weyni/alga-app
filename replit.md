# Alga

## Overview
Alga is a full-stack web application for the Ethiopian property rental market. It connects property owners with travelers seeking authentic accommodations, from traditional homes to modern hotels, emphasizing local culture, safety, and multi-city support across Ethiopia. The platform offers a secure, culturally rich rental experience through features like host/property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators. Alga aims to be the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design
The platform features a **child-friendly, minimal** design optimized for Ethiopian users of all ages. Uses warm color palette: dark brown (`#2d1405`) for headlines, medium brown (`#5a4a42`, `#8a6e4b`) for text, and cream backgrounds (`#f6f2ec`, `#faf5f0`). Design principles include:
- **Simplified 4-Route Navigation**: Stay (/properties), Fix (/services), Me (/my-alga), Help (/support)
- **Bigger UI Elements**: 48px+ buttons, larger touch targets for mobile users
- **Icon + Label Pattern**: Simple icons paired with clear, accessible labels
- **Child-Friendly Terminology**: "My Trips" (not "Bookings"), "List Your Property" (not "Become Host"), "Offer a Service" (not "Provider Application")
- **Smart Role-Based Dashboard**: Unified /my-alga that auto-detects user role (guest/host/provider/admin/operator)
- **Ethiopian Colors**: Warm browns (#8a6e4b), sage greens (#86a38f), cream backgrounds
- Fully responsive, mobile-optimized with lazy-loaded images and 60-80% compression for Ethiopian 3G/4G networks

### Technical Implementation
- **Frontend**: React with TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, React Hook Form with Zod for validation.
- **Backend**: Node.js with Express.js, TypeScript (ES modules), RESTful API, Express sessions with PostgreSQL storage.
- **Database**: PostgreSQL (Neon serverless hosting), Drizzle ORM, Drizzle Kit for migrations. Schema covers users, properties, bookings, reviews, favorites, and verification.
- **Authentication**: Passwordless 4-digit OTP (phone/email), Bcrypt for password hashing (32-byte auto-generated), secure session cookies, cryptographically secure OTP with 10-minute expiry. Supports Guest, Host, Admin, Operator roles with role-based access control.
- **Security**: Helmet.js, CORS protection, rate limiting, request size limits, Zod schema validation, file upload validation, secure error handling.

### Key Features
- **Property Management**: CRUD operations for listings, image uploads.
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