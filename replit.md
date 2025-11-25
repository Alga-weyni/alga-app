# Alga

## Overview
Alga (አልጋ - "bed" in Amharic) is a short-term rental platform for the Ethiopian hospitality market, akin to Airbnb. It integrates a comprehensive Lemlem Operations Dashboard for administrative control. The platform aims to connect property owners with travelers, offering diverse, culturally immersive, and secure accommodations across Ethiopia. Alga seeks to become the leading Ethiopian hospitality platform, fostering cultural immersion and economic opportunities, and addresses the cold start problem by incentivizing informal property agents ("Delalas") through a commission system to rapidly expand listings. The business model focuses exclusively on short-term hospitality rentals.

## User Preferences
Preferred communication style: Simple, everyday language.

Company Identity: Alga is a women-run, women-owned, and women-operated company. All guidance, materials, and communications should reflect and honor this foundation.

## System Architecture

### UI/UX Design
The platform features a universal accessibility design for Ethiopian users, using a warm color palette (dark brown, medium brown, cream backgrounds). It incorporates Airbnb-style minimal navigation, a soft cream header, smooth underline animations, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded, compressed images for performance on Ethiopian networks. It is available as a Progressive Web App (PWA) and has native Android and iOS applications via Capacitor, with distinct UI patterns for mobile (bottom navigation, minimal header).

### Technical Implementation
The frontend is built with React, TypeScript (Vite), React Router for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query v5 for server state management, and React Hook Form with Zod for validation. The backend utilizes Node.js, Express.js, and TypeScript, providing a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL, hosted on Neon, is managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control (Guest, Host, Admin, Operator). Security measures include Helmet.js, CORS protection, rate limiting, robust validation, and INSA government-grade security hardening for OWASP Top 10 vulnerabilities.

### Feature Specifications
- **Personalized Onboarding System**: Browser-native animated welcome experience for all user roles.
- **Electronic Signature Compliance System**: Click-to-sign system adhering to Ethiopian regulations, with AES-256 encryption, SHA-256 hashing, and an Admin Signature Dashboard.
- **Delala Agent Commission System**: Incentivizes property agents with a 5% commission on bookings for 36 months, with tracking and admin verification.
- **Ask Lemlem Help Page & AI Assistant**: Culturally authentic AI agent with Ethiopian proverbs, multilingual support, and browser-native offline capabilities.
- **Property Management**: Comprehensive CRUD for listings, image uploads, and an enhanced host dashboard.
- **User Profiles & Personalization**: Detailed user profiles for personalized recommendations.
- **Enhanced Search & Discovery**: Advanced search with keyword, filters, sorting, and city chips.
- **Booking System**: Complete booking workflow with date validation and conflict prevention.
- **Access Management**: TTLock 4-digit PIN system with time-limited offline codes via SMS/WhatsApp.
- **Review System**: Advanced weighted review system (ALGA Review Engine) with a time-decay algorithm.
- **ID Verification**: Universal system with QR/OCR scanning, operator review dashboard, and Fayda ID eKYC integration.
- **Alga Pay**: White-labeled, unified payment gateway.
- **Commission & Tax System**: Automated calculation of Alga commission, VAT, and withholding tax, with ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Allows guests to browse and providers to apply for services across 11 categories.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, and safety check-ins.
- **Alga Secure Access System**: Requires smart lockboxes (e.g., TTLock-compatible) and security cameras at all properties for guest safety and incident documentation, with a vendor-agnostic design.
- **Google Maps Integration**: Lightweight mini-map on property details pages.
- **Administrative Features**: Roles & Permissions Management and User Management.
- **Lemlem Operations Dashboard**: Comprehensive admin dashboard for 5 operational pillars, with real-time KPIs, AI admin assistant, workflow automation, and CSV export.
- **Lemlem Operations Intelligence (v3)**: Browser-native admin intelligence hub for natural language queries, automated weekly executive summaries, AI predictive insights, and voice commands.
- **Feature Flags System**: Admin-controlled toggles for features during INSA compliance testing.
- **Enterprise Financial Settlement Engine**: Multi-party settlement system with multi-currency wallets, double-entry ledger, automatic commission splits (80% owner / 5% Dellala / 15% corporate), automated tax calculation (15% VAT, 2% withholding), real-time FX management, automated weekly Dellala payouts (Telebirr/bank transfer), daily/weekly automated reconciliation, and INSA-compliant SHA-256 hashed audit logs. API routes are under `/api/settlement/*`.
- **Pricing Freedom Policy**: Hosts have complete freedom to change nightly rates at any time without administrative approval. The system will use positive incentives (e.g., "Fair Price Badge", visibility boosts) and data-driven guidance (e.g., "Recommended Price Range", analytics) to encourage competitive pricing, rather than restrictions or enforcement of rent-control laws, which do not apply to short-term hospitality rentals.

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid.
- **Database**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping & Location**: Google Maps Geocoding API.
- **Smart Lock Integration**: TTLock Open Platform API and SDK.
- **File Storage**: Replit App Storage (Google Cloud Storage).
- **AI Services**: Replit AI Integration.
- **Mobile Frameworks**: Capacitor (native iOS/Android), `vite-plugin-pwa` (Progressive Web App).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.