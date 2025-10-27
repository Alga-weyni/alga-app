# Alga

## Overview
Alga (አልጋ - "bed" in Amharic) is a full-stack web application designed for the Ethiopian property rental market. It aims to connect property owners with travelers, offering a diverse range of accommodations with a focus on local culture, safety, and multi-city support across Ethiopia. The platform seeks to provide a secure and culturally immersive rental experience through host/property verification, varied payment options, and role-based access for guests, hosts, operators, and administrators. Alga's ambition is to become the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities. The platform also addresses the cold start problem by incentivizing informal property agents ("Delalas") through a commission system, aiming to rapidly expand property listings.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design
The platform employs a universal accessibility design optimized for Ethiopian users, featuring a warm color palette (dark brown, medium brown, cream backgrounds). Design principles include Airbnb-style minimal navigation, a soft cream header, smooth underline animations, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded, compressed images for performance on Ethiopian networks. The application is available as a Progressive Web App (PWA) and has native Android and iOS applications through Capacitor.

### Technical Implementation
The frontend is built with React, TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, and React Hook Form with Zod for validation. The backend uses Node.js with Express.js and TypeScript, providing a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL is the database, hosted on Neon, managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control (Guest, Host, Admin, Operator). Security measures include Helmet.js, CORS protection, rate limiting, robust validation, and INSA government-grade security hardening for OWASP Top 10 vulnerabilities.

### Feature Specifications
- **Delala Agent Commission System**: Incentivizes property agents with a 5% commission on bookings for 36 months, featuring agent registration, a dashboard for tracking, and admin verification.
- **Ask Lemlem Help Page & AI Assistant**: A culturally authentic AI agent named Lemlem (grandmother-like) provides guidance with Ethiopian proverbs, offers multilingual support (English, Amharic, Tigrinya, Afaan Oromoo, Chinese), and features a host-configurable response system.
- **Property Management**: CRUD operations for listings, image uploads, and an enhanced host dashboard with property insights (e.g., active listings, earnings, occupancy rate).
- **User Profiles & Personalization**: Comprehensive user profiles with preferences (notifications, language, currency, search settings) and activity tracking for personalized recommendations.
- **Enhanced Search & Discovery**: Keyword search, advanced filters, sorting, and city filter chips.
- **Booking System**: Full workflow with date validation and conflict prevention.
- **Access Management**: 6-digit access code system for properties.
- **Review System**: Advanced weighted review system (ALGA Review Engine) with time-decay algorithm.
- **ID Verification**: Universal system with QR code scanning, OCR for foreign visitors, operator review dashboard, and integration with Fayda ID for eKYC.
- **Alga Pay**: A white-labeled, unified payment gateway abstracting underlying processors.
- **Commission & Tax System**: Automated calculation of Alga commission, VAT, and withholding tax, with ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Browsing for guests and application for providers across 11 service categories, including mobile beauty services and on-demand food delivery.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Google Maps Integration**: Lightweight mini-map on property details pages showing location and GPS-calculated distance.
- **Administrative Features**: Roles & Permissions Management, User Management with full control over user roles, status, and verification states.

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid.
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping & Location**: Google Maps Geocoding API.
- **File Storage**: Replit App Storage (Google Cloud Storage).
- **AI Services**: Replit AI Integration.
- **Mobile Frameworks**: Capacitor (native iOS/Android), `vite-plugin-pwa` (Progressive Web App).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.
## Complete Delala Agent System Summary

### ✅ ALL FEATURES IMPLEMENTED (October 27, 2025)

**4 Frontend Pages:**
1. `/agent-program` - Marketing landing page with calculator, FAQ, benefits
2. `/become-agent` - Registration form with TeleBirr verification
3. `/agent-dashboard` - Real-time earnings dashboard
4. `/admin/agents` - Admin verification panel

**7 API Endpoints:**
- Agent registration, dashboard, commissions, link-property
- Admin: list agents, verify/reject, process payouts

**TeleBirr Integration:**
- Sandbox + production modes
- Automated commission payouts
- Transaction tracking & validation

**Database:**
- 3 tables: agents, agent_properties, agent_commissions
- 36-month auto-expiry tracking
- Real-time earnings aggregation

**Key Numbers:**
- 2,200+ lines of code added
- 10 files created/modified
- 5% commission rate for 36 months
- Unlimited properties per agent
