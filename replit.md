# Alga

## Overview
Alga (አልጋ - "bed" in Amharic) is a full-stack web application for the Ethiopian property rental market, featuring a **Lemlem Operations Dashboard** for administrative control. It connects property owners with travelers, offering diverse accommodations with a focus on local culture, safety, and multi-city support across Ethiopia. The platform provides a secure and culturally immersive rental experience through host/property verification, varied payment options, and role-based access. Alga aims to be the leading platform for Ethiopian hospitality, fostering cultural immersion and economic opportunities, and addresses the cold start problem by incentivizing informal property agents ("Delalas") through a commission system to rapidly expand listings.

## User Preferences
Preferred communication style: Simple, everyday language.

**Company Identity**: Alga is a women-run, women-owned, and women-operated company. All guidance, materials, and communications should reflect and honor this foundation.

## System Architecture

### UI/UX Design
The platform features a universal accessibility design optimized for Ethiopian users, with a warm color palette (dark brown, medium brown, cream backgrounds). It incorporates Airbnb-style minimal navigation, a soft cream header, smooth underline animations, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded, compressed images for performance on Ethiopian networks. It is available as a Progressive Web App (PWA) and has native Android and iOS applications via Capacitor, with distinct UI patterns for mobile (bottom navigation, minimal header).

### Technical Implementation
The frontend uses React, TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, and React Hook Form with Zod for validation. The backend is built with Node.js, Express.js, and TypeScript, offering a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL, hosted on Neon, is managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control (Guest, Host, Admin, Operator). Security measures include Helmet.js, CORS protection, rate limiting, robust validation, and INSA government-grade security hardening for OWASP Top 10 vulnerabilities.

### Feature Specifications
- **Electronic Signature Compliance System**: Fully compliant click-to-sign system implementing Ethiopian Electronic Signature Proclamation No. 1072/2018 and Electronic Transactions Proclamation No. 1205/2020. Features the ElectronicSignatureConsent component with exact legal text, mandatory "I Agree" consent, AES-256 encrypted IP addresses, SHA-256 signature hashing, automatic retry on database latency, and complete audit trail. Records all signatures in the consent_logs table with signatureId UUID, verified session status (Fayda ID/OTP), and immutable signature_hash for legal traceability. INSA-compliant with read-only audit retrieval.
- **Delala Agent Commission System**: Incentivizes property agents with a 5% commission on bookings for 36 months, including registration, a tracking dashboard, and admin verification.
- **Ask Lemlem Help Page & AI Assistant**: A culturally authentic AI agent providing guidance with Ethiopian proverbs, multilingual support (English, Amharic, Tigrinya, Afaan Oromoo, Chinese), and host-configurable responses. It includes browser-native offline capabilities for message caching and automatic retry for low-bandwidth networks. **Text-first interface with manual voice activation only** - voice is OFF by default and activated only when user clicks the microphone button.
- **Property Management**: CRUD operations for listings, image uploads, and an enhanced host dashboard with property insights.
- **User Profiles & Personalization**: Comprehensive profiles with preferences and activity tracking for personalized recommendations.
- **Enhanced Search & Discovery**: Keyword search, advanced filters, sorting, and city filter chips.
- **Booking System**: Full workflow with date validation and conflict prevention.
- **Access Management**: TTLock 4-digit PIN system with time-limited offline codes generated via API upon check-in. Guests receive codes via SMS/WhatsApp to unlock lockbox containing physical keys.
- **Review System**: Advanced weighted review system (ALGA Review Engine) with a time-decay algorithm.
- **ID Verification**: Universal system with QR code scanning, OCR for foreign visitors, operator review dashboard, and integration with Fayda ID for eKYC.
- **Alga Pay**: A white-labeled, unified payment gateway abstracting underlying processors.
- **Commission & Tax System**: Automated calculation of Alga commission, VAT, and withholding tax, with ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Browsing for guests and application for providers across 11 service categories.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Alga Secure Access System**: Industry-leading hardware security infrastructure with mandatory requirements for all properties:
  - **Smart Lockbox** (e.g., LILIWISE KB01, TTLock-compatible): IP65 weatherproof keypad lockbox holding physical property keys, unlocked via 4-digit PIN codes generated by Alga backend API, works completely offline without Bluetooth/internet dependency. Specifications: Aluminum alloy construction, 12-month battery life, fingerprint/RFID/PIN unlock modes, -35°C to 55°C operating temperature.
  - **Security Cameras**: Mandatory surveillance hardware for guest safety and incident documentation, verified by operators during property approval.
  - **Operator Verification**: Properties cannot be approved without photographic proof of both devices professionally installed and functional.
  - **Check-in Flow**: Booking confirmation → Alga backend calls lockbox vendor API (TTLock Keyboard Password or equivalent) to generate time-limited 4-digit PIN → Code sent to guest via SMS/WhatsApp/app → Guest enters code on lockbox keypad → Retrieves physical key → Unlocks property door → Code auto-expires after checkout time.
  - **Vendor-Agnostic Design**: Backend supports multiple lockbox vendors (TTLock, igloohome, Populife, Master Lock) via unified API abstraction layer, allowing hosts to choose hardware that fits their budget and availability.
- **Google Maps Integration**: Lightweight mini-map on property details pages showing location and GPS-calculated distance.
- **Administrative Features**: Roles & Permissions Management, User Management with full control over user roles, status, and verification states.
- **Lemlem Operations Dashboard**: A comprehensive admin dashboard for managing 5 operational pillars (Agent Governance, Supply Curation, Hardware Deployment, Payments & Compliance, Marketing & Growth) with real-time KPIs, an AI admin assistant ("Ask Lemlem Admin Chat"), workflow automation (for alerts on commissions, warranties, payments, property verification), and CSV export functions. It runs on a zero-cost architecture optimized for 2G networks.
- **Lemlem Operations Intelligence (v3)**: Browser-native admin intelligence hub that answers management questions using natural language queries. Features include: (1) Natural language operations query engine processing questions like "Show today's top agents" and "List overdue verifications", (2) Automated weekly executive summaries with agent performance, booking growth, commission revenue, compliance alerts, and property distribution, refreshing every Sunday at 6:00 AM Ethiopian time, (3) AI predictive insights with forward-looking analytics for agent retention, booking trends, commission priorities, and compliance resource allocation, (4) Voice commands with **manual activation only** (click-to-listen) in Amharic and English - NOT auto-ready or voice-first, disabled by default and activated only when user clicks microphone button, (5) PDF export for sharing reports with stakeholders, (6) Zero external API costs using pattern matching on live PostgreSQL data, (7) Offline-capable with client-side analytics, (8) Auto-learning property knowledge caching in IndexedDB for instant offline responses about property-specific restaurants, attractions, and transportation, (9) Browser-native usage analytics system tracking queries, voice commands, and user satisfaction with v4 readiness scoring to determine if a recommendation engine is needed.

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid.
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping & Location**: Google Maps Geocoding API.
- **Smart Lock Integration**: TTLock Open Platform API and SDK (keyless entry system for all properties).
- **File Storage**: Replit App Storage (Google Cloud Storage).
- **AI Services**: Replit AI Integration.
- **Mobile Frameworks**: Capacitor (native iOS/Android), `vite-plugin-pwa` (Progressive Web App).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.