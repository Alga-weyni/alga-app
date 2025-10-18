# Ethiopia Stays

## Overview

Ethiopia Stays is a property rental platform specifically designed for the Ethiopian market, built as a full-stack web application. The platform connects property owners (hosts) with travelers seeking authentic Ethiopian accommodations, ranging from traditional homes to modern hotels and guesthouses. The application emphasizes local culture, safety features, and supports multiple Ethiopian cities and regions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 18, 2025 - Global Payment Integration (Stripe + Telebirr + PayPal)
- **Stripe Integration** (NEW - Global Payments):
  - Integrated Stripe for worldwide credit/debit card payments
  - Support for multiple currencies: USD, CNY (Chinese Yuan), EUR, GBP, and 135+ others
  - Support for Alipay, WeChat Pay, and other regional payment methods
  - Embedded checkout UI with Stripe Elements (PCI-compliant)
  - Real-time payment confirmation via webhooks
  - Modal-based checkout flow for seamless user experience
  - Backend route: POST `/api/payment/stripe` - Creates PaymentIntent
  - Webhook endpoint: POST `/api/payment/webhook/stripe` - Handles payment events
  - Required secrets: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Payment UI Components**:
  - **Stripe** listed as top payment option (💳 "Global cards - Visa, Mastercard, Alipay, CNY")
  - **Telebirr** marked as "recommended" for Ethiopian users (📱 icon)
  - **PayPal** marked for "international" users (💳 icon)
  - Payment method selection integrated into booking dialog
  - Automatic payment redirect or modal checkout based on payment type
- **Payment Flow Pages**:
  - Created `/booking/success` page with confirmation message and booking details
  - Created `/booking/cancelled` page for failed/cancelled payments with retry option
  - PayPal payment confirmation logic on success page
  - User guidance on next steps after successful payment
- **Booking Integration**:
  - Property details page handles Stripe (modal), Telebirr, and PayPal payment flows
  - Stripe: Opens secure embedded checkout modal after booking creation
  - Telebirr/PayPal: Redirects to external payment gateway
  - ETB to USD conversion for PayPal (approximate rate: 1 USD = 50 ETB)
  - Customer phone number passed to Telebirr for SMS notifications
  - Error handling with toast notifications for payment failures
- **Backend Routes**:
  - POST `/api/payment/stripe` - Create Stripe PaymentIntent (supports USD, CNY, ETB, etc.)
  - POST `/api/payment/webhook/stripe` - Handle payment success/failure events
  - POST `/api/payment/telebirr` - Initiate Telebirr payment
  - POST `/api/payment/paypal` - Create PayPal order
  - POST `/api/payment/confirm/paypal` - Confirm PayPal payment
  - Transaction reference tracking in bookings table via `paymentRef` field
- **Required Secrets** (to be added via Replit Secrets):
  - `STRIPE_SECRET_KEY` - From dashboard.stripe.com (sk_test_... or sk_live_...)
  - `VITE_STRIPE_PUBLIC_KEY` - From dashboard.stripe.com (pk_test_... or pk_live_...)
  - `STRIPE_WEBHOOK_SECRET` - From Stripe webhooks dashboard (whsec_...)
  - `TELEBIRR_APP_ID` - From developer.telebirr.com
  - `TELEBIRR_API_KEY` - From developer.telebirr.com
  - `PAYPAL_CLIENT_ID` - From developer.paypal.com
  - `PAYPAL_SECRET` - From developer.paypal.com
  - `BASE_URL` - Current: https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev
- **NPM Packages Added**:
  - `stripe` - Backend Stripe SDK
  - `@stripe/stripe-js` - Frontend Stripe.js library
  - `@stripe/react-stripe-js` - React components for Stripe Elements
- **Documentation**: Full setup guide available in PAYMENT_SETUP.md

### October 17, 2025 - Mobile App Showcase Section
- **Home Page Enhancement**:
  - Added "Share Your Ethiopian Home" section with two-column layout
  - Left column: Host benefits and "Become a Host" call-to-action
  - Right column: iPhone mockup displaying Ethiopia Stays mobile app
  - "Download the App" button placed below mockup
  - Section positioned between Featured Properties and Quick Stats
  - Ethiopian-themed design with flag colors for bullet points
  - Responsive grid layout for mobile and desktop views

