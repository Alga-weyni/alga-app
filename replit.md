# Ethiopia Stays

## Overview

Ethiopia Stays is a full-stack web application designed for the Ethiopian property rental market. It connects property owners with travelers seeking authentic Ethiopian accommodations, from traditional homes to modern hotels. The platform emphasizes local culture, safety, and supports multiple Ethiopian cities and regions, aiming to provide a secure and culturally rich rental experience. It includes robust features for host and property verification, diverse payment options, and role-based access for guests, hosts, operators, and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite.
- **Routing**: Wouter for client-side routing.
- **UI Components**: Shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS with an Ethiopian-themed color palette.
- **State Management**: React Query for server state management.
- **Forms**: React Hook Form with Zod for validation.
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

### Key Features Architecture
- **Property Management**: CRUD for listings, including image uploads.
- **Booking System**: Full workflow with date validation and conflict prevention.
- **Review System**: User-generated ratings and reviews.
- **Verification System**:
    - **Ethiopian ID Scanner**: `ScanID` component for identity verification using QR code scanning or OCR (Tesseract.js for Amharic/English) from photo uploads. Updates `idVerified` in the database.
    - **Operator Dashboard**: Dedicated dashboard (`/operator/dashboard`) for operators to review and approve/reject host verification documents (ID, passport, property deed, business license) and property listings.
    - Phone verification readiness for Ethiopian Telecom SMS.
    - Multi-stage verification process for hosts and tenants.
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