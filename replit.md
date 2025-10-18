# Alga

## Overview

Alga ("bed" in Amharic) is a full-stack web application designed for the Ethiopian property rental market. It connects property owners with travelers seeking authentic Ethiopian accommodations, from traditional homes to modern hotels. The platform emphasizes local culture, safety, and supports multiple Ethiopian cities and regions, aiming to provide a secure and culturally rich rental experience. It includes robust features for host and property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## Design System (Updated Oct 18, 2025)

### Color Palette - Clean & Minimal Aesthetic
- **Primary Dark Brown**: `#2d1405` - Headlines, buttons, icons, primary text
- **Medium Brown**: `#5a4a42` - Body text, secondary elements
- **Cream Backgrounds**: `#faf5f0`, `#f5ece3`, `#faf8f6` - Section backgrounds
- **Card Borders**: `#e5ddd5` - Subtle cream borders for cards
- **White**: `#ffffff` - Card backgrounds, header background

### Typography
- **Headings**: Playfair Display (serif) - elegant, classic Italian style
- **Italic Usage**: Artistic taglines (e.g., "From Axum to Arba Minch")
- **Body Text**: System fonts for readability
- **Transitions**: 200ms standard for all hover effects

### UI Principles
- Minimal design with subtle shadows (no heavy glows)
- Clean white header with subtle border
- Dark brown buttons throughout (no bright orange)
- Cream/white card backgrounds with refined borders
- Soft, sophisticated color transitions

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite.
- **Routing**: Wouter for client-side routing.
- **UI Components**: Shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS with an Ethiopian-themed color palette.
- **State Management**: React Query for server state management.
- **Forms**: React Hook Form with Zod for validation.
- **Mobile Optimization**: All dashboards (Host, Admin, Operator) fully responsive with:
    - Responsive headers and stat grids (2-column layout on mobile)
    - Compact tab navigation with abbreviated labels
    - Mobile-first padding and spacing
    - Touch-friendly button sizing
- **UI/UX Decisions**: Incorporates Shadcn/ui tabs, responsive grid layouts, modal-based checkouts, and a dual-tab authentication dialog. Features like the "Share Your Ethiopian Home" section with an iPhone app mockup and Ethiopian-themed design elements are integrated into the home page.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API.
- **Session Management**: Express sessions with PostgreSQL storage.

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting.
- **ORM**: Drizzle ORM for type-safe operations.
- **Schema**: Comprehensive schema for users, properties, bookings, reviews, favorites, and verification.
- **Migrations**: Drizzle Kit for schema management.

### Authentication & Authorization
- **Authentication Methods**:
    1. Phone + Password + 4-digit SMS OTP (for Ethiopian numbers).
    2. Email + Password.
- **Security**: Bcrypt password hashing (10 salt rounds), secure session cookies, OTP with expiry.
- **Role-Based Access Control**: Guest (default), Host, Admin, Operator roles with specific dashboards and access rights.
- **Session Management**: PostgreSQL storage for sessions.

### Security Implementation (Oct 18, 2025)
- **Web Application Security**:
    - **Helmet.js**: Comprehensive security headers (HSTS, X-Frame-Options, CSP, etc.)
    - **CORS Protection**: Configured with credentials support and origin validation
    - **Rate Limiting**: 
        - Authentication endpoints: 100 requests per 15 minutes
        - General endpoints: 500 requests per 15 minutes
    - **Request Size Limits**: 10MB body, 50MB file uploads (DoS prevention)
- **Cryptographic Security**:
    - **Secure OTP Generation**: Uses `crypto.randomInt()` instead of Math.random()
    - **Session Security**: Custom session name, httpOnly cookies, sameSite protection
    - **Password Hashing**: Bcrypt with 10 salt rounds
- **Input Validation & Sanitization**:
    - Zod schema validation on all API endpoints
    - File upload validation with size and type restrictions
    - User authorization checks on document uploads
- **Error Handling**: 
    - Production mode hides stack traces to prevent information leakage
    - Secure error messages without exposing internal details

### Key Features Architecture
- **Property Management**: CRUD for listings, including image uploads.
- **Advanced Property Search**: Multi-parameter search API with:
    - **Keyword Search**: Full-text search across title, description, location, and address fields
    - **Filters**: City, property type, price range (min/max), guest capacity, availability dates
    - **Sorting Options**: 
        - `recommended` - Highest rated properties first (default)
        - `price_asc` - Lowest to highest price
        - `price_desc` - Highest to lowest price
        - `rating_desc` - Highest rated properties
    - **Performance**: Limited to 50 results per query for optimal performance
