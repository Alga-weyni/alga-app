# Web Application Features and Requirements
## Alga Property Rental Platform

---

## 1. Development Frameworks

### **Frontend:**
- **Framework:** React 18.3.1 (TypeScript)
- **Build Tool:** Vite 6.0.1
- **Routing:** Wouter 3.3.5
- **State Management:** TanStack React Query 5.x
- **UI Library:** Shadcn/UI (Radix UI components)
- **Styling:** Tailwind CSS 3.4.17
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### **Backend:**
- **Runtime:** Node.js 20.x (LTS)
- **Framework:** Express.js 4.21.2 (TypeScript)
- **ORM:** Drizzle ORM 0.38.3
- **Database Migrations:** Drizzle Kit
- **Session Store:** connect-pg-simple (PostgreSQL)
- **Authentication:** Passport.js (local strategy) + Bcrypt

### **Database:**
- **DBMS:** PostgreSQL 16+ (Neon Serverless)
- **Connection Pool:** Built-in Neon pooling
- **Schema Management:** Drizzle ORM

---

## 2. Libraries and Plugins (85+ packages)

### **Security:**
- helmet (Security headers)
- cors (Cross-origin resource sharing)
- express-rate-limit (Rate limiting)
- express-validator (Input validation)
- bcrypt (Password hashing)
- xss-clean (XSS sanitization)
- express-mongo-sanitize (NoSQL injection prevention)
- hpp (HTTP Parameter Pollution protection)

### **Payment Processors:**
- chapa-nodejs (Ethiopian payments)
- stripe (International payments)
- @paypal/paypal-server-sdk (PayPal integration)

### **File Handling:**
- multer (File uploads)
- sharp (Image processing)
- browser-image-compression (Client-side compression)
- @uppy/core, @uppy/dashboard (File uploader UI)

### **Communication:**
- @sendgrid/mail (Email notifications)
- axios (HTTP client)

### **Mobile:**
- @capacitor/core, @capacitor/cli (Native app framework)
- @capacitor/android, @capacitor/ios (Platform SDKs)
- @capacitor/camera, @capacitor/geolocation (Native features)
- @capacitor/push-notifications (Push notifications)

### **Maps & Location:**
- google-map-react (Map integration)
- react-google-autocomplete (Place autocomplete)

### **ID Verification:**
- tesseract.js (OCR for foreign IDs)
- html5-qrcode (QR code scanning)
- qr-scanner (Alternative QR scanner)
- react-qr-code (QR code generation)