### October 16, 2025 - Role-Based UI Separation & Admin Dashboard
- **Role-Based Navigation System**:
  - Completely separated Guest/Tenant UI from Host UI
  - Header navigation now role-aware:
    - Guests see: "Start Hosting" link (unauthenticated only)
    - Hosts see: "Host Your Property" link
    - Admins/Operators see: Role-specific dashboard links
  - Dropdown menu shows role-specific options:
    - Guest/Tenant: My Bookings, My Favorites
    - Host: My Bookings, My Favorites, Host Dashboard
    - Admin: Admin Dashboard
    - Operator: Operator Dashboard
  - Role badge displayed in user dropdown menu
  - Removed host-specific features from guest home page

### October 17, 2025 - Operator Dashboard Implementation
- **Operator Dashboard**:
  - Created comprehensive operator dashboard at `/operator/dashboard`
  - Two main tabs: Host Verification and Property Verification
  - Host Verification tab:
    - View pending verification documents (ID, passport, property deed, business license)
    - Preview documents with external link
    - Approve or reject documents with rejection reasons
    - Shows host details (name, email, phone)
  - Property Verification tab:
    - View pending properties awaiting approval
    - Review property details (type, location, pricing, capacity)
    - Preview property images
    - Approve properties to list them live
    - Reject properties with detailed feedback to host
  - Real-time counts of pending items in tab headers
  - Backend API routes for operators:
    - `/api/operator/pending-documents` - Get pending verification docs
    - `/api/operator/pending-properties` - Get pending properties
    - `/api/operator/documents/:id/approve` - Approve document
    - `/api/operator/documents/:id/reject` - Reject with reason
    - `/api/operator/properties/:id/approve` - Approve property
    - `/api/operator/properties/:id/reject` - Reject with reason
  - Added storage methods: `getPendingVerificationDocuments()`, `getPendingProperties()`
  - Operator privilege: Review and verify guesthouse owner details and ensure documentation/specifications are met before property listing
  - Fixed login redirect: Operators now automatically redirected to `/operator/dashboard` (no longer see guest home page)
  
- **Admin Dashboard Enhancements**:
  - Added 5-tab admin interface: System Overview, User Management, Property Verification, ID Verification, System Config
  - System statistics and role distribution dashboard
  - Admin-specific sign out button
  - Operator management panel
  - Platform settings control
  
- **Start Hosting Page** (`/start-hosting`):
  - Dedicated onboarding page for first-time hosts
  - Host account registration form with validation
  - Benefits showcase for potential hosts
  - Automatic redirect based on role after registration

### October 17, 2025 - Dual Authentication System Implementation
- **Authentication Methods**:
  1. **Phone + Password + OTP**: Ethiopian phone number (+251XXXXXXXXX) with password and 4-digit SMS OTP verification
  2. **Email + Password**: Traditional email/password authentication (no OTP required)
- **Phone Authentication Flow**:
  - Registration: User provides phone (+251XXXXXXXXX), password, name → Receives 4-digit OTP → Verifies OTP → Account created and logged in
  - Login: User provides phone and password → Receives 4-digit OTP → Verifies OTP → Logged in
  - OTP expires after 10 minutes
  - Phone number must be verified before account is fully activated
- **Email Authentication Flow**:
  - Registration: User provides email, password, name → Account created and logged in immediately (no OTP)
  - Login: User provides email and password → Logged in immediately
- **Security**: 
  - All passwords hashed with bcrypt (10 salt rounds)
  - OTP stored in database with expiry timestamp
  - Phone numbers and emails are unique identifiers (nullable - users can have either email OR phone)
- **Role System**: 
  - Guest (default for new registrations)
  - Host (can list properties)
  - Admin (full system access - must be assigned by existing admin)
  - Operator (property verification)
