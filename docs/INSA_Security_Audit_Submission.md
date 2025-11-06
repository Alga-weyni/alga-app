# Alga Web Application Security Testing Submission
## INSA Cyber Security Audit Requirements

**Submitted by:** Alga Platform  
**Submission Date:** November 6, 2025  
**Application Type:** Full-Stack Web Application (Property Rental Platform)  
**Contact:** [To be filled by organization]

---

## 1. LEGAL AND ADMINISTRATIVE DOCUMENTS

### 1.1 Company Information
- **Company Name:** Alga (አልጋ)
- **Trade License:** [To be provided]
- **TIN Number:** [To be provided]
- **System Patent Certificate:** [If applicable]

---

## 2. BUSINESS ARCHITECTURE AND DESIGN

### 2.1 Data Flow Diagram (DFD)

#### Context-Level DFD (Level 0)
**External Entities:**
- Guests (property renters)
- Hosts (property owners)
- Delala Agents (property agents)
- Operators (ID verification staff)
- Administrators
- Payment Processors (Chapa, Stripe, PayPal, TeleBirr)
- SMS/Email Services (SendGrid, Ethiopian Telecom)
- Government Systems (ERCA for tax, Fayda ID for eKYC)

**Data Flows:**
1. **User Registration/Authentication:**
   - User → System: Phone/Email, OTP verification
   - System → User: 4-digit OTP via SMS/Email
   - System → Database: User credentials (bcrypt hashed)

2. **Property Management:**
   - Host → System: Property details, images, pricing
   - System → Object Storage: Property images
   - System → Database: Property metadata

3. **Booking Process:**
   - Guest → System: Search criteria, booking request
   - System → Guest: Available properties, pricing
   - Guest → System: Booking confirmation
   - System → Payment Gateway: Payment processing
   - Payment Gateway → System: Payment confirmation
   - System → Database: Booking record

4. **Payment Processing:**
   - System → Alga Pay: Unified payment request
   - Alga Pay → Processor (Chapa/Stripe/PayPal): Transaction
   - Processor → System: Payment status
   - System → Database: Transaction record, commission calculation

5. **Commission Distribution:**
   - System → Database: Calculate agent commission (5%)
   - System → TeleBirr: Agent payout (36-month period)
   - System → Database: Commission tracking

6. **ID Verification:**
   - User → System: ID document upload
   - System → OCR (Tesseract.js): Extract ID data
   - System → Operator: Manual review queue
   - Operator → System: Verification approval/rejection
   - System → Database: Verification status

### 2.2 System Architecture Diagram

#### Deployment Architecture
**Environment:** Cloud-based (Replit Infrastructure)
- **Frontend Server:** Vite (Development), Express (Production)
- **Backend Server:** Node.js Express (TypeScript)
- **Database:** PostgreSQL (Neon Serverless)
- **Object Storage:** Replit App Storage (Google Cloud Storage)
- **Session Store:** PostgreSQL (connect-pg-simple)

