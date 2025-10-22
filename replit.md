# Alga

## Overview

Alga ("bed" in Amharic) is a full-stack web application for the Ethiopian property rental market. It connects property owners with travelers seeking authentic accommodations, from traditional homes to modern hotels, emphasizing local culture, safety, and supporting multiple Ethiopian cities. The platform provides a secure and culturally rich rental experience with robust features for host/property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators. Its business vision is to become the leading platform for Ethiopian hospitality, offering unique cultural immersion and economic opportunities for locals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design

The platform employs a clean and minimal aesthetic with a primary dark brown (`#2d1405`) for headlines and actions, medium brown (`#5a4a42`) for body text, and cream backgrounds (`#faf5f0`, `#f5ece3`, `#faf8f6`). Typography uses Playfair Display for headings and system fonts for body text. UI principles include minimal design with subtle shadows, a clean white header, dark brown buttons, and soft color transitions. All dashboards are fully responsive and mobile-optimized.

### Frontend Architecture

- **Framework**: React with TypeScript (Vite).
- **Routing**: Wouter.
- **UI Components**: Shadcn/ui built on Radix UI.
- **Styling**: Tailwind CSS with an Ethiopian-themed palette.
- **State Management**: React Query for server state.
- **Forms**: React Hook Form with Zod for validation.
- **UI/UX Decisions**: Responsive grid layouts, modal-based checkouts, dual-tab authentication, and Ethiopian-themed design elements.

### Backend Architecture

- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API.
- **Session Management**: Express sessions with PostgreSQL storage.

### Database Design

- **Database**: PostgreSQL with Neon serverless hosting.
- **ORM**: Drizzle ORM.
- **Schema**: Comprehensive schema for users, properties, bookings, reviews, favorites, and verification.
- **Migrations**: Drizzle Kit.

### Authentication & Authorization

- **Methods**: **Passwordless 4-digit OTP authentication** (phone and email) - Similar to ride-sharing apps, users don't need to remember passwords. Auto-generated secure passwords are created in the background for security compliance.
- **Security**: Bcrypt password hashing (32-byte auto-generated passwords), secure session cookies, cryptographically secure 4-digit OTP with 10-minute expiry.
- **Roles**: Guest (default), Host, Admin, Operator with role-based access control.
- **Session Management**: PostgreSQL storage.
- **Authentication Flow**:
  - **Registration**: Enter phone/email + name → Receive 4-digit OTP → Verify → Logged in
  - **Login**: Enter phone/email → Receive 4-digit OTP → Verify → Logged in
  - Legacy password-based authentication routes maintained for backward compatibility

### Security Implementation

- **Web Application Security**: Helmet.js for security headers, CORS protection, rate limiting (100 req/15 min for auth, 500 req/15 min general), request size limits (10MB body, 50MB files).
- **Cryptographic Security**: Secure OTP generation (`crypto.randomInt`), secure session cookies (httpOnly, sameSite), Bcrypt password hashing.
- **Input Validation**: Zod schema validation, file upload validation, user authorization checks.
- **Error Handling**: Production mode hides stack traces and provides secure, generalized error messages.

### Key Features

- **Property Management**: CRUD operations for listings, including image uploads.
- **Enhanced Search & Discovery System**: 
  - Keyword search across property names, descriptions, locations, and addresses
  - Advanced filters: city, property type, price range (min/max), guest capacity, check-in/out dates
  - Sorting options: Recommended (by rating), Price (low-high, high-low), Highest Rated
  - Collapsible filter panel with clean UI
  - Active filter badges with individual clear buttons
  - Visual feedback for search results (count, empty states)
  - Mobile-optimized search experience
  - API limited to 50 results per query for performance
