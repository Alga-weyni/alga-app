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

## Recent Changes (October 2025)

### Navigation & UX Improvements (October 22, 2025)

#### Navigation Hierarchy Refinement
- **Reordered Top Navigation** (user-centered design):
  - **My Alga** (first) - Bold text for primary emphasis (only when authenticated)
  - **Services** (second) - Regular weight for secondary focus
  - **Discover** (last) - Less prominent with map icon 🗺️, smaller font
- **Desktop Navigation**: Professional hierarchy with visual weights and underline animations
- **Mobile Navigation**: 
  - My Alga appears first in dropdown (when authenticated)
  - Services second
  - Discover last with map icon
- **Design Polish**: Emphasizes personalization (My Alga) while maintaining clean, modern Ethiopian aesthetic

#### My Alga Dashboard Enhancement
- **Added Profile & Settings Tile**: New sixth tile for user identity and account preferences
  - Replaces generic "Settings" with more descriptive "Profile & Settings"
  - Links to `/profile` route with comprehensive user information display
- **Clarified Navigation Logic**:
  - `/my-alga` - Main user hub (6 tiles: My Stays, My Services, Payments, Messages, Reviews, Profile & Settings)
  - `/my-services` - User's service bookings with "Browse All Services" CTA
  - `/services` - Public service marketplace for discovery
  - `/profile` - User profile, verification status, and account settings
- **Profile Page Features**:
  - Avatar display with user initials
  - Contact information with verification badges
  - ID verification status (Ethiopian ID and Fayda ID)
  - Settings sections (Notifications, Security, Payments, Language)
  - Back navigation to My Alga dashboard

### Service Provider Onboarding - Streamlined Experience (October 22, 2025)
- **Redesigned `/become-provider` page** with simplified, emotionally inviting UX
- **Hero Section**: 
  - Title: "Earn. Connect. Grow with Alga Services."
  - Subtitle: "Join Ethiopia's trusted network of verified local professionals."
  - Sparkles icon for visual warmth
- **Benefits Strip**: Simplified to 3 core benefits with icons:
  - 💰 Earn More (85% payout)
  - 🪪 Verified Badge (Build trust)
  - ⚡ Fast Payments (Within 24 hours)
- **Service Categories**: Reduced from 11 to 8 focused categories:
  - Cleaning, Laundry, Drivers & Transport, Electrical, Plumbing, Carpentry, Meal Support, Guest Support
  - Card-based design with emoji icons for personality
- **Inline Application Form**: 
  - Single "Start Application" CTA reveals form inline (no page navigation)
  - Form fields: Business Name, Service Category, City, Phone, Description
  - Success toast: "🎉 Application Received! Our team will review and get back within 24 hours."
  - **Backend Integration**: POST `/api/service-provider-applications` endpoint
    - Creates serviceProvider entry with verificationStatus="pending"
    - Sets default pricing (hourly, 0.00 - updated during admin verification)
    - Updates user's isServiceProvider flag
- **Reduced Visual Density**: More breathing space, larger typography, cleaner gradient backgrounds
- **Design Philosophy**: Emotionally inviting, professionally concise, reduces friction while maintaining Ethiopian warmth

### Property Search UX Enhancements (October 22, 2025)
- **Quick City Filter Chips**: One-click filter buttons for top 5 Ethiopian cities (Addis Ababa, Bishoftu, Adama, Hawassa, Bahir Dar)
- **Improved Loading State**: Animated spinner with "Searching properties..." message for instant visual feedback
- **Enhanced Empty State**: Redesigned "No results found" with actionable city suggestions and clear filters button
- **Active Filter Badges**: Visual chips with individual × buttons for quick filter removal
- **Mobile Responsiveness**: Collapsible filter panels optimized for mobile screens
- **TypeScript Safety**: Fixed GoogleMapView type compatibility (null/undefined image handling)
- **Map/List Toggle**: Verified functionality with proper property data formatting

### City Coverage Expansion (October 22, 2025)
- **Expanded to 20 Cities**: Updated from 7 to 20 Ethiopian cities (alphabetically sorted):
  - Adama, Addis Ababa, Arba Minch, Axum, Bahir Dar, Bishoftu, Debre Birhan, Dessie, Dire Dawa, Gondar, Hawassa, Hossana, Jijiga, Jimma, Kombolcha, Lalibela, Mekelle, Nekemte, Shashemene, Wolaita Sodo
- **Centralized Management**: Created `ETHIOPIAN_CITIES` constant in `lib/constants.ts` for consistency
- **Platform-Wide Integration**: Updated all city dropdowns across:
  - Property search and filters
  - Host dashboard (create/edit property)
  - Service marketplace (provider location filters)
  - Search banner and quick filters

### Service Provider Email Notification System (October 22, 2025)
- **SendGrid Integration**: Automated email notifications for provider application lifecycle
- **Email Templates** (Ethiopian-themed HTML with #2d1405 primary color, #f6f2ec backgrounds):
  - **Application Received**: Instant confirmation email upon submission with 24-hour review timeline
  - **Application Approved**: Congratulations email with login instructions and next steps
  - **Application Rejected**: Professional rejection email with specific reasons and reapplication guidance
- **Email Functions** (`server/utils/email.ts`):
  - `sendProviderApplicationReceivedEmail()`: Triggered on POST `/api/service-provider-applications`
  - `sendProviderApprovalEmail()`: Triggered on PATCH `/api/admin/service-providers/:id/approve`
  - `sendProviderRejectionEmail()`: Triggered on PATCH `/api/admin/service-providers/:id/reject`
- **Email Content Features**:
  - Warm, professional Ethiopian tone
  - Playfair Display headings matching brand typography
  - Clear CTAs (View Dashboard, Learn More, Reapply)
  - Contact support information
  - Responsive HTML formatting

### Admin Service Provider Verification Dashboard (October 22, 2025)
- **New Admin Interface** (`/admin/service-providers`):
  - Pending applications list with provider details (business name, service type, city, submitted date)
  - Search functionality by business name
  - Filter by verification status (All, Pending, Approved, Rejected)
  - Approve/Reject modals with inline forms
- **Approval Workflow**:
  - Admin sets pricing model (hourly/flat rate) and base price
  - Updates verificationStatus to "approved"
  - Records verifiedBy (admin user ID) and verifiedAt timestamp
  - Triggers automated approval email
- **Rejection Workflow**:
  - Admin provides rejection reason (required text field)
  - Updates verificationStatus to "rejected"
  - Stores rejectionReason for provider reference
  - Triggers automated rejection email with reason
- **Backend API Endpoints**:
  - `PATCH /api/admin/service-providers/:id/approve`: Approve with pricing
  - `PATCH /api/admin/service-providers/:id/reject`: Reject with reason
  - Both endpoints require admin/operator role authentication
- **Storage Interface Updates**:
  - Changed `updateServiceProvider()` signature to accept `Partial<ServiceProvider>` instead of `Partial<InsertServiceProvider>`
  - Allows updating admin-controlled fields: verificationStatus, rejectionReason, verifiedBy, verifiedAt
  - Maintains type safety while supporting flexible partial updates

### Technical Implementation Details
- **Role-Based Access Control**: Admin dashboard protected by authentication middleware and admin/operator role check
- **Email Reliability**: All status changes trigger immediate email notifications via SendGrid API
- **Database Schema**: Existing serviceProviders table supports verification workflow (no migrations required)
- **User Experience**: Providers receive instant feedback at every step (submit → confirm email → admin review → approval/rejection email)