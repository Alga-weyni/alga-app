# Alga

## Overview
Alga is a full-stack web application for the Ethiopian property rental market. It connects property owners with travelers seeking authentic accommodations, from traditional homes to modern hotels, emphasizing local culture, safety, and multi-city support across Ethiopia. The platform offers a secure, culturally rich rental experience through features like host/property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators. Alga aims to be the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design
The platform features a clean, minimal aesthetic with a primary dark brown (`#2d1405`) for headlines, medium brown (`#5a4a42`) for body text, and cream backgrounds (`#faf5f0`, `#f5ece3`, `#faf8f6`). Typography uses Playfair Display for headings and system fonts for body text. Design principles include minimal design with subtle shadows, a clean white header, dark brown buttons, soft color transitions, and fully responsive, mobile-optimized dashboards. Ethiopian-themed design elements and color palettes are integrated throughout.

### Technical Implementation
- **Frontend**: React with TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, React Hook Form with Zod for validation.
- **Backend**: Node.js with Express.js, TypeScript (ES modules), RESTful API, Express sessions with PostgreSQL storage.
- **Database**: PostgreSQL (Neon serverless hosting), Drizzle ORM, Drizzle Kit for migrations. Schema covers users, properties, bookings, reviews, favorites, and verification.
- **Authentication**: Passwordless 4-digit OTP (phone/email), Bcrypt for password hashing (32-byte auto-generated), secure session cookies, cryptographically secure OTP with 10-minute expiry. Supports Guest, Host, Admin, Operator roles with role-based access control.
- **Security**: Helmet.js, CORS protection, rate limiting, request size limits, Zod schema validation, file upload validation, secure error handling.

### Key Features
- **Property Management**: CRUD operations for listings, image uploads.
- **Enhanced Search & Discovery**: Keyword search, advanced filters (city, type, price, capacity, dates), sorting, collapsible filter panel, active filter badges, city filter chips.
- **Booking System**: Full workflow with date validation and conflict prevention.
- **6-Digit Access Code System**: Automated, auto-generated codes for property access upon payment confirmation.
- **Advanced Weighted Review System (ALGA Review Engine)**: Time-decay algorithm, 6 rating categories.
- **Universal ID Verification System**: QR code scanning for Ethiopians, OCR for foreign visitors (passport, license, national ID). Operator dashboard for manual review. Integrated with Fayda ID for eKYC.
- **Payment Gateway**: Integration with Chapa, Stripe, Telebirr, and PayPal, including webhooks.
- **Commission & Tax System (ERCA Compliant)**: Automated calculation of Alga commission (12%), VAT on commission (15%), and withholding tax from host earnings (2%). Automated ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Integration of local service providers (cleaning, laundry, transport, etc.) with commission tracking and provider verification. Includes 11 service categories with reviews and provider badges (Verified, Top Rated, Experienced).
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Google Maps Integration**: Interactive map with property markers, map/list view toggle, user location tracking, clustering, custom Ethiopian-themed markers.
- **Provider Onboarding Flow**: Streamlined application process with email notifications (SendGrid) and an admin verification dashboard.
- **Provider Dashboard**: Status-based UX for pending, rejected, and approved providers, showing application status or full dashboard features (stats, bookings, ratings).

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid (for emails).
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping**: `google-map-react`.
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.