#### Component Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  - React 18 (TypeScript)                                     │
│  - Wouter (Routing)                                          │
│  - TanStack Query (State Management)                         │
│  - Shadcn/UI + Tailwind CSS                                  │
│  - PWA + Capacitor (Mobile Apps)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/TLS
┌──────────────────────▼──────────────────────────────────────┐
│                     API LAYER (Express.js)                   │
│  - RESTful API Endpoints                                     │
│  - Session Management (express-session)                      │
│  - Input Validation (Zod, express-validator)                 │
│  - Security Middleware (Helmet, CORS, Rate Limiting)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  - Authentication Service (Passwordless OTP)                 │
│  - Property Management Service                               │
│  - Booking Service                                           │
│  - Payment Service (Alga Pay)                                │
│  - Commission Service (Delala Agent)                         │
│  - Notification Service (SMS/Email)                          │
│  - ID Verification Service                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  - Drizzle ORM                                               │
│  - PostgreSQL Connection Pool                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  DATABASE LAYER                              │
│  - PostgreSQL (Neon Serverless)                              │
│  - Tables: users, properties, bookings, payments,            │
│    reviews, agents, agent_commissions, etc.                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                      │
│  - Chapa (Ethiopian Payments)                                │
│  - Stripe (International Cards)                              │
│  - PayPal (International)                                    │
│  - TeleBirr (Agent Payouts)                                  │
│  - SendGrid (Email)                                          │
│  - Ethiopian Telecom (SMS)                                   │
│  - Google Maps API (Geocoding)                               │
│  - Fayda ID (eKYC)                                           │
└─────────────────────────────────────────────────────────────┘
```

#### Security Layers
1. **Transport Security:**
   - TLS/SSL encryption for all communications
   - HTTPS enforced

2. **Application Security:**
   - Helmet.js (Security headers)
   - CORS protection
   - Rate limiting (express-rate-limit)
   - Input sanitization (express-mongo-sanitize, xss-clean, hpp)
   - Session security (httpOnly, secure, sameSite cookies)

3. **Authentication & Authorization:**
   - Passwordless authentication (OTP via SMS/Email)
   - Bcrypt password hashing (where applicable)
   - Role-based access control (Guest, Host, Agent, Operator, Admin)
   - Session-based authentication with PostgreSQL storage

4. **Data Security:**
   - Input validation (Zod schemas)
   - SQL injection prevention (Drizzle ORM parameterized queries)
   - XSS protection (Content Security Policy)
   - CSRF protection

### 2.3 Entity Relationship Diagram (ERD)

#### Core Entities

**users**
- id (serial, PK) 🔒
- phone (varchar, unique)
- email (varchar, unique)
- name (varchar)
- password_hash (varchar) 🔒 [Bcrypt]
- role (enum: guest, host, agent, operator, admin)
- verification_status (enum: pending, verified, rejected)
- avatar_url (varchar)
- created_at (timestamp)

**properties**
- id (serial, PK)
- host_id (integer, FK → users.id)
- title (varchar)
- description (text)
- type (enum: hotel, apartment, guesthouse, etc.)
- city (varchar)
- address (text)
- latitude (numeric) 🔒
- longitude (numeric) 🔒
- price_per_night (integer)
- max_guests (integer)
- bedrooms (integer)
- bathrooms (integer)
- amenities (text[])
- images (text[])
- verification_status (enum)
- access_code (varchar, 6-digit) 🔒
- created_at (timestamp)

**bookings**
- id (serial, PK)
- property_id (integer, FK → properties.id)
- guest_id (integer, FK → users.id)
- check_in (date)
- check_out (date)
- total_guests (integer)
- total_amount (integer) 🔒
- booking_status (enum: pending, confirmed, cancelled, completed)
- payment_status (enum: pending, paid, refunded)
- access_code (varchar) 🔒
- created_at (timestamp)

**payments**
- id (serial, PK)
- booking_id (integer, FK → bookings.id)
- amount (integer) 🔒
- currency (varchar)
- payment_method (enum: chapa, stripe, paypal, telebirr)
- transaction_id (varchar, unique) 🔒
- alga_commission (integer) 🔒 [12%]
- vat_amount (integer) 🔒 [15%]
- withholding_tax (integer) 🔒 [2%]
- host_payout (integer) 🔒 [100% of booking]
- status (enum: pending, completed, failed, refunded)
- created_at (timestamp)

**agents**
- id (serial, PK)
- user_id (integer, FK → users.id)
- telebirr_account (varchar) 🔒
- verification_status (enum)
- total_earnings (integer) 🔒
- created_at (timestamp)

**agent_properties**
- id (serial, PK)
- agent_id (integer, FK → agents.id)
- property_id (integer, FK → properties.id)
- linked_at (timestamp)
- expires_at (timestamp) [36 months from link]

**agent_commissions**
- id (serial, PK)
- agent_id (integer, FK → agents.id)
- booking_id (integer, FK → bookings.id)
- commission_amount (integer) 🔒 [5% of booking]
- payment_status (enum: pending, paid)
- paid_at (timestamp)

**reviews**
- id (serial, PK)
- property_id (integer, FK → properties.id)
- guest_id (integer, FK → users.id)
- booking_id (integer, FK → bookings.id)
- rating (integer, 1-5)
- cleanliness_rating (integer)
- accuracy_rating (integer)
- communication_rating (integer)
- location_rating (integer)
- value_rating (integer)
- comment (text)
- created_at (timestamp)

**services**
- id (serial, PK)
- provider_id (integer, FK → users.id)
- category (enum: cleaning, laundry, transport, etc.)
- title (varchar)
- description (text)
- price (integer)
- city (varchar)
- availability (boolean)

**sessions** (PostgreSQL session store)
- sid (varchar, PK) 🔒
- sess (json) 🔒
- expire (timestamp)

🔒 = Sensitive field requiring encryption/access control

---

## 3. FEATURES OF THE WEB APPLICATION

### 3.1 Development Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Backend Framework:** Express.js (Node.js) with TypeScript
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon Serverless)
- **Routing:** Wouter (Frontend), Express Router (Backend)
- **State Management:** TanStack Query v5
- **Form Validation:** React Hook Form + Zod
- **UI Components:** Shadcn/UI (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Mobile:** Capacitor (iOS/Android), PWA (vite-plugin-pwa)

### 3.2 Libraries and Dependencies

**Security:**
- bcrypt (password hashing)
- helmet (security headers)
- cors (CORS protection)
- express-rate-limit (rate limiting)
- express-validator (input validation)
- express-mongo-sanitize (NoSQL injection prevention)
- xss-clean (XSS prevention)
- hpp (HTTP parameter pollution prevention)

**Authentication:**
- passport, passport-local
- express-session
- connect-pg-simple (PostgreSQL session store)

**Payment Processing:**
- @stripe/stripe-js, @stripe/react-stripe-js, stripe
- @paypal/paypal-server-sdk
- chapa-nodejs

**Communication:**
- @sendgrid/mail (email)
- [Ethiopian Telecom SMS integration]

**File Processing:**
- multer (file uploads)
- sharp (image optimization)
- browser-image-compression
- tesseract.js (OCR for ID verification)
- html5-qrcode (QR code scanning)

**Utilities:**
- zod, drizzle-zod (validation)
- date-fns (date manipulation)
- memoizee (caching)
- jspdf (PDF generation for invoices)

### 3.3 User Roles and Access Levels

1. **Guest** - Property renters
   - Search and view properties
   - Make bookings
   - Submit reviews
   - ID verification required for booking
   - Access service marketplace

2. **Host** - Property owners
   - List properties
   - Manage bookings
   - View earnings (100% of booking amount)
   - Access dashboard with analytics
   - ID verification required

3. **Delala Agent** - Property agents
   - Register as agent
   - Link properties (unlimited)
   - Earn 5% commission for 36 months
   - View commission dashboard
   - TeleBirr account required for payouts

4. **Operator** - ID verification staff
   - Review submitted IDs
   - Approve/reject verifications
   - Access operator dashboard

5. **Administrator** - Platform admin
   - Full system access
   - User management
   - Agent verification
   - Commission processing
   - System configuration

### 3.4 Core Functional Modules

1. **Authentication Module**
   - Passwordless OTP (4-digit code via SMS/Email)
   - Session-based authentication
   - Role-based authorization
   - Account recovery

2. **Property Management**
   - CRUD operations for listings
   - Image upload (up to 10 images)
   - Location with Google Maps integration
   - Amenities management
   - 6-digit access code generation

3. **Search and Discovery**
   - City-based filtering
   - Property type filtering
   - Price range filtering
   - Guest capacity filtering
   - Date availability checking
   - Keyword search
   - Sorting (price, rating, newest)

4. **Booking System**
   - Date selection with conflict prevention
   - Real-time availability checking
   - Booking confirmation
   - 6-digit access code delivery
   - Booking history

5. **Alga Pay (Payment Gateway)**
   - White-labeled payment abstraction
   - Multiple processors (Chapa, Stripe, PayPal, TeleBirr)
   - Automated commission calculation (12% service fee)
   - VAT calculation (15%)
   - Withholding tax (2%)
   - Host receives 100% of booking amount
   - ERCA-compliant PDF invoice generation

6. **Delala Agent Commission System**
   - Agent registration with TeleBirr verification
   - Property linking (unlimited properties)
   - 5% commission on all bookings
   - 36-month commission period
   - Automated TeleBirr payouts
   - Real-time earnings dashboard

7. **ID Verification System**
   - Document upload (Ethiopian ID, Passport, Driver's License)
   - QR code scanning for Ethiopian IDs
   - OCR for foreign documents (Tesseract.js)
   - Operator review dashboard
   - Fayda ID integration (eKYC)

8. **Review System (ALGA Review Engine)**
   - 6-category ratings (cleanliness, accuracy, communication, location, value, overall)
   - Time-decay weighted algorithm
   - Verified bookings only
   - Response from hosts

9. **Service Marketplace**
   - 11 service categories
   - Provider registration
   - Service browsing
   - Service booking

10. **Ask Lemlem (ለምለም) AI Assistant**
    - Browser-native AI (no API costs)
    - Multilingual support (English, Amharic, Tigrinya, Afaan Oromoo, Chinese)
    - Cultural context (Ethiopian proverbs)
    - Context-aware help

11. **Safety Features**
    - Emergency contacts
    - Location sharing
    - Safety check-ins

### 3.5 Third-Party Integrations

**Payment Processors:**
- Chapa (Ethiopian payments)
- Stripe (International cards)
- PayPal (International)
- TeleBirr (Agent payouts)

**Communication:**
- SendGrid (Email notifications)
- Ethiopian Telecom (SMS OTP)

**Maps & Location:**
- Google Maps Geocoding API

**Identity Verification:**
- Fayda ID (Ethiopian eKYC)

**File Storage:**
- Replit App Storage (Google Cloud Storage backend)

**AI Services:**
- Replit AI (Browser-native, no external API)

### 3.6 Security Infrastructure

**Implemented Security Measures:**
1. Helmet.js security headers
2. CORS protection with whitelist
3. Rate limiting (100 requests/15 min per IP)
4. Input validation (Zod schemas on all endpoints)
5. SQL injection prevention (Drizzle ORM parameterized queries)
6. XSS protection (xss-clean middleware)
7. NoSQL injection prevention (express-mongo-sanitize)
8. HTTP parameter pollution prevention (hpp)
9. Secure session management (httpOnly, secure, sameSite cookies)
10. PostgreSQL session store
11. Bcrypt password hashing (cost factor 10)
12. HTTPS/TLS enforcement
13. Content Security Policy
14. CSRF protection

**Planned Security Infrastructure:**
- WAF (Web Application Firewall) - To be implemented in production
- IDS/IPS (Intrusion Detection/Prevention) - To be implemented
- Load Balancer - Production deployment
- DDoS Protection - Production deployment

---

## 4. TESTING SCOPE

### 4.1 Assets and Endpoints

| Asset Name | URL/IP Address | Test Account Credentials | User Role |
|------------|----------------|-------------------------|-----------|
| Alga Web App (Development) | [Replit Dev URL] | testguest@alga.et / TestGuest123! | Guest |
| Alga Web App (Development) | [Replit Dev URL] | testhost@alga.et / TestHost123! | Host |
| Alga Web App (Development) | [Replit Dev URL] | testagent@alga.et / TestAgent123! | Agent |
| Alga Web App (Development) | [Replit Dev URL] | testoperator@alga.et / TestOp123! | Operator |
| Alga Web App (Development) | [Replit Dev URL] | testadmin@alga.et / TestAdmin123! | Admin |
| Alga Mobile App (Android) | [APK to be provided] | Same as above | All roles |
| Alga Mobile App (iOS) | [TestFlight link] | Same as above | All roles |

### 4.2 API Endpoints for Testing

**Authentication:**
- POST `/api/auth/request-otp` - Request OTP
- POST `/api/auth/verify-otp` - Verify OTP and login
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

**Properties:**
- GET `/api/properties` - List properties (with filters)
- GET `/api/properties/:id` - Get property details
- POST `/api/properties` - Create property (Host only)
- PATCH `/api/properties/:id` - Update property (Host only)
- DELETE `/api/properties/:id` - Delete property (Host only)
- POST `/api/properties/:id/upload-images` - Upload property images

**Bookings:**
- GET `/api/bookings` - List user bookings
- GET `/api/bookings/:id` - Get booking details
- POST `/api/bookings` - Create booking
- PATCH `/api/bookings/:id` - Update booking
- POST `/api/bookings/:id/cancel` - Cancel booking

**Payments:**
- POST `/api/payments/initiate` - Initiate payment
- POST `/api/payments/verify` - Verify payment
- GET `/api/payments/:id` - Get payment details
- GET `/api/payments/:id/invoice` - Download invoice PDF

**Agents:**
- POST `/api/agents/register` - Register as agent
- GET `/api/agents/dashboard` - Agent dashboard
- POST `/api/agents/link-property` - Link property
- GET `/api/agents/commissions` - Commission history
- POST `/api/admin/agents/verify` - Verify agent (Admin only)
- POST `/api/admin/agents/payout` - Process payout (Admin only)

**Reviews:**
- POST `/api/reviews` - Submit review
- GET `/api/reviews/property/:id` - Get property reviews
- PATCH `/api/reviews/:id` - Update review

**Services:**
- GET `/api/services` - List services
- POST `/api/services` - Create service (Provider)
- GET `/api/services/:category` - Get services by category

**ID Verification:**
- POST `/api/verification/upload` - Upload ID document
- GET `/api/verification/status` - Check verification status
- POST `/api/operator/verify` - Verify ID (Operator only)

**Admin:**
- GET `/api/admin/users` - List all users
- PATCH `/api/admin/users/:id` - Update user
- GET `/api/admin/statistics` - Platform statistics

---

## 5. SECURITY FUNCTIONALITY DOCUMENT

### 5.1 Authentication and Authorization

**Authentication Method:** Passwordless OTP (One-Time Password)
- 4-digit OTP sent via SMS (Ethiopian Telecom) or Email (SendGrid)
- OTP valid for 10 minutes
- Maximum 3 retry attempts before cooldown
- Rate limiting on OTP requests (5 per hour per phone/email)

**Session Management:**
- Session-based authentication using express-session
- Session stored in PostgreSQL (connect-pg-simple)
- Session timeout: 24 hours of inactivity
- Cookie configuration:
  - httpOnly: true (prevents XSS access)
  - secure: true (HTTPS only in production)
  - sameSite: 'strict' (CSRF protection)
  - maxAge: 24 hours

**Role-Based Access Control (RBAC):**
- 5 user roles: Guest, Host, Agent, Operator, Admin
- Middleware checks user role before endpoint access
- Hierarchical permissions (Admin > Operator > Host/Agent > Guest)

### 5.2 Input Validation and Sanitization

**Validation Layers:**
1. **Frontend Validation:**
   - React Hook Form with Zod schemas
   - Real-time validation feedback
   - Type-safe form handling

2. **Backend Validation:**
   - Zod schema validation on all POST/PATCH requests
   - Express-validator for complex validation rules
   - Drizzle-zod for database schema validation

**Sanitization:**
- express-mongo-sanitize: Prevents NoSQL injection
- xss-clean: Removes malicious XSS code
- hpp: Prevents HTTP parameter pollution
- Input trimming and normalization

**Example Validation (Property Creation):**
```typescript
const createPropertySchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(2000),
  type: z.enum(['hotel', 'apartment', 'guesthouse', ...]),
  city: z.string(),
  price_per_night: z.number().positive().max(1000000),
  max_guests: z.number().int().positive().max(50),
  amenities: z.array(z.string()).max(20),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});