### **UI Components:**
- @radix-ui/* (35+ accessible components)
- framer-motion (Animations)
- embla-carousel-react (Carousels)
- recharts (Charts for dashboards)
- date-fns (Date manipulation)
- lucide-react (Icons)

---

## 3. Custom-Developed Modules

### **Authentication Module:**
- Passwordless OTP (4-digit code via SMS/Email)
- Password-based fallback
- Session management
- Role-based access control
- Account lockout protection

### **Property Management Module:**
- CRUD operations for listings
- Image upload (up to 10 images per property)
- Pricing management (per-night rates)
- Availability calendar
- Property verification workflow

### **Booking Engine:**
- Date range selection with conflict detection
- Real-time availability checking
- Pricing calculation (nights × rate + commission)
- Payment integration
- Booking confirmation workflow
- Access code generation (6-digit)

### **Alga Pay (Payment Gateway):**
- White-labeled unified payment interface
- Multi-processor support (Chapa, Stripe, PayPal, TeleBirr)
- Automatic processor selection based on currency
- Commission calculation (12% platform fee)
- Tax calculation (VAT + withholding)
- Invoice generation (PDF)

### **Delala Agent Commission System:**
- Agent registration and verification
- Property linking (agents link properties)
- Commission calculation (5% for 36 months)
- Automated TeleBirr payouts
- Agent dashboard with earnings tracking

### **Review System (ALGA Review Engine):**
- Weighted rating algorithm
- Time-decay (recent reviews weighted more)
- Verified booking requirement
- One review per booking
- Host response capability

### **ID Verification Service:**
- Ethiopian ID upload
- OCR extraction (foreign IDs via Tesseract.js)
- Operator review dashboard
- Fayda ID integration (eKYC)
- QR code scanning for verification

### **Add-On Services Marketplace:**
- 11 service categories
- Provider application system
- Guest booking workflow
- Commission structure
- Service verification

---

## 4. Third-Party Service Integrations

### **Payment Processors:**
1. **Chapa** - Ethiopian payment gateway
2. **Stripe** - International card payments
3. **PayPal** - International alternative
4. **TeleBirr** - Ethiopian mobile money

### **Communication:**
5. **SendGrid** - Email notifications
6. **Ethiopian Telecom SMS** - SMS notifications

### **Identity Verification:**
7. **Fayda ID** - Ethiopian national ID eKYC

### **Tax Compliance:**
8. **ERCA Integration** - Ethiopian Revenue & Customs Authority

### **Maps:**
9. **Google Maps Geocoding API** - Location services

### **File Storage:**
10. **Replit Object Storage** - Image/document storage (Google Cloud Storage backend)

---

## 5. User Types and Actors

### **1. Guest (Public User)**
**Capabilities:**
- Browse properties
- Search with filters
- View property details
- Make bookings
- Submit reviews
- Request add-on services
- Manage profile

**Restrictions:**
- Cannot list properties
- Cannot access host/admin features

### **2. Host (Property Owner)**
**Capabilities:**
- List properties
- Upload images
- Set pricing and availability
- Manage bookings
- Respond to reviews
- View earnings dashboard
- Generate access codes

**Restrictions:**
- Cannot access other hosts' properties
- Cannot verify IDs
- No admin privileges

### **3. Agent (Delala)**
**Capabilities:**
- Link properties for commission
- View commission dashboard
- Track earnings
- Receive TeleBirr payouts

**Restrictions:**
- Cannot modify property details
- No payout control (automated)
- Cannot verify own linked properties

### **4. Operator**
**Capabilities:**
- Verify user IDs
- Moderate reviews
- Approve property listings
- Flag suspicious activity

**Restrictions:**
- Cannot access payments
- Cannot change user roles
- Limited to assigned tasks

### **5. Admin**
**Capabilities:**
- Full platform control
- User management (roles, status)
- Approve/reject agents
- System configuration
- View all data
- Generate reports

**Restrictions:**
- Actions are fully audited
- Cannot delete audit logs

---

## 6. System Dependencies

### **Hosting Requirements:**
- **Platform:** Cloud-based (Replit Infrastructure)
- **Compute:** Auto-scaling
- **Database:** Serverless PostgreSQL (Neon)
- **Storage:** Object storage (Google Cloud Storage)

### **Minimum Browser Requirements:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Environment Variables Required:**
```
DATABASE_URL (PostgreSQL connection string)
SESSION_SECRET (Session encryption)
CHAPA_SECRET_KEY (Payment processor)
STRIPE_SECRET_KEY (Payment processor)
PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
SENDGRID_API_KEY (Email notifications)
GOOGLE_MAPS_API_KEY (Location services)
VITE_GOOGLE_MAPS_API_KEY (Frontend maps)
```

---

## 7. Implemented Security Standards

### **OWASP Top 10 2021:**
✅ A01: Broken Access Control (RBAC enforced)  
✅ A02: Cryptographic Failures (TLS, Bcrypt, AES-256)  
✅ A03: Injection (100% ORM - no raw SQL)  
✅ A04: Insecure Design (Threat modeling done)  
✅ A05: Security Misconfiguration (INSA hardening)  
✅ A06: Vulnerable Components (Weekly npm audit)  
✅ A07: Authentication Failures (Bcrypt, rate limiting)  
✅ A08: Software/Data Integrity (Audit logs, validation)  
✅ A09: Logging Failures (Comprehensive logging)  
✅ A10: SSRF (Controlled external calls)

### **Security Policies:**
- Password Policy: Min 8 chars, complexity required
- Session Policy: 24-hour timeout, httpOnly cookies
- Rate Limiting: 100 requests per 15 minutes per IP
- File Upload: 5MB max, type validation
- Data Retention: 90 days for audit logs

---

## 8. Existing Security Infrastructure

### **Edge/Network Layer:**
- TLS 1.2+ (HTTPS enforced)
- HSTS (HTTP Strict Transport Security)
- Replit Reverse Proxy (built-in DDoS protection)

### **Application Layer:**
- Helmet.js (Security headers: CSP, X-Frame-Options, etc.)
- CORS (Configured allowed origins)
- Rate Limiting (express-rate-limit)
- Input Validation (Zod schemas + express-validator)
- XSS Protection (Custom INSA layer + React escaping)
- CSRF Protection (SameSite cookies)
- HPP Protection (Parameter pollution)

### **Data Layer:**
- Drizzle ORM (SQL injection prevention)
- Bcrypt Password Hashing (10 rounds)
- PostgreSQL Encryption at Rest (Neon AES-256)
- Secure Session Storage (PostgreSQL)

### **Monitoring:**
- Audit Logging (user_activity_log table)
- Error Logging (server-side only)
- Security Event Tracking

---

## 9. Functional Requirements

### **Core Workflows:**

**1. User Registration:**
- Input: Phone/Email
- Send OTP (4-digit code)
- Verify OTP
- Create account (bcrypt hashed password)
- Redirect to profile setup

**2. User Login:**
- Input: Email + Password or OTP
- Validate credentials (bcrypt compare)
- Create session (PostgreSQL store)
- Redirect to dashboard/home

**3. Property Listing (Host):**
- Upload property details
- Upload images (up to 10, 5MB each)
- Set pricing and availability
- Submit for operator approval
- Property goes live after approval

**4. Property Search (Guest):**
- Input: Location, dates, guests, price range
- Filter results
- Sort by price/rating/distance
- View property details
- Initiate booking

**5. Booking Process:**
- Select dates (conflict check)
- View total price (nights × rate + 12% commission)
- Choose payment method
- Process payment via Alga Pay
- Generate access code
- Send confirmation (email/SMS)
- Create booking record

**6. Payment Processing:**
- Guest selects payment method
- Alga Pay routes to appropriate processor
- Process payment (100% to host)
- Calculate platform commission (12%)
- Calculate agent commission (5% if applicable)
- Generate invoice (PDF with ERCA tax details)
- Update booking status

**7. Review Submission:**
- Verified booking required
- Rating (1-5 stars) + text review
- Submit within 30 days of checkout
- ALGA Review Engine calculates weighted rating
- Notify host of new review

---

## 10. Non-Functional Requirements

### **Performance:**
- Page load time: <2 seconds (avg)
- API response time: <500ms (p95)
- Concurrent users: 1000+ supported
- Database query optimization (indexed fields)

### **Availability:**
- Uptime target: 99.9%
- Neon database auto-failover
- Serverless architecture (no single point of failure)
- Automated health checks

### **Scalability:**
- Horizontal scaling (Replit auto-scaling)
- Serverless database (auto-scaling connection pool)
- CDN-ready (static assets)
- Stateless backend (session in database)

### **Reliability:**
- Daily automated backups (Neon)
- Point-in-time recovery (30 days)
- Error handling (graceful degradation)
- Retry logic for external services

### **Maintainability:**
- TypeScript strict mode (type safety)
- Comprehensive documentation
- Modular code structure
- Automated testing (planned)
- Git version control

### **Security:**
- Encryption in-transit (TLS 1.2+)
- Encryption at-rest (AES-256)
- Session management (secure, httpOnly cookies)
- Audit logging (90-day retention)
- Regular security updates (weekly npm audit)

---

**Document Prepared By:** Alga Development Team  
**For:** INSA Web Application Security Audit  
**Last Updated:** November 6, 2025
