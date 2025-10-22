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

### Add-On Services Feature
- **Database Schema**: Created `service_providers` and `service_bookings` tables with full relations
- **Backend API**: Complete REST API for service provider registration, booking, and admin verification
- **Revenue Model**: Automated 15% commission calculation, 85% provider payout tracking
- **Service Types**: Cleaning, laundry, airport pickup/drop-off, electrical, plumbing, driver, welcome packs
- **Verification**: Service providers undergo ID verification similar to hosts
- **Integration Points**: Booking confirmation page, host dashboard, admin panel

## External Dependencies

- **Payment Processors**: Chapa (`chapa-nodejs`), Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS (for phone verification).
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.