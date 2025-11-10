# INSA Mobile App Submission - 3 Essential Diagrams (A4 Size)

## Diagram 1: Business Architecture (Simplified)

```mermaid
graph TB
    subgraph Users
        G[Guests/Travelers]
        H[Property Hosts]
        A[Delala Agents]
    end
    
    subgraph "Alga Platform"
        APP[Mobile App<br/>Android/iOS/PWA]
        BOOK[Booking System]
        PAY[Payment Gateway<br/>Alga Pay]
        VER[Verification<br/>ID + Property]
    end
    
    subgraph Revenue
        COM[10% Platform Fee]
        AGT[5% Agent Commission]
    end
    
    subgraph Partners
        TEL[TeleBirr/Chapa<br/>Payments]
        SMS[Ethiopian Telecom<br/>SMS OTP]
        DB[Neon Database<br/>PostgreSQL]
        STOR[Google Cloud<br/>File Storage]
    end
    
    subgraph Compliance
        ERCA[ERCA Tax<br/>TIN: 0101809194]
        INSA[INSA Security<br/>Mobile Audit]
        NBE[National Bank<br/>Payment License]
    end
    
    G --> APP
    H --> APP
    A --> APP
    
    APP --> BOOK
    APP --> VER
    BOOK --> PAY
    
    PAY --> COM
    A --> AGT
    
    PAY --> TEL
    VER --> SMS
    APP --> DB
    VER --> STOR
    
    COM --> ERCA
    APP --> INSA
    PAY --> NBE
    
    style APP fill:#FFD700
    style PAY fill:#90EE90
    style INSA fill:#FFB6C1
```

---

## Diagram 2: Data Flow (Simplified)

```mermaid
flowchart LR
    subgraph Client
        MOB[Mobile App<br/>React + Capacitor]
    end
    
    subgraph Server
        API[Express.js API<br/>Node.js + TypeScript]
    end
    
    subgraph Storage
        DB[(PostgreSQL<br/>Neon Database<br/>AES-256 Encrypted)]
        FILES[Google Cloud<br/>Storage<br/>ID Documents]
    end
    
    subgraph External
        PAY[Payment APIs<br/>Chapa/Stripe/PayPal]
        SMS[Ethiopian Telecom<br/>SMS Gateway]
    end
    
    MOB -->|HTTPS/TLS 1.2+<br/>JSON Requests| API
    API -->|Encrypted SQL<br/>Queries| DB
    API -->|Pre-signed URLs<br/>1hr Expiry| FILES
    API -->|HTTPS API Calls| PAY
    API -->|SMS OTP<br/>4-digit Code| SMS
    
    DB -->|Encrypted Response| API
    FILES -->|Download Link| API
    PAY -->|Payment Status| API
    SMS -->|Delivery Status| API
    
    API -->|JSON Response| MOB
    
    style MOB fill:#87CEEB
    style API fill:#FFD700
    style DB fill:#90EE90
    style FILES fill:#FFB6C1
```

**Data Encryption:**
- **In Transit:** TLS 1.2+ (all connections)
- **At Rest:** AES-256 (database + files)
- **Passwords:** Bcrypt hash (cost 12, one-way)

---

## Diagram 3: System Architecture with Database Relationships

