# Alga

## Overview
Alga is a full-stack web application designed for the Ethiopian property rental market. It connects property owners with travelers, offering diverse accommodations from traditional homes to modern hotels, with a strong emphasis on local culture, safety, and multi-city support across Ethiopia. The platform provides a secure and culturally immersive rental experience through features like host/property verification, varied payment options, and role-based access for guests, hosts, operators, and administrators. Alga aims to be the leading platform for Ethiopian hospitality, fostering unique cultural immersion and economic opportunities.

## User Preferences
Preferred communication style: Simple, everyday language.

## Administrative Features
The platform includes comprehensive administrative tools for managing the entire system:
- **Roles & Permissions Management**: Dedicated page explaining all platform roles (Tenant, Guesthouse Owner, Operator, Admin) with detailed permissions and restrictions for each role. Includes user search/filter, bulk actions, and role assignment capabilities.
- **User Management**: Full control over user roles, status (active/suspended), and verification states with search and filtering capabilities.

## System Architecture

### UI/UX Design
The platform features a universal accessibility design optimized for Ethiopian users, utilizing a warm color palette (dark brown, medium brown, cream backgrounds). Key design principles include Airbnb-style minimal navigation, a soft cream header, smooth underline animations for active states, emoji-enhanced icons, and a horizontal clean layout. Accessibility is prioritized with full ARIA support, contextual tooltips, high contrast, and keyboard navigation. Terminology uses child-friendly wording and simple, warm microcopy. The system is fully responsive, mobile-optimized, and uses lazy-loaded and compressed images for performance on Ethiopian networks.

### Technical Implementation
The frontend is built with React, TypeScript (Vite), Wouter for routing, Shadcn/ui (Radix UI) for components, Tailwind CSS for styling, React Query for server state, and React Hook Form with Zod for validation. The backend uses Node.js with Express.js and TypeScript, providing a RESTful API and Express sessions with PostgreSQL storage. PostgreSQL is the database, hosted on Neon, managed with Drizzle ORM and Drizzle Kit for migrations. Authentication is passwordless via 4-digit OTP (phone/email), with Bcrypt for password hashing, secure session cookies, and role-based access control for Guest, Host, Admin, and Operator roles. Security measures include Helmet.js, CORS protection, rate limiting, and robust validation.