- **Booking System**: Full workflow with date validation and conflict prevention.
- **6-Digit Access Code System**: Automated property access management
    - **Auto-Generation**: Codes automatically created when payment is confirmed (Telebirr, Stripe, PayPal)
    - **Format**: 6-digit numeric codes for easy entry
    - **Validity Period**: Active from check-in to check-out dates
    - **Status Tracking**: Active, expired, or revoked states
    - **Guest Display**: Prominently shown on booking success page with validity dates
    - **API Access**: Routes for retrieving codes by booking ID or all guest codes
- **Advanced Weighted Review System (ALGA Review Engine)**: 
    - **Time-Decay Algorithm**: Recent reviews weighted more heavily with 3-month decay curve
    - **Weight Formula**: `weight = 1 / (1 + ageDays / 90)` 
    - **Auto-Recalculation**: Property ratings recalculate automatically after each new review
    - **Rating Categories**: 6 categories (overall, cleanliness, communication, accuracy, location, value)
    - **Display**: Shows both weighted average and total review count
- **Universal ID Verification System** (REQUIRED FOR ALL USERS):
    - **Ethiopian Citizens**: Digital ID QR code scanning via `qr-scanner` library (`/scan-id` page)
    - **Foreign Visitors**: Photo upload (passport, driver's license, national ID) with OCR via Tesseract.js
    - **Document Types Supported**: 
        - `ethiopian_id` - Ethiopian Digital ID (QR scan)
        - `passport` - International passports (photo OCR)
        - `drivers_license` - Driver's licenses (photo OCR)
        - `other` - Other government-issued IDs (photo OCR)
    - **Universal Scanner Component**: `UniversalIDScanner` with tabbed interface for QR scan vs photo upload
    - **Automatic Data Extraction**: System automatically extracts and displays:
        - First Name (required)
        - Middle Name (optional) - extracted when available from 3+ word names
        - Last Name (required)
        - Date of Birth
        - ID Number
        - Expiry Date (when applicable)
    - **Database Tracking**: `idVerified`, `idNumber`, `idFullName`, `idDocumentType`, `idExpiryDate`, `idCountry` fields in users table
    - **Verification Check Component**: `IDVerificationCheck` for enforcing requirements and showing verification status
    - **Operator Dashboard**: Dedicated dashboard (`/operator/dashboard`) for operators to review and approve/reject host verification documents and property listings.
    - Phone verification readiness for Ethiopian Telecom SMS.
    - Multi-stage verification process for all user types.
- **Payment Gateway**: Integration with Stripe for global credit/debit card payments (supporting 135+ currencies, Alipay, WeChat Pay), Telebirr for local Ethiopian payments, and PayPal for international users. Includes dedicated success/cancellation pages and webhook handling.
- **International Support**: Multi-language support (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.

## External Dependencies

- **Payment Processors**:
    - Stripe (for global credit/debit cards, Alipay, WeChat Pay)
    - PayPal SDK (for international payments)
    - Telebirr (for local Ethiopian payments)
- **Communication Services**:
    - Ethiopian Telecom SMS (ready for integration for phone verification)
- **Database & Hosting**:
    - Neon Database (serverless PostgreSQL)
- **Identity Verification**:
    - `html5-qrcode` (for QR code scanning)
    - `tesseract.js` (for OCR on ID documents)
- **UI & Design**:
    - Radix UI
    - Lucide Icons
    - Custom Fonts
- **Utility Libraries**:
    - `date-fns` (for date handling)
    - `clsx`, `tailwind-merge` (for styling utilities)
    - `memoizee` (for performance optimization)

## Recent Updates (Oct 18, 2025)

### Production Readiness Enhancements
- **Deployment Configuration**: Configured autoscale deployment with build and start scripts
- **Sample Data**: Added 12 diverse Ethiopian properties spanning:
    - Addis Ababa (modern hotels)
    - Lalibela (rock-hewn church heritage homes)
    - Gondar (mountain lodges)
    - Bahir Dar (lakeside retreats)
    - Hawassa (luxury villas)
    - Harar (cultural guesthouses)
    - Axum (heritage palaces - Tigray)
    - Dire Dawa (railway station inns)
    - Arba Minch (paradise lodges with twin lake views)
    - Jinka (tribal experience houses)
    - Bishoftu (resort & spa - Oromia)
    - Goba (Bale Mountain eco-lodges - Oromia)

### SEO & Performance
- **SEO Meta Tags**: Added comprehensive SEO support with dynamic titles and descriptions
- **Open Graph Tags**: Social media sharing optimization (Facebook, Twitter, LinkedIn)
- **Loading States**: Implemented PropertyGridSkeleton for better perceived performance
- **Error Boundaries**: React error boundaries for graceful error handling and recovery

### UI/UX Improvements
- **Loading Skeletons**: Smooth loading transitions with animated placeholders
- **Error Handling**: User-friendly error messages with recovery options
- **Page Titles**: Dynamic page titles based on content (e.g., "Addis Ababa Stays - Alga")
- **Meta Descriptions**: Search engine optimized descriptions for all major pages