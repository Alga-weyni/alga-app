# Alga

## Overview
Alga is a full-stack web application designed for the Ethiopian property rental market. It aims to connect property owners with travelers seeking authentic accommodations, ranging from traditional homes to modern hotels, with a strong emphasis on local culture, safety, and multi-city support across Ethiopia. The platform provides a secure and culturally rich rental experience through robust features like host/property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators. Alga's vision is to become the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities for local communities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design
The platform features a clean, minimal aesthetic with a primary dark brown (`#2d1405`) for headlines, medium brown (`#5a4a42`) for body text, and cream backgrounds (`#faf5f0`, `#f5ece3`, `#faf8f6`). Typography utilizes Playfair Display for headings and system fonts for body text. Design principles include minimal design with subtle shadows, a clean white header, dark brown buttons, soft color transitions, and fully responsive, mobile-optimized dashboards. Ethiopian-themed design elements and color palettes are integrated throughout.

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
- **Methods**: Passwordless 4-digit OTP authentication (phone and email), similar to ride-sharing apps, with auto-generated secure passwords for compliance.
- **Security**: Bcrypt password hashing (32-byte auto-generated passwords), secure session cookies, cryptographically secure 4-digit OTP with 10-minute expiry.
- **Roles**: Guest (default), Host, Admin, Operator with role-based access control.
- **Authentication Flow**: Registration and login via phone/email and OTP verification.

### Security Implementation
- **Web Application Security**: Helmet.js for security headers, CORS protection, rate limiting, request size limits.
- **Cryptographic Security**: Secure OTP generation, secure session cookies, Bcrypt password hashing.
- **Input Validation**: Zod schema validation, file upload validation, user authorization checks.
- **Error Handling**: Production mode hides stack traces and provides secure, generalized error messages.

### Key Features
- **Property Management**: CRUD operations for listings, including image uploads.
- **Enhanced Search & Discovery**: Keyword search, advanced filters (city, property type, price, capacity, dates), sorting options, collapsible filter panel, active filter badges, and mobile optimization.
- **Booking System**: Full workflow with date validation and conflict prevention.
- **6-Digit Access Code System**: Automated, auto-generated codes for property access upon payment confirmation, valid from check-in to check-out.
- **Advanced Weighted Review System (ALGA Review Engine)**: Time-decay algorithm for property ratings, 6 rating categories.
- **Universal ID Verification System**: Required for all users. Ethiopian citizens use QR code scanning, foreign visitors use photo upload with OCR (passport, driver’s license, national ID). Operator dashboard for manual review.
- **Payment Gateway**: Integration with Chapa, Stripe, Telebirr, and PayPal, including webhooks.
- **Commission & Tax System (ERCA Compliant)**: Automated calculation of Alga commission (12%), VAT on commission (15%), and withholding tax from host earnings (2%). Automated ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Integration of local service providers (cleaning, laundry, transport, etc.) into the booking flow with commission tracking. Service provider verification system.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Google Maps Integration**: Interactive map with property markers, map/list view toggle, fullscreen mode, user location tracking, clustering, and custom Ethiopian-themed markers.
- **Fayda ID Verification Integration**: Backend API integration with Ethiopia's National Digital Identity Program (NIDP) for eKYC.
- **Alga Services Marketplace**: Full implementation of a services marketplace with provider registration, booking, and administrative verification. Includes 11 service categories.
- **Quality & Reputation Layer**: Service reviews with 6 detailed categories (Professionalism, Quality, Timeliness, Communication, Value for Money) and provider badges (Verified, Top Rated, Experienced).

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS (for phone verification).
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping**: `google-map-react`.
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.