### Key Features
- **Ask Lemlem Help Page**: The platform's help/support page has been completely transformed into "Ask Lemlem (ልምልም)" — a warm, culturally authentic experience where Lemlem (the AI agent named after my grandmother) guides users through all help topics with grandmother wisdom. Features daily Ethiopian proverbs, Lemlem's voice on every help card, and direct chat integration. Navigation shows "Ask Lemlem" instead of generic "Help" to reinforce the AI agent presence.
- **Property Management**: CRUD operations for listings, image uploads, and an enhanced host dashboard with Ethiopian-context title and description suggestions.
- **User Profiles & Personalization**: Complete user profile system with preferences (notifications, language, currency, search settings) and activity tracking. Stores user preferences in JSONB field for flexible personalization. Activity log tracks user actions (property views, bookings, searches) for analytics and personalized recommendations.
- **User Settings**: Comprehensive notification, security, payment, and language preferences.
- **Enhanced Search & Discovery**: Keyword search, advanced filters, sorting, and city filter chips.
- **Booking System**: Full workflow with date validation, conflict prevention, and seamless URL parameter integration.
- **Access Management**: 6-digit access code system for properties.
- **Review System**: Advanced weighted review system (ALGA Review Engine) with time-decay algorithm.
- **ID Verification**: Universal system with QR code scanning, OCR for foreign visitors, operator review dashboard, and integration with Fayda ID for eKYC.
- **Payment Gateway**: Integration with Chapa, Stripe, Telebirr, and PayPal, including webhooks.
- **Commission & Tax System**: Automated calculation of Alga commission, VAT, and withholding tax, with ERCA-compliant PDF invoice generation.
- **Add-On Services Marketplace**: Separate browsing for guests and application for providers, featuring 11 service categories, reviews, and provider badges.
- **International Support**: Multi-language (Amharic, English) and localization.
- **Safety Features**: Location sharing, emergency contacts, safety check-ins.
- **Google Maps Integration**: Interactive map with property markers, map/list view toggle, and custom Ethiopian-themed markers.
- **Provider Onboarding & Dashboard**: Complete application process with admin verification, automated email notifications, and status-based UX.
- **Lemlem AI Agent**: A 24/7 cost-optimized **AI agent named after my grandmother**, utilizing a smart template system (90% free responses) with an optional AI fallback for complex queries. It handles common inquiries like lockbox codes, WiFi, and local recommendations. **Personalization**: Lemlem adapts greetings and responses based on user's language preference (English/አማርኛ/ትግርኛ/Afaan Oromoo/中文), providing localized hospitality in all major Ethiopian languages plus Chinese for international visitors. The heritage story is elegantly presented through the button tooltip, chat header subtitle, and welcome message in all languages.
  - **Bilingual Chat Button**: Beautiful floating button displaying "Lemlem / ልምልም" in both English and Amharic with authentic Ethiopic font (Noto Sans Ethiopic). Features orange gradient design with hover animations and glow effect for cultural authenticity.
  - **In-Chat Language Dropdown**: Professional dropdown menu allowing instant language switching between English, አማርኛ (Amharic), ትግርኛ (Tigrinya), Afaan Oromoo (Oromo), and 中文 (Chinese). Selected language changes both text responses AND voice language in real-time.
  - **Multilingual Grandmother Voice**: Browser-based Text-to-Speech with authentic language pronunciation (speaks actual language content, not just accents). Soft, loving grandmother voice (rate: 0.75, pitch: 1.35, volume: 0.90) with female voice preference across all languages. Natural pause before speaking, working voice toggle button, speaker icon on each message for replay, auto-speak new responses, and speaking indicator. Text cleaning removes ALL emojis/symbols for natural speech. Creates a warm, trusting, caring experience like being welcomed by an Ethiopian grandmother. 100% FREE - uses browser's native Speech Synthesis API with zero external costs.
  - **Complete Documentation**: See `/docs/Lemlem_Multilingual_Grandmother_Voice_README.md` for full technical documentation, deployment checklist, and maintenance guidelines.
  - **Property Information Form**: 14 comprehensive fields for hosts to configure Lemlem responses (lockbox codes, WiFi, emergency contacts, house rules, local recommendations, appliance instructions).
  - **Admin Lemlem Insights Dashboard**: Analytics tracking total chats, template vs AI usage, cost per property, monthly spending, top questions, and cost trends. **Impact Metrics**: Tracks bookings after Lemlem interactions, conversion rates, and properties with highest engagement. Displays cost savings and ROI achieved through the template system.
  - **Admin AI Control Panel**: Platform-wide AI management with enable/disable toggles, monthly budget caps (USD), alert thresholds, and budget tracking. Prevents AI overspending with automatic cutoffs.

## External Dependencies
- **Payment Processors**: Chapa, Stripe, PayPal SDK, Telebirr.
- **Communication Services**: Ethiopian Telecom SMS, SendGrid (for emails).
- **Database & Hosting**: Neon Database (serverless PostgreSQL).
- **Identity Verification**: `html5-qrcode` (QR scanning), `tesseract.js` (OCR).
- **Mapping**: `google-map-react`.
- **File Storage**: Replit App Storage (Google Cloud Storage) for property and service images.
- **AI Services**: Replit AI Integration (optional, for Lemlem complex queries).
- **UI & Design**: Radix UI, Lucide Icons.
- **Utility Libraries**: `date-fns`, `clsx`, `tailwind-merge`, `memoizee`, `jsPDF`.