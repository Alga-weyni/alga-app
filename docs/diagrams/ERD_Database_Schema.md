# Entity Relationship Diagram (ERD)
## Alga Platform - Database Schema

```mermaid
erDiagram
    %% ========================================
    %% CORE USER & AUTHENTICATION
    %% ========================================
    
    USERS {
        varchar id PK
        varchar email UK
        varchar password
        varchar first_name
        varchar last_name
        varchar role
        varchar phone_number UK
        boolean phone_verified
        boolean id_verified
        varchar fayda_id
        varchar otp
        timestamp otp_expiry
        varchar status
        timestamp created_at
    }
    
    SESSIONS {
        varchar sid PK
        jsonb sess
        timestamp expire
    }
    
    VERIFICATION_DOCUMENTS {
        serial id PK
        varchar user_id FK
        varchar document_type
        varchar document_url
        varchar status
        varchar verified_by FK
        timestamp verified_at
        timestamp created_at
    }
    
    EMERGENCY_CONTACTS {
        serial id PK
        varchar user_id FK
        varchar contact_name
        varchar contact_phone
        varchar relationship
        timestamp created_at
    }
    
    USER_ACTIVITY_LOG {
        serial id PK
        varchar user_id FK
        varchar action
        jsonb metadata
        timestamp created_at
    }
    
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ VERIFICATION_DOCUMENTS : uploads
    USERS ||--o{ EMERGENCY_CONTACTS : has
    USERS ||--o{ USER_ACTIVITY_LOG : performs
    
    %% ========================================
    %% PROPERTY MANAGEMENT
    %% ========================================
    
    PROPERTIES {
        serial id PK
        varchar host_id FK
        varchar title
        text description
        varchar type
        varchar status
        varchar city
        decimal price_per_night
        integer max_guests
        integer bedrooms
        decimal latitude
        decimal longitude
        text[] images
        decimal rating
        boolean is_active
        timestamp created_at
    }
    
    PROPERTY_INFO {
        serial id PK
        integer property_id FK
        varchar lockbox_code
        text wifi_details
        text house_rules
        jsonb lemlem_context
        timestamp updated_at
    }
    
    FAVORITES {
        serial id PK
        varchar user_id FK
        integer property_id FK
        timestamp created_at
    }
    
    USERS ||--o{ PROPERTIES : hosts
    PROPERTIES ||--|| PROPERTY_INFO : has_details
    USERS ||--o{ FAVORITES : saves
    PROPERTIES ||--o{ FAVORITES : favorited
    
    %% ========================================
    %% BOOKING & PAYMENT FLOW
    %% ========================================
    
    BOOKINGS {
        serial id PK
        integer property_id FK
        varchar guest_id FK
        date check_in
        date check_out
        integer total_guests
        decimal total_amount
        varchar booking_status
        varchar payment_status
        varchar access_code
        timestamp created_at
    }
    
    PAYMENTS {
        serial id PK
        integer booking_id FK
        decimal amount
        varchar currency
        varchar payment_method
        varchar transaction_id UK
        decimal alga_commission
        decimal vat_amount
        decimal host_payout
        varchar status
        timestamp created_at
    }
    
    REVIEWS {
        serial id PK
        integer property_id FK
        varchar guest_id FK
        integer booking_id FK
        integer rating
        integer cleanliness_rating
        integer accuracy_rating
        integer location_rating
        text comment
        timestamp created_at
    }
    
    USERS ||--o{ BOOKINGS : books
    PROPERTIES ||--o{ BOOKINGS : receives
    BOOKINGS ||--|| PAYMENTS : has_payment
    BOOKINGS ||--o| REVIEWS : reviewed_via
    PROPERTIES ||--o{ REVIEWS : has_reviews
    USERS ||--o{ REVIEWS : writes
    
    %% ========================================
    %% AGENT COMMISSION SYSTEM
    %% ========================================
    
    AGENTS {
        serial id PK
        varchar user_id FK
        varchar telebirr_account
        varchar verification_status
        decimal total_earnings
        timestamp created_at
    }
    
    AGENT_PROPERTIES {
        serial id PK
        integer agent_id FK
        integer property_id FK
        timestamp linked_at
        timestamp expires_at
    }
    
    AGENT_COMMISSIONS {
        serial id PK
        integer agent_id FK
        integer booking_id FK
        decimal commission_amount
        varchar payment_status
        timestamp paid_at
        timestamp created_at
    }
    
    USERS ||--|| AGENTS : registers_as
    AGENTS ||--o{ AGENT_PROPERTIES : links
    PROPERTIES ||--o{ AGENT_PROPERTIES : linked_by
    AGENTS ||--o{ AGENT_COMMISSIONS : earns
    BOOKINGS ||--o{ AGENT_COMMISSIONS : generates
    
    %% ========================================
    %% SERVICE MARKETPLACE
    %% ========================================
    
    SERVICES {
        serial id PK
        varchar provider_id FK
        varchar category
        varchar title
        text description
        decimal price
        varchar city
        boolean availability
        timestamp created_at
    }
    
    USERS ||--o{ SERVICES : provides
```

