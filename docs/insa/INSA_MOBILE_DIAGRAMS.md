# INSA Mobile Application Security Audit - Technical Diagrams

## 1. Mobile Application Architecture Diagram

```mermaid
graph TB
    subgraph "Mobile Clients"
        A1[Android Native<br/>Kotlin + WebView]
        A2[iOS Native<br/>Swift + WKWebView]
        A3[PWA Browser<br/>Chrome/Safari]
    end
    
    subgraph "Capacitor Bridge Layer"
        B1[JavaScript API]
        B2[Native Plugin Bridge]
        B3[Camera Plugin]
        B4[GPS Plugin]
        B5[Push Notifications]
        B6[Secure Storage]
    end
    
    subgraph "Web Application Layer"
        C1[React 18 + TypeScript]
        C2[Vite 5.0 Build]
        C3[Wouter Routing]
        C4[React Query State]
        C5[Shadcn/UI Components]
    end
    
    subgraph "Backend API Server"
        D1[Express.js + Node.js]
        D2[INSA Security Middleware]
        D3[Session Management]
        D4[Authentication Routes]
        D5[Business Logic Routes]
    end
    
    subgraph "Data Storage"
        E1[(PostgreSQL<br/>Neon Database)]
        E2[Replit Object Storage<br/>Google Cloud]
        E3[IndexedDB<br/>Offline Cache]
    end
    
    subgraph "External Services"
        F1[Chapa Payment<br/>TeleBirr]
        F2[Stripe Payment<br/>Cards]
        F3[SendGrid Email]
        F4[Ethiopian Telecom SMS]
        F5[Google Maps API]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> C1
    
    B1 --> B2
    B2 --> B3
    B2 --> B4
    B2 --> B5
    B2 --> B6
    
    B1 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    
    C1 -->|HTTPS/TLS 1.2+| D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D3 --> D5
    
    D4 --> E1
    D5 --> E1
    D5 --> E2
    C1 --> E3
    
    D5 -->|Secure API| F1
    D5 -->|Secure API| F2
    D5 -->|API Key| F3
    D5 -->|API Key| F4
    D5 -->|API Key| F5
    
    style A1 fill:#90EE90
    style A2 fill:#90EE90
    style A3 fill:#87CEEB
    style D2 fill:#FFB6C1
    style E1 fill:#FFD700
    style F1 fill:#FFA500
    style F2 fill:#FFA500
```

## 2. Data Flow Diagram - Mobile Application

```mermaid
flowchart TD
    subgraph "User Actions"
        U1[Guest User]
        U2[Host User]
        U3[Delala Agent]
        U4[Operator]
    end
    
    subgraph "Mobile UI Layer"
        M1[Property Search]
        M2[Booking Creation]
        M3[ID Document Upload]
        M4[Payment Processing]
        M5[Property Management]
    end
    
    subgraph "Capacitor Plugins"
        P1[Camera Plugin<br/>ID Scanning]
        P2[GPS Plugin<br/>Location]
        P3[Push Notifications<br/>Alerts]
        P4[Secure Storage<br/>Tokens]
    end
    
    subgraph "API Communication HTTPS/TLS"
        A1[GET /api/properties]
        A2[POST /api/bookings]
        A3[POST /api/verification/upload]
        A4[POST /api/payments/initialize]
        A5[POST /api/properties]
    end
    
    subgraph "Backend Processing"
        B1[Authentication<br/>Session Validation]
        B2[Business Logic<br/>Validation]
        B3[Database Operations<br/>Drizzle ORM]
        B4[External API Calls<br/>Payment/SMS]
    end
    
    subgraph "Data Storage"
        D1[(PostgreSQL<br/>Users, Properties<br/>Bookings)]
        D2[Object Storage<br/>Images, Documents]
        D3[IndexedDB<br/>Offline Cache]
    end
    
    U1 --> M1
    U1 --> M2
    U1 --> M3
    U2 --> M5
    U3 --> M5
    U4 --> M3
    
    M1 --> P2
    M3 --> P1
    M2 --> M4
    M1 --> A1
    M2 --> A2
    M3 --> A3
    M4 --> A4
    M5 --> A5
    
    P1 -->|Base64 Image| A3
    P2 -->|GPS Coords| A1
    P4 -->|Session Token| A1
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    A5 --> B1
    
    B1 --> B2
    B2 --> B3
    B2 --> B4
    
    B3 --> D1
    B3 --> D2
    B2 --> D3
    
    B4 -->|Chapa/TeleBirr| M4
    B4 -->|SMS OTP| U1
    
    D1 -.Offline Sync.-> D3
    
    P3 -.Push Notifications.-> U1
    P3 -.Push Notifications.-> U2
    
    style B1 fill:#FFB6C1
    style B2 fill:#FFB6C1
    style D1 fill:#FFD700
    style D2 fill:#FFD700
    style P4 fill:#90EE90
```

