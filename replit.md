# Alga

## Overview
Alga (አልጋ - "bed" in Amharic) is a full-stack web application designed for the Ethiopian property rental market, incorporating a **Lemlem Operations Dashboard** for comprehensive administrative control. It aims to connect property owners with travelers, offering a diverse range of accommodations with a focus on local culture, safety, and multi-city support across Ethiopia. The platform seeks to provide a secure and culturally immersive rental experience through host/property verification, varied payment options, and role-based access. Alga's ambition is to become the leading platform for Ethiopian hospitality, fostering cultural immersion and economic opportunities, and addresses the cold start problem by incentivizing informal property agents ("Delalas") through a commission system to rapidly expand listings.

## User Preferences
Preferred communication style: Simple, everyday language.

**Company Identity**: Alga is a women-run, women-owned, and women-operated company. All guidance, materials, and communications should reflect and honor this foundation.

## System Architecture

### UI/UX Design
The platform features a universal accessibility design optimized for Ethiopian users, utilizing a warm color palette (dark brown, medium brown, cream backgrounds). It incorporates Airbnb-style minimal navigation, a soft cream header, smooth underline animations, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded, compressed images for performance on Ethiopian networks. It is available as a Progressive Web App (PWA) and has native Android and iOS applications via Capacitor, with distinct UI patterns for mobile (bottom navigation, minimal header).

### Technical Implementation
The frontend is built with React, TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state management, and React Hook Form with Zod for validation. The backend utilizes Node.js, Express.js, and TypeScript, providing a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL, hosted on Neon, is managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control (Guest, Host, Admin, Operator). Security measures include Helmet.js, CORS protection, rate limiting, robust validation, and INSA government-grade security hardening for OWASP Top 10 vulnerabilities.

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