## Database Overview

**Database Type:** PostgreSQL (Neon Serverless)  
**Total Tables:** 20+  
**ORM:** Drizzle ORM (Type-safe, zero raw SQL)  
**Migration Tool:** Drizzle Kit (`npm run db:push`)

---

## Table Descriptions

### 1. USERS (Core User Management)
**Purpose:** Central user registry for all roles  
**Cardinality:** 1 user → Many properties, bookings, reviews  
**Sensitive Fields:** 🔒
- `password` - Bcrypt hashed (cost factor 10)
- `phone_number` - Unique identifier for Ethiopian users
- `otp` - 4-digit one-time password (10-minute expiry)
- `fayda_id` - Ethiopian national ID number (12 digits)
- `id_number` - Government-issued ID number

**Indexes:**
- `email` (unique)
- `phone_number` (unique)
- `fayda_id` (unique, for eKYC lookups)

**Business Rules:**
- `role` determines access control (guest, host, agent, operator, admin)
- `phone_verified` required before booking
- `id_verified` required for hosting properties
- OTP rate limit: 5 per hour per phone number

---

### 2. PROPERTIES (Listing Management)
**Purpose:** Property inventory and metadata  
**Cardinality:** 1 host → Many properties, 1 property → Many bookings  
**Sensitive Fields:** 🔒
- `latitude`, `longitude` - Exact GPS coordinates
- Images stored in Object Storage, URLs in `images[]` array

**Indexes:**
- `host_id` (foreign key)
- `city` (search filter)
- `status` (approval workflow)
- `is_active` (active listings only)

**Business Rules:**
- Max 10 images per property
- Status = 'pending' requires operator approval
- `access_code` auto-generated (6 digits, unique)
- `rating` calculated from weighted review algorithm (ALGA Review Engine)

**Validation:**
- `price_per_night`: Max 1,000,000 ETB
- `max_guests`: Max 50 people
- `latitude`: -90 to 90
- `longitude`: -180 to 180

---

### 3. BOOKINGS (Reservation Management)
**Purpose:** Guest reservations and access control  
**Cardinality:** 1 guest → Many bookings, 1 property → Many bookings  
**Sensitive Fields:** 🔒
- `access_code` - Unique 6-digit code (shared post-payment)
- `total_amount` - Financial data

**Indexes:**
- `property_id` (foreign key)
- `guest_id` (foreign key)
- `booking_status` (workflow filter)
- `check_in`, `check_out` (availability queries)

**Business Rules:**
- Check-in < Check-out (validated)
- No overlapping bookings for same property (enforced in code)
- Access code valid only during booking dates
- Status transitions: pending → confirmed → completed

**Constraints:**
- `total_guests` ≤ property.max_guests
- Dates not in the past

---

### 4. PAYMENTS (Transaction Management)
**Purpose:** Payment processing and commission tracking  
**Cardinality:** 1 booking → 1 payment  
**Sensitive Fields:** 🔒 (ALL fields are sensitive)
- `amount`, `alga_commission`, `vat_amount`, `withholding_tax`, `host_payout`
- `transaction_id` - Processor reference (unique)

**Indexes:**
- `booking_id` (foreign key, unique - 1:1 relationship)
- `transaction_id` (unique)
- `status` (payment workflow)

**Business Rules - Commission Calculation:**
```
Guest Payment: 5000 ETB (example)
├── Host Payout: 5000 ETB (100% to host)
├── Alga Commission: 600 ETB (12% of booking)
│   ├── VAT: 90 ETB (15% of commission)
│   └── Net Platform Revenue: 510 ETB
├── Withholding Tax: 100 ETB (2% of booking)
└── Agent Commission: 250 ETB (5% of booking, paid separately via TeleBirr)
```

**CRITICAL:** Host receives 100% of booking amount. Agent commission (5%) comes from platform's separate service fee via TeleBirr.

---