```

### 5.3 Data Security

**Encryption:**
- All passwords hashed with Bcrypt (cost factor 10)
- Sensitive data fields marked in ERD
- TLS/SSL for all data in transit

**SQL Injection Prevention:**
- Drizzle ORM with parameterized queries
- No raw SQL queries in application code
- Input validation before database operations

**XSS Prevention:**
- Content Security Policy headers
- xss-clean middleware
- React's built-in XSS protection (escaped rendering)
- Sanitization of user-generated content

**CSRF Prevention:**
- SameSite cookie attribute
- Session-based authentication reduces CSRF risk
- Origin validation on sensitive endpoints

### 5.4 Error Handling and Logging

**Error Handling:**
- Global error handler middleware
- Sensitive information never exposed in error messages
- Different error responses for development vs production
- Graceful degradation for external service failures

**Logging:**
- Request logging (IP, method, path, status, response time)
- Authentication attempts logged
- Failed login attempts tracked
- Payment transactions logged
- No sensitive data (passwords, tokens) in logs

**Example Error Response:**
```json
{
  "error": "Invalid input",
  "message": "Property title must be between 10-100 characters",
  "statusCode": 400
}
```

### 5.5 File Upload Security

**Image Upload (Property Photos):**
- File type validation (JPEG, PNG, WebP only)
- File size limit: 5MB per image
- Image compression before storage
- Virus scanning (to be implemented)
- Secure file naming (UUID-based)
- Storage: Replit App Storage (Google Cloud Storage)

**ID Document Upload:**
- File type validation (JPEG, PNG, PDF)
- File size limit: 10MB
- Encrypted storage for ID documents
- Access restricted to Operators and Admins
- Automatic deletion after verification (90 days)

### 5.6 API Security

**Rate Limiting:**
- Global: 100 requests per 15 minutes per IP
- OTP requests: 5 per hour per phone/email
- Login attempts: 10 per hour per IP
- Payment endpoints: 20 per hour per user

**CORS Configuration:**
- Whitelist of allowed origins
- Credentials support for authenticated requests
- Preflight request handling

**Security Headers (Helmet.js):**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: Configured for React app

---

## 6. SECURE CODING STANDARDS

### 6.1 Development Guidelines

**OWASP Secure Coding Practices Followed:**
1. Input validation on all user inputs
2. Output encoding for all user-generated content
3. Authentication and password management (passwordless OTP)
4. Session management best practices
5. Access control (RBAC)
6. Cryptographic practices (Bcrypt, TLS)
7. Error handling and logging
8. Data protection
9. Communication security
10. System configuration

### 6.2 Code Quality Practices

**TypeScript:**
- Strict type checking enabled
- No 'any' types in production code
- Interface definitions for all data structures

**Code Review:**
- All code changes reviewed before merge
- Security-focused code review checklist
- Automated linting (ESLint)

**Dependency Management:**
- Regular dependency updates
- Vulnerability scanning (npm audit)
- No deprecated packages
- Minimal dependency footprint

### 6.3 Preventing Common Vulnerabilities

**SQL Injection Prevention:**
- Drizzle ORM parameterized queries exclusively
- No string concatenation for SQL
- Input validation before database operations

**XSS Prevention:**
- Content Security Policy
- xss-clean middleware
- React's escaped rendering
- No dangerouslySetInnerHTML usage

**CSRF Prevention:**
- SameSite cookies
- Origin header validation
- Session-based authentication

**Authentication Security:**
- Bcrypt for password hashing
- OTP with expiration
- Rate limiting on auth endpoints
- Account lockout after failed attempts

**Session Security:**
- PostgreSQL session storage
- Secure cookie configuration
- Session regeneration after login
- Absolute timeout (24 hours)

### 6.4 File Operation Security

**File Upload:**
- Type validation
- Size limits enforced
- Malicious file detection
- Secure storage paths
- No executable uploads

**File Download:**
- Access control verification
- No directory traversal
- Content-Type headers set correctly

---

## 7. FUNCTIONAL REQUIREMENTS

### 7.1 Core Workflows

**User Registration:**
1. User enters phone/email
2. System sends 4-digit OTP
3. User verifies OTP
4. System creates user account
5. User completes profile

**Property Listing (Host):**
1. Host clicks "List Property"
2. Host fills property details form
3. Host uploads images (up to 10)
4. System validates inputs
5. System generates 6-digit access code
6. Property submitted for review
7. Admin/Operator verifies property
8. Property goes live

**Booking Flow (Guest):**
1. Guest searches properties (city, dates, guests)
2. Guest views property details
3. Guest selects dates
4. System checks availability
5. Guest confirms booking
6. Guest redirected to Alga Pay
7. Guest selects payment method (Chapa/Stripe/PayPal)
8. Guest completes payment
9. System confirms booking
10. Guest receives 6-digit access code
11. Host receives 100% payout
12. Agent receives 5% commission (if applicable)

**Commission Tracking (Agent):**
1. Agent registers with TeleBirr account
2. Admin verifies agent
3. Agent links properties
4. System tracks bookings for linked properties
5. System calculates 5% commission
6. System processes TeleBirr payout
7. Agent views earnings in dashboard

**ID Verification:**
1. User uploads ID document
2. System extracts data (QR/OCR)
3. Operator reviews submission
4. Operator approves/rejects
5. User receives verification status
6. Verified badge displayed

### 7.2 Input/Output Validation Rules

**Property Price:**
- Input: Positive integer, max 1,000,000 ETB
- Output: Formatted with currency symbol

**Dates:**
- Input: ISO 8601 format (YYYY-MM-DD)
- Validation: Check-in before check-out, not in past
- Output: Localized format

**Phone Numbers:**
- Input: Ethiopian format (+251XXXXXXXXX)
- Validation: Valid Ethiopian mobile number
- Output: Masked for privacy (****XXX)

**Email:**
- Input: Valid email format
- Validation: RFC 5322 compliant
- Output: Lowercase normalized

**Images:**
- Input: JPEG/PNG/WebP, max 5MB
- Processing: Compression, optimization
- Output: WebP format, multiple sizes

### 7.3 API Request/Response Structures

**Example: Create Booking**

Request:
```json
POST /api/bookings
{
  "property_id": 123,
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "total_guests": 2,
  "payment_method": "chapa"
}
```

Response (Success):
```json
{
  "success": true,
  "booking": {
    "id": 456,
    "property_id": 123,
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "total_guests": 2,
    "total_amount": 5000,
    "booking_status": "confirmed",
    "payment_status": "paid",
    "access_code": "123456"
  },
  "payment": {
    "transaction_id": "TXN_ABC123",
    "amount": 5000,
    "alga_commission": 600,
    "host_payout": 5000,
    "agent_commission": 250
  }
}
```

Response (Error):
```json
{
  "success": false,
  "error": "Property not available",
  "message": "Property is already booked for selected dates",
  "statusCode": 409
}
```

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### 8.1 Performance

**Response Times:**
- API endpoints: < 200ms (p95)
- Page load: < 2 seconds (on 3G network)
- Image load: Progressive loading with lazy load
- Search results: < 500ms

**Concurrent Users:**
- Target: 10,000 concurrent users
- Peak capacity: 50,000 concurrent users

**Database Performance:**
- Connection pooling enabled
- Query optimization with indexes
- Caching layer (memoizee) for frequent queries

### 8.2 Availability and Reliability

**Uptime:**
- Target: 99.9% uptime (8.76 hours downtime/year)
- Monitoring: Health checks every 30 seconds

**Failover:**
- Database: Neon serverless auto-scaling
- Session persistence: PostgreSQL session store
- Graceful degradation for external services

**Backup:**
- Database: Automated daily backups (Neon)
- Retention: 30 days
- Point-in-time recovery available

**Disaster Recovery:**
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes
- Regular disaster recovery drills

### 8.3 Scalability

**Horizontal Scaling:**
- Stateless application design
- Load balancer ready
- Session store in PostgreSQL (not in-memory)

**Vertical Scaling:**
- Database auto-scaling (Neon serverless)
- Configurable connection pool size

**Caching Strategy:**
- In-memory caching (memoizee)
- CDN for static assets
- Browser caching with appropriate headers

### 8.4 Security (Non-Functional)

**Encryption:**
- Data in transit: TLS 1.2+
- Data at rest: Database encryption (Neon default)
- Sensitive fields: Application-level encryption planned

**Audit Logging:**
- All authentication events logged
- Administrative actions logged
- Payment transactions logged with full audit trail
- Retention: 12 months

**Compliance:**
- OWASP Top 10 compliance
- GDPR principles (data minimization, right to erasure)
- ERCA tax compliance (Ethiopia)
- PCI DSS considerations for payment handling

### 8.5 Maintainability

**Code Modularity:**
- Separation of concerns (MVC pattern)
- Reusable components
- DRY principles

**Documentation:**
- Inline code comments
- API documentation (this document)
- Database schema documentation
- Deployment procedures

**Update Procedures:**
- Zero-downtime deployment strategy
- Database migration with Drizzle Kit
- Rollback procedures documented
- Staging environment for testing

### 8.6 Localization

**Languages:**
- English (primary)
- Amharic (አማርኛ)
- Tigrinya (ትግርኛ)
- Afaan Oromoo
- Chinese (中文)

**Currency:**
- Ethiopian Birr (ETB) - primary
- USD - for international users

**Date/Time:**
- Localized date formats
- Ethiopian calendar support (planned)
- Timezone handling (East Africa Time)

---

## 9. SECURITY TEST COVERAGE REQUEST

### 9.1 OWASP Top 10 Testing

Please test for:
1. **Injection** (SQL, NoSQL, Command)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **Cross-Site Scripting (XSS)**
8. **Insecure Deserialization**
9. **Using Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

### 9.2 Additional Security Tests

- **Session Management Testing**
- **File Upload Vulnerabilities**
- **Business Logic Flaws**
- **Payment Processing Security**
- **API Security Testing**
- **Mobile App Security (if applicable)**
- **Third-Party Integration Security**

---

## 10. APPENDICES

### 10.1 Technology Stack Summary
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle
- **Mobile:** Capacitor + PWA
- **Storage:** Google Cloud Storage (via Replit)

### 10.2 External Dependencies
- Payment: Chapa, Stripe, PayPal, TeleBirr
- Communication: SendGrid, Ethiopian Telecom
- Maps: Google Maps API
- eKYC: Fayda ID
- AI: Replit AI (browser-native)

### 10.3 Network Architecture
- **Production Domain:** [To be configured]
- **SSL Certificate:** [To be obtained]
- **CDN:** [To be configured]
- **Load Balancer:** [Production deployment]

### 10.4 Compliance and Standards
- OWASP Secure Coding Practices
- ISO/IEC 27001 principles
- NIST Cybersecurity Framework
- ERCA tax compliance (Ethiopia)
- Data protection best practices

---

## 11. SUBMISSION CHECKLIST

- [ ] Legal documents (Trade License, TIN)
- [ ] Data Flow Diagram (DFD)
- [ ] System Architecture Diagram
- [ ] Entity Relationship Diagram (ERD)
- [ ] Features documentation
- [ ] Testing scope and credentials
- [ ] Security functionality document
- [ ] Secure coding standards
- [ ] Functional requirements
- [ ] Non-functional requirements
- [ ] Source code (on CD/DVD if required)
- [ ] APK/IPA files for mobile apps

---

**Document Prepared By:** Alga Development Team  
**Last Updated:** November 6, 2025  
**Version:** 1.0  

**Contact for Technical Queries:**  
[To be filled by organization]

**Submission Method:**  
INSA Cyber Audit Request Portal: https://cyberaudit.insa.gov.et/sign-up  
Email: tilahune@insa.gov.et  
Phone: +251 937 456 374
