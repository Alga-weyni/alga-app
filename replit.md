# Alga

## Overview
Alga is a full-stack web application for the Ethiopian property rental market, connecting property owners with travelers. It offers diverse accommodations, emphasizing local culture, safety, and multi-city support across Ethiopia. The platform provides a secure, culturally immersive rental experience through host/property verification, varied payment options, and role-based access for guests, hosts, operators, and administrators. Alga aims to be the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates (October 25, 2025)

### Progressive Web App (PWA) Implementation (Latest)
Alga is now a fully installable Progressive Web App optimized for Ethiopian mobile networks:
- **Installable**: Users can add Alga to home screen (iOS & Android) without app stores
- **Offline Support**: Service worker caches pages, images, and API responses for offline access
- **Network Optimization**: 12-second API timeouts for 3G/4G, aggressive image caching (30 days)
- **Install Prompt**: Auto-prompts users to install app (dismissible)
- **Offline Indicator**: Visual banner shows connection status
- **App Store Compliance**: Privacy, Terms, and Account Deletion policy pages created
- **Ethiopia-Optimized**: Cache-first for images, network-first for APIs with fallback
- **Tech Stack**: vite-plugin-pwa, Workbox service worker, manifest.json with Alga branding
- **Icons**: AI-generated app icon (brown/gold Ethiopian home design) at 192x192 and 512x512
- **Documentation**: Complete PWA implementation guide in `docs/PWA_IMPLEMENTATION.md`

### Property Insights Dashboard Widget
Implemented comprehensive analytics widget for host dashboard with real-time backend data:
- **Backend**: Created `/api/host/stats` endpoint with `getHostStats()` method in storage
- **Frontend**: Built `PropertyInsights` component with 8 key metrics in responsive grid
- **Metrics Displayed**:
  - Active Listings (with total count)
  - Upcoming Bookings (with total bookings)
  - Total Earnings (with last payout amount)
  - Average Rating (with total reviews)
  - Completed Bookings (with occupancy rate %)
  - Occupancy Rate percentage
  - Pending Reviews (action needed)
  - Total Bookings (all-time)
- **Features**: Skeleton loading states, color-coded icons, hover effects, fully responsive
- **Integration**: Displays below HostBanner on `/host/dashboard` page
- **Tech**: Real PostgreSQL queries using Drizzle ORM, React Query for data fetching

## System Architecture

### UI/UX Design
The platform features a universal accessibility design optimized for Ethiopian users, utilizing a warm color palette (dark brown, medium brown, cream backgrounds). Key design principles include Airbnb-style minimal navigation, a soft cream header, smooth underline animations, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded, compressed images for performance on Ethiopian networks.

### Technical Implementation
The frontend is built with React, TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, and React Hook Form with Zod for validation. The backend uses Node.js with Express.js and TypeScript, providing a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL is the database, hosted on Neon, managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control for Guest, Host, Admin, and Operator roles. Security measures include Helmet.js, CORS protection, rate limiting, and robust validation.

### Feature Specifications
- **Ask Lemlem Help Page**: A culturally authentic AI agent named Lemlem (after a grandmother) guides users through help topics with Ethiopian proverbs and a direct chat integration. Navigation shows "Ask Lemlem."
- **Property Management**: CRUD operations for listings, image uploads, and an enhanced host dashboard with Ethiopian-context suggestions.
- **User Profiles & Personalization**: Comprehensive user profiles with preferences (notifications, language, currency, search settings) and activity tracking stored in JSONB for personalized recommendations.
- **User Settings**: Notification, security, payment, and language preferences.
- **Enhanced Search & Discovery**: Keyword search, advanced filters, sorting, and city filter chips.
- **Booking System**: Full workflow with date validation and conflict prevention.
- **Access Management**: 6-digit access code system for properties.
- **Review System**: Advanced weighted review system (ALGA Review Engine) with time-decay algorithm.
- **ID Verification**: Universal system with QR code scanning, OCR for foreign visitors, operator review dashboard, and integration with Fayda ID for eKYC.
- **Alga Pay**: A white-labeled, unified payment gateway abstracting underlying processors (Chapa, Stripe, Telebirr) from users. All payment interactions show only "Alga Pay" branding.
- **Commission & Tax System**: Automated calculation of Alga commission, VAT, and withholding tax, with ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Browsing for guests and application for providers, featuring 11 service categories, reviews, and provider badges.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Google Maps Integration**: Lightweight mini-map on property details pages showing location and GPS-calculated distance from user, using the static map API.
- **Provider Onboarding & Dashboard**: Complete application process with admin verification, automated email notifications, and status-based UX.
- **Self-Care at Home**: Mobile beauty services category with specialty filtering, time slot booking, and GPS-powered neighborhood search for hyper-local service discovery.
- **Meal Support**: On-demand food delivery marketplace connecting guests with local home cooks and restaurants, featuring GPS-based filtering, cuisine categories, and integrated payment.
- **Lemlem AI Agent**: A 24/7, cost-optimized AI agent with a smart template system and optional AI fallback. Personalization includes greetings and responses in English, Amharic, Tigrinya, Afaan Oromoo, and Chinese. Features a bilingual chat button, in-chat language dropdown, and multilingual grandmother voice using browser-based Text-to-Speech. Hosts configure Lemlem's responses via a 14-field form. Admin features include an insights dashboard for analytics and an AI control panel for budget management.
- **Administrative Features**: Roles & Permissions Management, and User Management with full control over user roles, status, and verification states.

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid.
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping & Location**: Google Maps Geocoding API.
- **File Storage**: Replit App Storage (Google Cloud Storage).
- **AI Services**: Replit AI Integration.
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.