### 5. AGENTS (Delala Agent System)
**Purpose:** Agent registration and earnings tracking  
**Cardinality:** 1 user → 0 or 1 agent profile  
**Sensitive Fields:** 🔒
- `telebirr_account` - TeleBirr phone number for payouts
- `total_earnings` - Cumulative commission earned

**Indexes:**
- `user_id` (foreign key, unique - 1:1 relationship)
- `verification_status` (approval workflow)

**Business Rules:**
- Must be verified before earning commissions
- TeleBirr account verified during registration
- Can link unlimited properties

---

### 6. AGENT_PROPERTIES (Commission Link Table)
**Purpose:** Track agent-property relationships with 36-month expiry  
**Cardinality:** Many agents → Many properties (M:N via join table)  
**Sensitive Fields:** None (relational data)

**Indexes:**
- `agent_id` (foreign key)
- `property_id` (foreign key)
- `expires_at` (expiry check)

**Business Rules:**
- Commission valid for 36 months from `linked_at`
- After expiry, no commission on new bookings
- Agent can re-link expired properties (new 36-month period)
- Unlimited property links per agent

**Commission Expiry Calculation:**
```sql
expires_at = linked_at + INTERVAL '36 months'
```

---

### 7. AGENT_COMMISSIONS (Commission Tracking)
**Purpose:** Individual commission records per booking  
**Cardinality:** 1 booking → 0 or 1 commission (if agent linked)  
**Sensitive Fields:** 🔒
- `commission_amount` - 5% of booking total

**Indexes:**
- `agent_id` (foreign key)
- `booking_id` (foreign key, unique)
- `payment_status` (payout workflow)

**Business Rules:**
- Commission = 5% of booking `total_amount`
- Only created if:
  1. Property has active agent link (not expired)
  2. Booking status = 'confirmed'
  3. Payment status = 'paid'
- Payout via TeleBirr (weekly/monthly batches)
- Status: pending → paid (with `paid_at` timestamp)

**Sample Commission Record:**
```
Booking: 5000 ETB
Commission: 250 ETB (5%)
Agent: ID #123
TeleBirr: +251911234567
Status: Paid
Paid At: 2025-11-10 14:30:00
```

---

### 8. REVIEWS (ALGA Review Engine)
**Purpose:** Multi-category guest reviews with time-decay weighting  
**Cardinality:** 1 booking → 0 or 1 review, 1 property → Many reviews  
**Sensitive Fields:** None (public data)

**Indexes:**
- `property_id` (foreign key)
- `guest_id` (foreign key)
- `booking_id` (foreign key, unique - only verified bookings)

**Business Rules:**
- Only guests with completed bookings can review
- 6-category rating system:
  1. Overall (1-5 stars)
  2. Cleanliness (1-5)
  3. Accuracy (1-5)
  4. Communication (1-5)
  5. Location (1-5)
  6. Value (1-5)
- Time-decay algorithm weights recent reviews higher
- Property `rating` = weighted average of all reviews

**Weighted Rating Formula:**
```
weight(t) = e^(-λt)  where t = days since review
Overall Rating = Σ(rating × weight) / Σ(weight)
```

---

### 9. SERVICES (Marketplace Services)
**Purpose:** Add-on service listings (cleaning, laundry, transport, etc.)  
**Cardinality:** 1 provider → Many services  
**Sensitive Fields:** None

**Categories (11 total):**
- cleaning, laundry, airport_pickup, electrical, plumbing
- driver, meal_support, local_guide, photography, landscaping, self_care

**Indexes:**
- `provider_id` (foreign key)
- `category` (filter)
- `city` (location filter)

---

### 10. VERIFICATION_DOCUMENTS (ID Verification)
**Purpose:** User ID document uploads for operator review  
**Cardinality:** 1 user → Many documents  
**Sensitive Fields:** 🔒
- `document_url` - Object storage URL (encrypted access)

**Indexes:**
- `user_id` (foreign key)
- `status` (workflow filter)

**Document Types:**
- `national_id` - Ethiopian national ID card
- `passport` - International passport
- `drivers_license` - Ethiopian driver's license
- `property_deed` - Property ownership proof (for hosts)

**Business Rules:**
- Operator reviews within 24-48 hours
- QR code scanning for Ethiopian IDs (html5-qrcode)
- OCR for foreign documents (tesseract.js)
- Fayda ID integration for automated eKYC (future)
- Auto-delete after 90 days (GDPR-style data minimization)

---

### 11. SESSIONS (Session Management)
**Purpose:** Persistent session storage  
**Cardinality:** 1 user → 0 or Many active sessions  
**Sensitive Fields:** 🔒 (ALL fields encrypted)
- `sess` - Session data (user ID, role, preferences)