- **Booking System**: Full workflow with date validation and conflict prevention.
- **6-Digit Access Code System**: Automated, auto-generated codes for property access upon payment confirmation, valid from check-in to check-out.
- **Advanced Weighted Review System (ALGA Review Engine)**: Time-decay algorithm (recent reviews weighted more), auto-recalculation of property ratings, 6 rating categories (overall, cleanliness, communication, accuracy, location, value).
- **Universal ID Verification System**: Required for all users. Ethiopian citizens use QR code scanning, foreign visitors use photo upload with OCR (passport, driver's license, national ID). Extracts name, DOB, ID number, expiry, and document type. Operator dashboard for manual review and approval.
- **Payment Gateway**: Integration with **Chapa** (embedded iframe), Stripe, Telebirr, and PayPal. Includes success/cancellation pages and webhooks.
- **Commission & Tax System (ERCA Compliant)**: Automated calculation of 12% Alga commission, 15% VAT on commission, and 2% withholding tax from host earnings. Transparent display in host dashboard and admin financial reports. Automated ERCA-compliant invoice generation in PDF format.
- **Add-On Services Marketplace**: Local service providers (cleaners, laundry, airport pickup, electricians, plumbers, drivers, welcome packs) integrated into booking flow. 15% Alga commission, 85% provider payout. Service provider verification system with ID documents. Available during booking confirmation and in host dashboard for property preparation.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.

## Recent Changes (October 2025)

### Google Maps Integration (Interactive Property Visualization)
- **Component**: `GoogleMapView` using `google-map-react` library
- **Features**:
  - Interactive map with property markers showing price, rating, and image previews
  - Map/List view toggle on properties search page
  - Fullscreen mode with custom controls
  - User location tracking with "Get My Location" button
  - Property clustering and custom Ethiopian-themed markers
  - Single property map view on property details page (zoom level 15)
- **Configuration**: Requires `VITE_GOOGLE_MAPS_API_KEY` in environment variables
- **Fallback**: Graceful degradation when API key is not configured
- **UI/UX**: Seamless toggle between grid and map views, selected property highlighting

### Fayda ID Verification Integration
- **Implementation**: Backend API integration with Ethiopia's National Digital Identity Program (NIDP)
- **Database Schema**: Added `faydaId`, `faydaVerified`, `faydaVerifiedAt`, `faydaVerificationData` to users table
- **Backend Service**: `server/fayda-verification.ts` with sandbox and production modes
- **API Routes**: 
  - `POST /api/fayda/verify` - Verify 12-digit Fayda ID
  - `GET /api/fayda/status` - Check verification status
- **Frontend Component**: `FaydaVerification` with real-time validation and user-friendly UI
- **Features**:
  - 12-digit Fayda ID input with automatic validation
  - Optional date of birth for enhanced verification
  - eKYC integration (Electronic Know Your Customer)
  - Encrypted identity data storage compliant with Digital Identification Proclamation 1284/2023
  - Sandbox mode for development (auto-accepts any 12-digit number)
  - Production mode ready for NIDP partnership credentials
- **Security**: All verification data encrypted, HTTPS required, compliant with Ethiopian data protection laws
- **Documentation**: API docs at https://nidp.atlassian.net/wiki/spaces/FAPIQ/pages/633733136/

### Chapa Payment Integration (Embedded Iframe)
- **Implementation**: Embedded iframe checkout (no redirect) for seamless payment experience
- **Backend Routes**: `/api/payment/chapa/initiate` and `/api/payment/chapa/verify/:tx_ref`
- **Frontend Component**: `ChapaCheckout` component with auto-verification polling
- **Features**: 
  - Real-time payment status verification (polling every 3 seconds)
  - Auto-close on successful payment with visual feedback
  - Support for all Chapa payment methods (cards, mobile money)
  - Booking status auto-update to 'paid' upon verification
  - Transaction reference (`tx_ref`) stored in booking records
- **UI/UX**: Modal-based checkout with embedded payment iframe, success animation, manual verification button
- **Payment Priority**: Chapa listed first in payment methods (recommended for Ethiopian users)

### Alga Services Marketplace - Full Implementation (October 22, 2025)
- **Database Schema**: Created `service_providers` and `service_bookings` tables with full relations
- **Backend API**: Complete REST API for service provider registration, booking, and admin verification
- **Revenue Model**: Automated 15% commission calculation, 85% provider payout tracking
- **Service Types (11 Categories)**: 
  - Cleaning (professional cleaning during/after stay)
  - Laundry (laundry and garment care)
  - Transport (airport pickup, daily drivers, tour cars)
  - Electrical (repairs and installations)
  - Plumbing (fixes and maintenance)
  - Driver Services (personal drivers and transportation)
  - Meal Support (local cooks and meal delivery partners)
  - Local Guides (city tours and cultural experiences)
  - Photography (professional photos and listing optimization)
  - Landscaping (outdoor maintenance and beautification)
  - Welcome Pack (curated welcome amenities for guests)
- **Frontend Pages**:
  - `/services` - Services marketplace with all 11 category cards
  - `/services/:type` - Category-specific provider listings with city/sort filters
  - `/service-providers/:id` - Individual provider profile with booking functionality
  - `/my-alga` - Unified dashboard showing bookings, services, and favorites
  - `/my-services` - Service provider view of jobs (bookings, in-progress, completed)
- **Navigation**: Added "Services" and "My Alga" to main navigation (desktop + mobile)
- **Role-Based Features**:
  - Guests can book services for their stays
  - Hosts can request maintenance/preparation services for properties
  - Providers can register, manage availability, and track earnings
  - Admin/Operators verify providers before approval
- **UI/UX**: Ethiopian color palette (#f6f2ec, #8a6e4b, #86a38f), responsive design, empty states, filter controls
- **Verification**: Service providers undergo ID verification similar to hosts

### Quality & Reputation Layer - Service Reviews & Provider Badges (October 22, 2025)
- **Database Schema**: Created `service_reviews` table with comprehensive rating system
  - Overall rating (1-5 stars, required)
  - 5 detailed categories: Professionalism, Quality, Timeliness, Communication, Value for Money
  - Optional text comments for written feedback
  - Linked to service bookings, providers, and reviewers
- **Backend API**: Complete REST API for review management
  - `POST /api/service-reviews` - Submit review after service completion
  - `GET /api/service-providers/:id/reviews` - Fetch all reviews for a provider
  - `GET /api/service-bookings/:id/review` - Check if booking has been reviewed
  - Auto-calculation of provider rating averages after each review submission
  - `hasReviewed` flag added to service bookings response
- **Frontend Components**:
  - `ServiceReviewForm` - Modal-based review form with 6 rating categories (overall + 5 detailed)
  - `ServiceProviderReviews` - Display component showing rating summary, breakdown bars, and individual reviews
  - `ProviderBadge` - Badge system with 3 achievement types:
    - **Verified** (green) - ID verified by Alga
    - **Top Rated** (amber) - 4.5+ star rating
    - **Experienced** (blue) - 5+ jobs completed
- **Integration Points**:
  - Provider Details Page: Full reviews section with rating breakdown and badge showcase
  - My Services Page: "Write a Review" prompt for completed bookings, "Already Reviewed" indicator
  - Service Category Listings: Provider badges displayed on all provider cards
  - Sorting: Providers can be sorted by rating (highest first)
- **User Flow**: Guest books service → Service completed → Review prompt appears → Submit 6-category review → Provider rating auto-updates → Badge eligibility checked
- **Quality Metrics**: Average ratings calculated across Professionalism, Quality, Timeliness, Communication, and Value dimensions

## External Dependencies

- **Payment Processors**: Chapa (`chapa-nodejs`), Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS (for phone verification).
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.