- **SMS Integration**: 
  - Development mode: OTP displayed in console and returned in API response
  - Production mode: Ready for Twilio or Ethiopian Telecom SMS API integration
  - Note: User dismissed Twilio integration setup - credentials can be added as secrets later
- **Frontend**: 
  - Unified AuthDialog component used across entire site
  - Dual-tab auth dialog (Phone/Email tabs)
  - Separate forms for phone and email authentication
  - OTP verification screen for phone auth
  - Role-based redirects after authentication (admin → /admin/dashboard, operator → /operator/dashboard, host → /host/dashboard, guest → /)
  - Custom redirect support: Pages can specify redirect path via `redirectAfterAuth` prop
  - Start Hosting page now uses unified AuthDialog (consistent behavior)
  - Session-based authentication with PostgreSQL storage
  - Secure logout with session destruction
- **Database Fixes**:
  - Added OTP columns (otp, otp_expiry) to users table via SQL
  - Made email column nullable to support phone-only registration
  - Fixed favorites page to correctly display favorited properties

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with a simple, declarative approach
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with a custom Ethiopian-themed color palette (green, yellow, red from the flag)
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Forms**: React Hook Form with Zod schema validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules throughout the codebase
- **API Design**: RESTful API structure with organized route handlers
- **Session Management**: Express sessions with PostgreSQL storage for scalability
- **Development**: Hot reload enabled with Vite integration for seamless development experience

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Comprehensive schema covering users, properties, bookings, reviews, favorites, and verification systems
- **Migrations**: Drizzle Kit for database schema migrations and version control

### Authentication & Authorization
- **Provider**: Custom email/password authentication with bcrypt hashing
- **Session Management**: Express sessions with PostgreSQL storage (connect-pg-simple)
- **Security**: 
  - Bcrypt password hashing (salt rounds: 10)
  - Secure session cookies (httpOnly, secure in production)
  - SESSION_SECRET environment variable required (fails fast if missing)
- **User Management**: Role-based access control (admin, host, guest)
  - New registrations: Forced to "guest" role (no self-service privilege escalation)
  - Role promotion: Admin-only through /api/admin/users/:userId/role endpoint
  - Protected routes: isAuthenticated middleware validates session and loads user

### Key Features Architecture
- **Property Management**: Full CRUD operations for property listings with image uploads and detailed descriptions
- **Booking System**: Complete booking workflow with date validation and conflict prevention
- **Review System**: User-generated reviews and ratings for properties
- **Verification System**: 
  - Phone verification using Ethiopian Telecom SMS service
  - ID document verification for hosts and tenants
  - Multi-stage verification process for enhanced security
- **International Support**: Multi-language support with Ethiopian localization (Amharic, English)
- **Safety Features**: Location sharing, emergency contacts, and safety check-ins

### Security Features
- **Input Validation**: Comprehensive validation using Zod schemas on both client and server
- **CSRF Protection**: Built-in session security with secure cookie configuration
- **Data Sanitization**: Type-safe operations through TypeScript and Drizzle ORM
- **File Upload Security**: Secure handling of document uploads for verification

## External Dependencies

### Payment Processing
- **PayPal SDK**: International payment processing for global travelers
- **Ethiopian Payment Methods**: Integration ready for local payment services (Telebirr, CBE Birr)

### Communication Services
- **SMS Service**: Ethiopian Telecom integration for phone verification
- **Development Mode**: Console logging fallback when SMS credentials are not configured

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time capabilities through WebSocket constructor configuration

### Development Tools
- **Replit Integration**: Native Replit development environment support with cartographer plugin
- **Error Handling**: Runtime error overlay for development debugging
- **Build Tools**: ESBuild for production builds with platform-specific optimizations

### UI & Design
- **Radix UI**: Comprehensive primitive components for accessible UI building
- **Lucide Icons**: Consistent icon library throughout the application
- **Custom Fonts**: Ethiopian-appropriate typography and design elements

### Utility Libraries
- **Date Handling**: date-fns for robust date manipulation and formatting
- **Utility Functions**: clsx and tailwind-merge for conditional styling
- **Memoization**: Memoizee for performance optimization of expensive operations