**Indexes:**
- `expire` (cleanup cron job)

**Session Configuration:**
- Storage: PostgreSQL (connect-pg-simple)
- Cookie: httpOnly, secure (HTTPS only in prod), sameSite='strict'
- Timeout: 24 hours of inactivity
- Auto cleanup: Expired sessions deleted daily

---

### 12. PROPERTY_INFO (Lemlem AI Context)
**Purpose:** Detailed property information for AI assistant  
**Cardinality:** 1 property → 0 or 1 info record (1:1)  
**Sensitive Fields:** 🔒
- `lockbox_code` - Access code location/instructions
- `wifi_details` - Network credentials

**Fields:**
- Parking instructions
- WiFi network name & password
- House rules
- Emergency procedures
- Lemlem AI context (JSON) - Host-provided FAQ, local tips

---

### 13. EMERGENCY_CONTACTS (Safety Feature)
**Purpose:** User's emergency contact information  
**Cardinality:** 1 user → Many emergency contacts  
**Sensitive Fields:** 🔒
- `contact_phone` - Emergency contact phone number

---

### 14. FAVORITES (User Preferences)
**Purpose:** Saved properties for quick access  
**Cardinality:** Many users → Many properties (M:N)  

---

### 15. USER_ACTIVITY_LOG (Personalization)
**Purpose:** Track user actions for recommendations and analytics  
**Cardinality:** 1 user → Many activity logs  

**Actions Tracked:**
- `viewed_property` - Property page visits
- `searched` - Search queries
- `made_booking` - Booking creation
- `chatted_lemlem` - AI assistant interaction
- `favorited` - Property saved

**Privacy:** No PII in metadata, 90-day retention

---

## Sensitive Field Summary 🔒

| Table | Sensitive Fields | Encryption/Protection |
|-------|------------------|----------------------|
| USERS | password, phone_number, otp, fayda_id, id_number | Bcrypt hashing, rate limiting |
| PROPERTIES | latitude, longitude | Access control (host/admin only) |
| BOOKINGS | access_code, total_amount | RBAC (guest/host only) |
| PAYMENTS | ALL fields | Encrypted storage, admin/host only |
| AGENTS | telebirr_account, total_earnings | Agent/admin access only |
| VERIFICATION_DOCUMENTS | document_url | Encrypted, operator/admin only |
| SESSIONS | sess | Encrypted session store |
| PROPERTY_INFO | lockbox_code, wifi_details | Host/guest only (during booking) |
| EMERGENCY_CONTACTS | contact_phone | User/admin only |

---

## Indexes & Performance

**Primary Indexes (Auto-created):**
- All `id` columns (primary keys)
- All `UK` (unique) columns

**Foreign Key Indexes:**
- All `FK` columns for join performance

**Search Indexes (Recommended):**
```sql
CREATE INDEX idx_properties_city_active ON properties(city, is_active);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_agent_commissions_status ON agent_commissions(payment_status);
```

**Full-Text Search (Future):**
```sql
CREATE INDEX idx_properties_search ON properties USING GIN(to_tsvector('english', title || ' ' || description));
```

---

## Data Retention Policies

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| User accounts | Indefinite | User-requested deletion |
| Bookings | 3 years | Automated archival |
| Payments | 7 years | ERCA compliance |
| Sessions | 24 hours | Auto-cleanup cron |
| Activity logs | 90 days | Automated deletion |
| ID documents | 90 days post-verification | Automated secure deletion |
| OTP codes | 10 minutes | Expiry timestamp |

---

## Database Security

1. **Access Control:**
   - Database credentials in environment variables
   - Least privilege principle (app user has limited permissions)
   - Admin access requires separate credentials

2. **Encryption:**
   - At rest: Neon default encryption
   - In transit: TLS 1.2+ (PostgreSQL wire protocol)
   - Application-level: Bcrypt for passwords

3. **Backup & Recovery:**
   - Automated daily backups (Neon)
   - 30-day retention
   - Point-in-time recovery available
   - Disaster recovery RTO: 1 hour, RPO: 15 minutes

4. **Injection Prevention:**
   - Zero raw SQL (100% Drizzle ORM)
   - Parameterized queries only
   - Input validation (Zod schemas)

---

**Document:** Entity Relationship Diagram  
**Created:** November 6, 2025  
**Standard:** INSA OF/AEAD/001  
**Database:** PostgreSQL (Neon Serverless)  
**Tables:** 20+ (Core: 15, Supporting: 5+)  
**Export:** Use mermaid.live, dbdiagram.io, or draw.io to create visual ERD