## 3. Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROPERTIES : hosts
    USERS ||--o{ BOOKINGS : makes
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ FAVORITES : has
    USERS ||--o{ VERIFICATION_DOCUMENTS : uploads
    USERS ||--o{ DELALA_AGENTS : registers_as
    USERS ||--o{ LEMLEM_CHATS : converses
    
    PROPERTIES ||--o{ BOOKINGS : receives
    PROPERTIES ||--o{ REVIEWS : gets
    PROPERTIES ||--o{ FAVORITES : favorited_in
    PROPERTIES ||--|| PROPERTY_INFO : has_details
    PROPERTIES ||--o{ AGENT_COMMISSIONS : earns_from
    
    BOOKINGS ||--|| REVIEWS : generates
    BOOKINGS ||--o{ AGENT_COMMISSIONS : creates
    BOOKINGS ||--o{ LEMLEM_CHATS : relates_to
    
    DELALA_AGENTS ||--o{ AGENT_COMMISSIONS : earns
    
    USERS {
        varchar id PK
        varchar email UK
        varchar password
        varchar role
        varchar phone_number UK
        boolean phone_verified
        boolean id_verified
        varchar id_number
        varchar fayda_id
        boolean fayda_verified
        varchar status
        timestamp created_at
    }
    
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
        text[] amenities
        text[] images
        decimal rating
        timestamp created_at
    }
    
    BOOKINGS {
        serial id PK
        integer property_id FK
        varchar guest_id FK
        timestamp check_in
        timestamp check_out
        decimal total_price
        varchar status
        varchar payment_method
        varchar payment_status
        varchar payment_ref
        decimal alga_commission
        decimal vat
        decimal withholding
        decimal host_payout
        timestamp created_at
    }
    
    REVIEWS {
        serial id PK
        integer property_id FK
        integer booking_id FK
        varchar reviewer_id FK
        integer rating
        text comment
        integer cleanliness
        integer communication
        timestamp created_at
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
    
    DELALA_AGENTS {
        serial id PK
        varchar user_id FK
        varchar business_name
        varchar tin
        decimal commission_rate
        integer commission_duration_months
        decimal total_earnings
        varchar status
        timestamp created_at
    }
    
    AGENT_COMMISSIONS {
        serial id PK
        integer agent_id FK
        integer booking_id FK
        integer property_id FK
        decimal commission_amount
        varchar payment_status
        timestamp expires_at
        timestamp created_at
    }
    
    PROPERTY_INFO {
        serial id PK
        integer property_id FK
        varchar wifi_network
        varchar wifi_password
        varchar lockbox_code
        text nearest_restaurants
        text nearest_attractions
        text transportation_tips
        timestamp created_at
    }
    
    LEMLEM_CHATS {
        serial id PK
        varchar user_id FK
        integer booking_id FK
        integer property_id FK
        text message
        boolean is_user
        boolean used_template
        timestamp timestamp
    }
    
    FAVORITES {
        serial id PK
        varchar user_id FK
        integer property_id FK
        timestamp created_at
    }
```

## 4. User Role & Permission Matrix

```mermaid
graph LR
    subgraph "User Roles"
        R1[Guest]
        R2[Host]
        R3[Delala Agent]
        R4[Operator]
        R5[Admin]
    end
    
    subgraph "Permissions - Property"
        P1[Browse Properties]
        P2[Create Property]
        P3[Edit Own Property]
        P4[Verify Property]
        P5[Delete Any Property]
    end
    
    subgraph "Permissions - Booking"
        B1[Create Booking]
        B2[View Own Bookings]
        B3[View All Bookings]
        B4[Cancel Booking]
    end
    
    subgraph "Permissions - Verification"
        V1[Upload ID]
        V2[Verify Documents]
        V3[Approve Properties]
    end
    
    subgraph "Permissions - Financial"
        F1[Make Payment]
        F2[View Earnings]
        F3[Request Payout]
        F4[View All Transactions]
    end
    
    R1 --> P1
    R1 --> B1
    R1 --> B2
    R1 --> B4
    R1 --> V1
    R1 --> F1
    
    R2 --> P1
    R2 --> P2
    R2 --> P3
    R2 --> B2
    R2 --> V1
    R2 --> F2
    R2 --> F3
    
    R3 --> P1
    R3 --> P2
    R3 --> B2
    R3 --> F2
    R3 --> F3
    
    R4 --> P1
    R4 --> B3
    R4 --> V2
    R4 --> V3
    
    R5 --> P1
    R5 --> P2
    R5 --> P3
    R5 --> P4
    R5 --> P5
    R5 --> B3
    R5 --> V2
    R5 --> V3
    R5 --> F4
    
    style R5 fill:#FFB6C1
    style R4 fill:#FFA500
    style V2 fill:#90EE90
    style V3 fill:#90EE90
    style F4 fill:#FFD700
```

## 5. Authentication & Session Flow

```mermaid
sequenceDiagram
    participant U as User Mobile App
    participant C as Capacitor Bridge
    participant API as Backend API
    participant DB as PostgreSQL
    participant SMS as Ethiopian Telecom
    
    Note over U,SMS: OTP-Based Authentication
    
    U->>API: POST /api/auth/otp<br/>{phoneNumber}
    API->>DB: Check if user exists
    DB-->>API: User found/not found
    API->>API: Generate 4-digit OTP<br/>Set 5-minute expiry
    API->>DB: Save OTP + expiry
    API->>SMS: Send OTP via SMS
    SMS-->>U: "Your Alga code: 1234"
    API-->>U: 200 OK {message: "OTP sent"}
    
    U->>U: User enters OTP
    U->>API: POST /api/auth/verify-otp<br/>{phoneNumber, otp}
    API->>DB: Verify OTP + expiry
    
    alt OTP Valid
        DB-->>API: OTP matches, not expired
        API->>API: Create session<br/>Generate session ID
        API->>DB: Save session in sessions table
        API-->>U: 200 OK + Set-Cookie<br/>(httpOnly, secure, sameSite)
        U->>C: Store session token<br/>in Secure Storage
        C-->>U: Token stored securely
    else OTP Invalid/Expired
        DB-->>API: OTP mismatch or expired
        API-->>U: 401 Unauthorized<br/>{message: "Invalid OTP"}
    end
    
    Note over U,DB: Authenticated Requests
    
    U->>API: GET /api/bookings<br/>Cookie: session_id=xxx
    API->>DB: Validate session
    DB-->>API: Session valid, user data
    API->>DB: Fetch user bookings
    DB-->>API: Bookings data
    API-->>U: 200 OK {bookings: [...]}
    
    Note over U,DB: Session Timeout (24 hours)
    
    API->>DB: Check session expiry<br/>(automatic cleanup)
    DB-->>API: Session expired
    API-->>U: 401 Unauthorized<br/>{message: "Session expired"}
    U->>U: Redirect to login
```

## 6. Payment Processing Flow (Mobile)

```mermaid
sequenceDiagram
    participant U as User Mobile App
    participant API as Backend API
    participant DB as PostgreSQL
    participant Chapa as Chapa/TeleBirr
    participant Host as Host Wallet
    
    Note over U,Host: Booking Payment Flow
    
    U->>API: POST /api/bookings<br/>{propertyId, checkIn, checkOut, guests}
    API->>DB: Check property availability
    DB-->>API: Available ✓
    
    API->>API: Calculate breakdown:<br/>- Subtotal: 4000 ETB<br/>- Commission: 400 ETB (10%)<br/>- Agent: 200 ETB (5%)<br/>- VAT: 90 ETB (15% on comm)<br/>- Withholding: 30 ETB (5%)<br/>- Host payout: 3280 ETB
    
    API->>DB: Create booking<br/>(status: pending)
    API-->>U: 200 OK {booking, totalPrice, breakdown}
    
    U->>U: User confirms payment<br/>Selects TeleBirr
    U->>API: POST /api/payments/initialize<br/>{bookingId, method: "telebirr"}
    
    API->>Chapa: Initialize payment<br/>amount: 4000 ETB
    Chapa-->>API: Payment URL + tx_ref
    API->>DB: Save payment reference
    API-->>U: {paymentUrl, tx_ref}
    
    U->>Chapa: Open in-app browser<br/>Complete TeleBirr payment
    Chapa-->>U: Payment success
    Chapa->>API: Webhook: Payment confirmed
    
    API->>Chapa: Verify transaction<br/>GET /verify/{tx_ref}
    Chapa-->>API: Status: SUCCESS
    
    API->>DB: Update booking.paymentStatus = "paid"
    API->>DB: Update booking.status = "confirmed"
    API->>API: Generate 6-digit access code
    API->>DB: Save access code
    
    API->>API: Generate ERCA invoice PDF
    API->>U: Push notification:<br/>"Payment confirmed!"
    API->>U: Email + SMS:<br/>Booking details + access code
    
    Note over API,Host: Host Payout (T+7 days)
    
    API->>Host: Transfer 3280 ETB<br/>via TeleBirr API
    Host-->>API: Payout confirmed
    API->>DB: Update payout status
```

## 7. ID Verification Workflow (Camera Integration)

```mermaid
sequenceDiagram
    participant U as User Mobile App
    participant Cam as Camera Plugin
    participant API as Backend API
    participant Storage as Object Storage
    participant OCR as Tesseract.js
    participant Op as Operator Mobile
    participant DB as PostgreSQL
    
    Note over U,DB: ID Document Upload Flow
    
    U->>U: Click "Scan ID"
    U->>Cam: Request camera permission
    Cam-->>U: Permission granted
    
    Cam->>Cam: Launch native camera
    U->>Cam: Take photo of ID
    Cam-->>U: Image captured<br/>(Base64 encoded)
    
    U->>U: Compress image<br/>(browser-image-compression)
    U->>API: POST /api/verification/upload<br/>{userId, documentType, imageData}
    
    API->>Storage: Upload image<br/>(encrypted at rest)
    Storage-->>API: Document URL
    
    API->>OCR: Extract text from image
    OCR-->>API: Parsed data:<br/>- ID Number: 01018091940<br/>- Full Name: WEYNI ABRAHA<br/>- Expiry: 12/31/2028
    
    API->>DB: Create verification_document<br/>(status: pending)
    API-->>U: 200 OK {status: "pending_review"}
    
    Note over Op,DB: Operator Verification
    
    Op->>API: GET /api/verification/pending
    API->>DB: Fetch pending verifications
    DB-->>API: Documents list
    API-->>Op: {documents: [...]}
    
    Op->>Op: Review ID document<br/>Check photo quality<br/>Verify extracted data
    
    alt Document Approved
        Op->>API: POST /api/verification/{id}/approve
        API->>DB: Update status = "approved"<br/>Set user.idVerified = true
        API->>U: Push notification:<br/>"ID verified ✓"
    else Document Rejected
        Op->>API: POST /api/verification/{id}/reject<br/>{reason: "Photo unclear"}
        API->>DB: Update status = "rejected"
        API->>U: Push notification:<br/>"ID rejected - please resubmit"
    end
```

## 8. OWASP Mobile Top 10 Threat Model

```mermaid
graph TD
    subgraph "OWASP Mobile Top 10"
        M1[M1: Improper Platform Usage]
        M2[M2: Insecure Data Storage]
        M3[M3: Insecure Communication]
        M4[M4: Insecure Authentication]
        M5[M5: Insufficient Cryptography]
        M6[M6: Insecure Authorization]
        M7[M7: Client Code Quality]
        M8[M8: Code Tampering]
        M9[M9: Reverse Engineering]
        M10[M10: Extraneous Functionality]
    end
    
    subgraph "Alga Security Controls"
        C1[Capacitor Best Practices]
        C2[Encrypted Secure Storage<br/>SQLCipher Planned]
        C3[TLS 1.2+ Enforcement<br/>Certificate Pinning Planned]
        C4[Session-Based Auth<br/>OTP + Bcrypt]
        C5[Bcrypt Hashing<br/>TLS Encryption]
        C6[RBAC Server-Side<br/>Least Privilege]
        C7[TypeScript Type Safety<br/>Zod Validation]
        C8[ProGuard Obfuscation<br/>Root Detection Planned]
        C9[Code Obfuscation<br/>Server-Side Logic]
        C10[Production Build<br/>No Debug Code]
    end
    
    subgraph "Risk Status"
        R1[✅ Mitigated]
        R2[⚠️ Partial - SQLCipher Pending]
        R3[⚠️ Partial - Cert Pinning Pending]
        R4[✅ Mitigated]
        R5[✅ Mitigated]
        R6[✅ Mitigated]
        R7[✅ Mitigated]
        R8[⚠️ Partial - Root Detection Pending]
        R9[⚠️ Partial - Obfuscation Only]
        R10[✅ Mitigated]
    end
    
    M1 --> C1 --> R1
    M2 --> C2 --> R2
    M3 --> C3 --> R3
    M4 --> C4 --> R4
    M5 --> C5 --> R5
    M6 --> C6 --> R6
    M7 --> C7 --> R7
    M8 --> C8 --> R8
    M9 --> C9 --> R9
    M10 --> C10 --> R10
    
    style R1 fill:#90EE90
    style R2 fill:#FFD700
    style R3 fill:#FFD700
    style R4 fill:#90EE90
    style R5 fill:#90EE90
    style R6 fill:#90EE90
    style R7 fill:#90EE90
    style R8 fill:#FFD700
    style R9 fill:#FFD700
    style R10 fill:#90EE90
```

## 9. Offline-First Architecture (PWA + Capacitor)

```mermaid
graph TB
    subgraph "Online State"
        O1[User Request]
        O2[Network First Strategy]
        O3[Backend API]
        O4[Update IndexedDB Cache]
        O5[Display Fresh Data]
    end
    
    subgraph "Offline State"
        F1[User Request]
        F2[Check IndexedDB]
        F3[Cached Data Available?]
        F4[Display Cached Data]
        F5[Show Offline Indicator]
        F6[Queue Action for Sync]
    end
    
    subgraph "Background Sync"
        S1[Network Restored]
        S2[Service Worker Sync Event]
        S3[Process Queued Actions]
        S4[Update Backend API]
        S5[Refresh Cache]
    end
    
    O1 --> O2
    O2 --> O3
    O3 --> O4
    O4 --> O5
    
    F1 --> F2
    F2 --> F3
    F3 -->|Yes| F4
    F3 -->|No| F5
    F4 --> F6
    
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    
    style O3 fill:#90EE90
    style F4 fill:#FFD700
    style S4 fill:#87CEEB
```

## 10. Security Layers - Defense in Depth

```mermaid
graph TD
    subgraph "Layer 1: Application Security"
        L1A[INSA Security Hardening]
        L1B[Helmet.js HTTP Headers]
        L1C[CORS Protection]
        L1D[Rate Limiting]
        L1E[XSS Protection]
        L1F[SQL Injection Prevention]
    end
    
    subgraph "Layer 2: Authentication"
        L2A[Session-Based Auth]
        L2B[OTP Verification]
        L2C[Bcrypt Password Hashing]
        L2D[24-Hour Session Timeout]
        L2E[Biometric Auth Planned]
    end
    
    subgraph "Layer 3: Network Security"
        L3A[TLS 1.2+ Enforcement]
        L3B[Certificate Validation]
        L3C[Certificate Pinning Planned]
        L3D[No HTTP Traffic]
        L3E[Secure WebSocket WSS]
    end
    
    subgraph "Layer 4: Data Protection"
        L4A[PostgreSQL Encryption at Rest]
        L4B[Encrypted Secure Storage]
        L4C[SQLCipher Planned]
        L4D[Object Storage Encryption]
    end
    
    subgraph "Layer 5: Authorization"
        L5A[Role-Based Access Control]
        L5B[Server-Side Validation]
        L5C[Least Privilege Principle]
    end
    
    subgraph "Layer 6: Code Protection"
        L6A[ProGuard Obfuscation Android]
        L6B[Swift Obfuscation iOS]
        L6C[Root/Jailbreak Detection Planned]
        L6D[No Hardcoded Secrets]
    end
    
    User[User Mobile App] --> L1A
    L1A --> L1B
    L1B --> L1C
    L1C --> L1D
    L1D --> L1E
    L1E --> L1F
    
    L1F --> L2A
    L2A --> L2B
    L2B --> L2C
    L2C --> L2D
    L2D --> L2E
    
    L2E --> L3A
    L3A --> L3B
    L3B --> L3C
    L3C --> L3D
    L3D --> L3E
    
    L3E --> L4A
    L4A --> L4B
    L4B --> L4C
    L4C --> L4D
    
    L4D --> L5A
    L5A --> L5B
    L5B --> L5C
    
    L5C --> L6A
    L6A --> L6B
    L6B --> L6C
    L6C --> L6D
    
    L6D --> Backend[Backend API - Protected]
    
    style L1A fill:#FFB6C1
    style L3A fill:#90EE90
    style L4A fill:#FFD700
    style L5A fill:#87CEEB
    style Backend fill:#98FB98
```

---

## How to Use These Diagrams

1. **Copy the Mermaid code** from each section
2. **Paste into:**
   - GitHub Markdown (renders automatically)
   - Mermaid Live Editor: https://mermaid.live
   - VS Code with Mermaid extension
   - Replit markdown preview

3. **For INSA Submission:**
   - Export diagrams as PNG/SVG from Mermaid Live Editor
   - Include in final PDF submission document
   - Reference diagram numbers in text (e.g., "See Diagram 2: Data Flow")

---

**Document Status:** ✅ Complete - 10 Comprehensive Diagrams  
**Format:** Mermaid.js (Markdown-compatible)  
**Purpose:** INSA Mobile Application Security Testing Requirements  
**Date:** January 11, 2025