```mermaid
graph TB
    subgraph "Frontend Layer"
        AND[Android App<br/>Capacitor 6.0]
        IOS[iOS App<br/>Capacitor 6.0]
        PWA[Web App<br/>Progressive Web App]
    end
    
    subgraph "Application Layer"
        REACT[React 18 + TypeScript<br/>Vite 5.0 Build Tool]
        STATE[React Query<br/>Server State Management]
        UI[Shadcn/UI Components<br/>Tailwind CSS Styling]
    end
    
    subgraph "Backend Layer"
        EXPRESS[Express.js Server<br/>Node.js + TypeScript]
        AUTH[Session Auth<br/>24hr Timeout]
        RBAC[5 User Roles<br/>Guest/Host/Agent/Operator/Admin]
    end
    
    subgraph "Database Layer - PostgreSQL (Neon, AES-256 Encrypted)"
        ORM[Drizzle ORM<br/>Type-Safe Queries]
        
        subgraph "Core Tables"
            USERS[(users<br/>PK: id<br/>role, email, phone)]
            PROPS[(properties<br/>PK: id<br/>FK: host_id → users)]
            BOOKS[(bookings<br/>PK: id<br/>FK: guest_id → users<br/>FK: property_id → properties)]
        end
        
        subgraph "Financial Tables"
            PAYS[(payments<br/>PK: id<br/>FK: booking_id → bookings)]
            COMM[(commissions<br/>PK: id<br/>FK: agent_id → users<br/>FK: booking_id → bookings)]
        end
        
        subgraph "Verification Tables"
            IDS[(id_verifications<br/>PK: id<br/>FK: user_id → users)]
            REVS[(reviews<br/>PK: id<br/>FK: user_id → users<br/>FK: property_id → properties)]
        end
    end
    
    subgraph "Security Layer"
        SEC[Helmet + CORS + Rate Limit + XSS Protection]
    end
    
    subgraph "External Services"
        PAYMENT[Chapa/Stripe/PayPal]
        TELECOM[Ethiopian Telecom SMS]
        STORAGE[Google Cloud Storage]
    end
    
    AND --> REACT
    IOS --> REACT
    PWA --> REACT
    
    REACT --> STATE
    REACT --> UI
    STATE --> EXPRESS
    
    EXPRESS --> AUTH
    EXPRESS --> RBAC
    EXPRESS --> SEC
    
    EXPRESS --> ORM
    ORM --> USERS
    ORM --> PROPS
    ORM --> BOOKS
    ORM --> PAYS
    ORM --> COMM
    ORM --> IDS
    ORM --> REVS
    
    USERS -.->|1:N| PROPS
    USERS -.->|1:N| BOOKS
    PROPS -.->|1:N| BOOKS
    BOOKS -.->|1:1| PAYS
    BOOKS -.->|1:1| COMM
    USERS -.->|1:N| COMM
    USERS -.->|1:1| IDS
    USERS -.->|1:N| REVS
    PROPS -.->|1:N| REVS
    
    EXPRESS --> PAYMENT
    EXPRESS --> TELECOM
    EXPRESS --> STORAGE
    
    style REACT fill:#61DAFB
    style EXPRESS fill:#90EE90
    style USERS fill:#336791
    style PROPS fill:#336791
    style BOOKS fill:#336791
    style SEC fill:#FFB6C1
```

**Database Relationships:**

| Relationship | Type | Description |
|--------------|------|-------------|
| users → properties | 1:N | One host owns many properties |
| users → bookings | 1:N | One guest makes many bookings |
| properties → bookings | 1:N | One property has many bookings |
| bookings → payments | 1:1 | One booking has one payment |
| bookings → commissions | 1:1 | One booking generates one commission |
| users → commissions | 1:N | One agent earns many commissions |
| users → id_verifications | 1:1 | One user has one ID verification |
| users → reviews | 1:N | One user writes many reviews |
| properties → reviews | 1:N | One property receives many reviews |

**Technology Stack Summary:**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | Capacitor 6.0 | Native Android/iOS wrapper |
| **Frontend** | React 18 + TypeScript | UI components |
| **Routing** | Wouter | Client-side navigation |
| **Styling** | Tailwind + Shadcn/UI | Responsive design |
| **Backend** | Express.js + Node.js | REST API server |
| **Database** | PostgreSQL (Neon) | Encrypted data storage |
| **ORM** | Drizzle ORM | Type-safe SQL queries |
| **Auth** | Session + OTP | Passwordless login |
| **Security** | Helmet + CORS + Rate Limit | OWASP protection |
| **Payments** | Chapa + Stripe + PayPal | Multi-processor gateway |

---

## How to Export as A4 PDF

### **Method 1: Mermaid Live (Easiest)**

1. **Go to:** https://mermaid.live/
2. **Copy** one diagram above (everything inside the ```mermaid block)
3. **Paste** into Mermaid Live editor
4. **Click:** "Download SVG"
5. **Open SVG** in Mac Preview
6. **Export as PDF:**
   - File → Export as PDF
   - Paper Size: **A4**
   - Click Save
7. **Repeat** for all 3 diagrams

### **Method 2: Print from Browser**

1. **Copy this entire markdown file** content
2. **Paste** into: https://markdownlivepreview.com/
3. **Press** Command + P (Mac) or Ctrl + P (Windows)
4. **Set:**
   - Destination: Save as PDF
   - Paper Size: A4
   - Margins: Default
5. **Save** as: `INSA_Diagrams_A4.pdf`

---

## Files You'll Submit to INSA

✅ **3 Diagrams (A4 PDFs):**
1. `Business-Architecture.pdf`
2. `Data-Flow.pdf`
3. `System-Architecture.pdf`

✅ **Or Combined:** `INSA_Alga_Diagrams.pdf` (3 pages)

---

**Document Version:** 1.0  
**Created:** January 11, 2025  
**For:** INSA Mobile App Security Audit  
**Company:** Alga One Member PLC (TIN: 0101809194)
