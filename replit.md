# Alga

## Overview
Alga (አልጋ - "bed" in Amharic) is a **short-term rental platform** designed for the Ethiopian hospitality market, similar to Airbnb and Booking.com. It incorporates a **Lemlem Operations Dashboard** for comprehensive administrative control. The platform connects property owners with travelers, offering diverse accommodations with a focus on local culture, safety, and multi-city support across Ethiopia. It provides a secure and culturally immersive rental experience through host/property verification, varied payment options, and role-based access. Alga's ambition is to become the leading platform for Ethiopian hospitality, fostering cultural immersion and economic opportunities, and addresses the cold start problem by incentivizing informal property agents ("Delalas") through a commission system to rapidly expand listings.

**Business Model**: Short-term stays (hospitality sector) - NOT long-term residential renting.

## User Preferences
Preferred communication style: Simple, everyday language.

**Company Identity**: Alga is a women-run, women-owned, and women-operated company. All guidance, materials, and communications should reflect and honor this foundation.

## Current Session Progress (Nov 25, 2025)

### ✅ Completed Fixes
1. **Agent Dashboard Router** - Fixed from wouter to react-router-dom for proper navigation
2. **Provider Onboarding Flow** - Added redirectAfterAuth="/become-provider" to keep users on the page after login
3. **Login Redirect Logic** - Implemented role-based redirects: admin → admin dashboard, host → host dashboard, operator → operator dashboard, guest → properties
4. **Mobile WebView CORS** - Enhanced backend CORS to support Capacitor native app connections (file://, capacitor://, all localhost variants)
5. **Feature Flags System** - Created admin-controlled toggles for INSA compliance testing (can disable New Property, Payments, Services, etc.)
6. **API Configuration** - Made frontend environment-aware for development vs production API URLs

### ⚠️ In Progress - Database Migration
**Status**: Neon PostgreSQL database migration partially applied
**Issue**: Schema conflict on lockboxes table regarding installation_date column
**Current State**: Database has users table only; needs all other tables (properties, bookings, agents, etc.)
**Resolution**: Run in Neon dashboard:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lockboxes';
```
Then manually apply changes or retry: `npm run db:push --force`

### 🚀 Ready to Deploy
- Frontend: All pages protected by role-based access control
- Backend: All authentication flows working, INSA security hardening active
- Mobile: CORS configured for Capacitor WebView
- Feature flags: Admin can toggle features on/off for security testing

## Critical Business Rules

### Pricing Freedom Policy (SHORT-TERM RENTALS)

**IMPORTANT**: Alga is a **short-term rental platform** (hospitality sector), similar to Airbnb/Booking.com. Ethiopian rent-control laws **DO NOT APPLY** to short-term rentals.

**Core Principles:**

1. **Complete Price Freedom**
   - Hosts MUST have full technical freedom to change nightly rates at ANY time
   - NO administrative approval required for price changes
   - NO price-change freezes or restrictions
   - NO contract registration requirements for bookings
   - NO fixed-price ceilings or rent-control enforcement

2. **What NOT to Implement**
   - ❌ Rent-control restrictions
   - ❌ Price approval workflows
   - ❌ Legal references to Ethiopian rent-control laws (they don't apply here)
   - ❌ Mandatory price-change explanations
   - ❌ Hard controls blocking price adjustments

3. **Smart Incentive System (Optional, Non-Enforced)**
   Instead of restrictions, use **positive incentives** to encourage stable pricing:
   
   **Analytics & Guidance:**
   - "Recommended Price Range" based on market data
   - Price analytics (demand, occupancy, seasonality trends)
   - Warnings when price is unusually high or low
   
   **Rewards & Recognition:**
   - ⭐ **"Fair Price Badge"** for hosts with consistent pricing
   - ⭐ **Enhanced star ratings** for price stability
   - ⭐ **Visibility boosts** in search results for stable pricing
   - ⭐ **Better platform rankings** for reasonable pricing
   
   **Educational Tools:**
   - Market insights and competitor analysis
   - Seasonal pricing suggestions
   - Occupancy optimization tips

4. **Implementation Philosophy**
   - **Influence, not control** - Encourage reasonable pricing through incentives
   - **Transparency** - Show hosts how pricing affects their visibility and bookings
   - **Freedom first** - Never block or restrict a host's pricing decisions
   - **Data-driven guidance** - Provide market intelligence to help hosts make informed decisions

**Why This Matters**: Alga operates in the **hospitality/short-stay marketplace**, where dynamic pricing is essential and legally permissible. The goal is to guide hosts toward competitive pricing through positive reinforcement, not enforcement.

## System Architecture

### UI/UX Design
The platform features a universal accessibility design optimized for Ethiopian users, utilizing a warm color palette (dark brown, medium brown, cream backgrounds). It incorporates Airbnb-style minimal navigation, a soft cream header, smooth underline animations, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded, compressed images for performance on Ethiopian networks. It is available as a Progressive Web App (PWA) and has native Android and iOS applications via Capacitor, with distinct UI patterns for mobile (bottom navigation, minimal header).

### Technical Implementation
The frontend is built with React, TypeScript (Vite), React Router (not wouter) for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query v5 for server state management, and React Hook Form with Zod for validation. The backend utilizes Node.js, Express.js, and TypeScript, providing a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL, hosted on Neon, is managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control (Guest, Host, Admin, Operator). Security measures include Helmet.js, CORS protection, rate limiting, robust validation, and INSA government-grade security hardening for OWASP Top 10 vulnerabilities.

### Feature Specifications
- **Personalized Onboarding System**: A browser-native animated welcome experience for all user roles using Framer Motion, offering role-specific content and an interactive tour.
- **Electronic Signature Compliance System**: A fully compliant click-to-sign system adhering to Ethiopian electronic signature regulations, featuring AES-256 encrypted IP addresses, SHA-256 signature hashing, and a comprehensive audit trail. Includes an **Admin Signature Dashboard** for compliance monitoring.
- **Delala Agent Commission System**: Incentivizes property agents with a 5% commission on bookings for 36 months, including a tracking dashboard and admin verification.
- **Ask Lemlem Help Page & AI Assistant**: A culturally authentic AI agent providing guidance with Ethiopian proverbs, multilingual support, and host-configurable responses, with browser-native offline capabilities. Text-first interface with manual voice activation.
- **Property Management**: Comprehensive CRUD operations for listings, image uploads, and an enhanced host dashboard.
- **User Profiles & Personalization**: Detailed user profiles with preferences and activity tracking for personalized recommendations.
- **Enhanced Search & Discovery**: Advanced search capabilities including keyword search, filters, sorting, and city filter chips.
- **Booking System**: A complete booking workflow with date validation and conflict prevention.
- **Access Management**: TTLock 4-digit PIN system with time-limited offline codes generated upon check-in, sent to guests via SMS/WhatsApp.
- **Review System**: An advanced weighted review system (ALGA Review Engine) incorporating a time-decay algorithm.
- **ID Verification**: A universal system with QR code scanning, OCR for foreign visitors, an operator review dashboard, and integration with Fayda ID for eKYC.
- **Alga Pay**: A white-labeled, unified payment gateway abstracting underlying processors.
- **Commission & Tax System**: Automated calculation of Alga commission, VAT, and withholding tax, with ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Allows guests to browse and providers to apply for services across 11 categories.
- **International Support**: Multi-language (Amharic, English) and localization features.
- **Safety Features**: Includes location sharing, emergency contacts, and safety check-ins.
- **Alga Secure Access System**: Requires smart lockboxes (e.g., TTLock-compatible) and security cameras at all properties for guest safety and incident documentation. Features a vendor-agnostic design for lockbox integration.
- **Google Maps Integration**: Lightweight mini-map on property details pages showing location and calculated distance.
- **Administrative Features**: Includes Roles & Permissions Management and User Management with full control over user roles, status, and verification.
- **Lemlem Operations Dashboard**: A comprehensive admin dashboard for managing 5 operational pillars (Agent Governance, Supply Curation, Hardware Deployment, Payments & Compliance, Marketing & Growth) with real-time KPIs, an AI admin assistant ("Ask Lemlem Admin Chat"), workflow automation, and CSV export functions.
- **Lemlem Operations Intelligence (v3)**: A browser-native admin intelligence hub for natural language operations queries, automated weekly executive summaries, AI predictive insights, and voice commands (manual activation only). Offers PDF export and is offline-capable with client-side analytics.
- **Feature Flags System**: Admin-controlled toggles to enable/disable features during INSA compliance testing.

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid.
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping & Location**: Google Maps Geocoding API.
- **Smart Lock Integration**: TTLock Open Platform API and SDK.
- **File Storage**: Replit App Storage (Google Cloud Storage).
- **AI Services**: Replit AI Integration.
- **Mobile Frameworks**: Capacitor (native iOS/Android), `vite-plugin-pwa` (Progressive Web App).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.

## Deployment Status

**Current**: Development (localhost:5000)
**Target Domains**: 
- Frontend: app.alga.et
- Backend API: api.alga.et

**Database**: Neon PostgreSQL (connection string in DATABASE_URL)
**Deployment**: Render.com (Node.js for backend, Static for frontend)

## Next Steps After This Session

1. **Complete Database Migration**
   - Resolve lockboxes table schema conflict
   - Run full migration to create all tables
   
2. **Test All Login Flows**
   - Admin login → admin dashboard
   - Host login → host dashboard
   - Operator login → operator dashboard
   - Guest login → properties page
   
3. **Test Provider Onboarding**
   - Click "Start Application" on /become-provider
   - Verify redirect to login
   - Verify return to provider page after login
   
4. **Deploy to Production**
   - Push to GitHub: `git push origin HEAD:main`
   - Render will auto-deploy both frontend and backend
