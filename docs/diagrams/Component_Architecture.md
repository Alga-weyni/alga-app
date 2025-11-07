# System Architecture Diagram (Part 2/3)
## Component Architecture - Service & Module Breakdown

```mermaid
flowchart TB
    %% Client Layer
    subgraph ClientLayer["📱 CLIENT LAYER (Frontend)"]
        direction TB
        
        subgraph WebApp["🌐 Web Application"]
            React["React 18<br/>(TypeScript)<br/>Component Library"]
            Router["Wouter Router<br/>(Client-side routing)"]
            StateManagement["TanStack Query<br/>(Server state)<br/>+ React Hooks<br/>(Local state)"]
            UIComponents["Shadcn/UI<br/>(Radix UI)<br/>Tailwind CSS"]
        end
        
        subgraph MobileApp["📱 Mobile Application"]
            Capacitor["Capacitor 7.4.4<br/>(Native Bridge)"]
            NativePlugins["Native Plugins<br/>Camera, Geolocation<br/>Push Notifications"]
        end
        
        subgraph PWA["⚡ Progressive Web App"]
            ServiceWorker["Service Worker<br/>(Offline caching)"]
            WebManifest["Web Manifest<br/>(Install prompt)"]
        end
    end
    
    %% API Gateway Layer
    subgraph APILayer["🔌 API LAYER (Backend Entry Point)"]
        ExpressAPI["Express.js API<br/>(RESTful endpoints)<br/>40+ routes"]
        SessionMiddleware["Session Middleware<br/>(express-session)<br/>PostgreSQL store"]
        ValidationMiddleware["Validation<br/>(Zod + express-validator)<br/>Input sanitization"]
    end
    
    %% Business Logic Layer
    subgraph BusinessLayer["⚙️ BUSINESS LOGIC LAYER (Services)"]
        direction TB
        
        subgraph CoreServices["🎯 Core Services"]
            AuthService["Authentication Service<br/>• OTP generation (4-digit)<br/>• Bcrypt password hashing<br/>• Session management"]
            
            PropertyService["Property Service<br/>• CRUD operations<br/>• Image upload/compression<br/>• Availability tracking"]
            
            BookingService["Booking Engine<br/>• Conflict detection<br/>• Access code generation<br/>• Date validation"]
            
            PaymentService["Alga Pay Service<br/>• Multi-processor routing<br/>• Commission calculation<br/>• Invoice generation (PDF)"]
        end
        
        subgraph ExtendedServices["🔧 Extended Services"]
            CommissionService["Commission Service<br/>• Agent link tracking<br/>• 5% calculation<br/>• 36-month expiry"]
            
            ReviewService["Review Engine<br/>• ALGA scoring algorithm<br/>• Time-decay weighting<br/>• Verification checks"]
            
            NotificationService["Notification Service<br/>• SMS (Ethiopian Telecom)<br/>• Email (SendGrid)<br/>• Push notifications"]
            
            IDVerificationService["ID Verification<br/>• Fayda ID integration<br/>• OCR (Tesseract.js)<br/>• Operator queue"]
        end
    end
    
    %% Data Access Layer
    subgraph DataLayer["🗄️ DATA ACCESS LAYER"]
        direction TB
        
        ORM["Drizzle ORM<br/>(Query Builder)<br/>100% SQL injection safe"]
        
        subgraph StorageInterface["Storage Interface"]
            UserStorage["User Repository<br/>CRUD + queries"]
            PropertyStorage["Property Repository<br/>CRUD + queries"]
            BookingStorage["Booking Repository<br/>CRUD + queries"]
            PaymentStorage["Payment Repository<br/>CRUD + queries"]
            AgentStorage["Agent Repository<br/>CRUD + queries"]
        end
    end
    
    %% Database Layer
    subgraph DatabaseLayer["💾 DATABASE LAYER"]
        PostgreSQL["PostgreSQL 16<br/>(Neon Serverless)<br/>20+ tables"]
    end
    
    %% External Integration Layer
    subgraph ExternalLayer["🌐 EXTERNAL INTEGRATIONS"]
        direction TB
        
        subgraph PaymentIntegrations["💳 Payment Integrations"]
            ChapaSDK["Chapa SDK<br/>(chapa-nodejs)"]
            StripeSDK["Stripe SDK<br/>(stripe v14)"]
            PayPalSDK["PayPal SDK<br/>(@paypal/paypal-server-sdk)"]
            TeleBirrAPI["TeleBirr API<br/>(Custom integration)"]
        end
        
        subgraph CommunicationIntegrations["📧 Communications"]
            SendGridSDK["SendGrid SDK<br/>(@sendgrid/mail)"]
            SMSAPI["Ethiopian Telecom SMS<br/>(HTTP API)"]
        end
        
        subgraph GovernmentIntegrations["🏛️ Government APIs"]
            FaydaIDAPI["Fayda ID API<br/>(eKYC verification)"]
            ERCAAPI["ERCA API<br/>(Tax compliance)"]
        end
        
        subgraph UtilityIntegrations["🛠️ Utilities"]
            GoogleMapsAPI["Google Maps API<br/>(Geocoding)"]
            ObjectStorage["Replit Object Storage<br/>(Google Cloud)"]
        end
    end
    
    %% Security Layer (Cross-cutting)
    subgraph SecurityLayer["🔒 SECURITY LAYER (Middleware)"]
        direction LR
        
        Helmet["Helmet.js<br/>(Security headers)"]
        CORS["CORS<br/>(Origin control)"]
        RateLimit["Rate Limiting<br/>(100 req/15min)"]
        INSAHardening["INSA Hardening<br/>(XSS, SQL, CSRF)"]
        XSSClean["XSS Clean<br/>(Sanitization)"]
        HPP["HPP Protection<br/>(Parameter pollution)"]
    end
    
    %% Component Communication Flows
    React & Router & StateManagement & UIComponents -->|"HTTP/HTTPS"| ExpressAPI
    Capacitor & NativePlugins -->|"HTTP/HTTPS"| ExpressAPI
    ServiceWorker -->|"Cached API calls"| ExpressAPI
    
    ExpressAPI --> SecurityLayer
    SecurityLayer --> SessionMiddleware
    SessionMiddleware --> ValidationMiddleware
    ValidationMiddleware --> BusinessLayer
    
    AuthService & PropertyService & BookingService & PaymentService --> DataLayer
    CommissionService & ReviewService & NotificationService & IDVerificationService --> DataLayer
    
    ORM --> StorageInterface
    StorageInterface --> PostgreSQL
    
    AuthService -->|"Send OTP"| SendGridSDK
    AuthService -->|"Send OTP"| SMSAPI
    
    PropertyService -->|"Upload images"| ObjectStorage
    PropertyService -->|"Geocode address"| GoogleMapsAPI
    
    PaymentService -->|"Process payment"| PaymentIntegrations
    
    CommissionService -->|"Payout"| TeleBirrAPI
    
    NotificationService -->|"Email"| SendGridSDK
    NotificationService -->|"SMS"| SMSAPI
    
    IDVerificationService -->|"Verify ID"| FaydaIDAPI
    
    PaymentService -->|"Tax data"| ERCAAPI
    
    %% Styling
    classDef clientClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef apiClass fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    classDef businessClass fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef dataClass fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef dbClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef externalClass fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef securityClass fill:#ffebee,stroke:#c62828,stroke-width:3px
    
    class React,Router,StateManagement,UIComponents,Capacitor,NativePlugins,ServiceWorker,WebManifest clientClass
    class ExpressAPI,SessionMiddleware,ValidationMiddleware apiClass
    class AuthService,PropertyService,BookingService,PaymentService,CommissionService,ReviewService,NotificationService,IDVerificationService businessClass
    class ORM,UserStorage,PropertyStorage,BookingStorage,PaymentStorage,AgentStorage dataClass
    class PostgreSQL dbClass
    class ChapaSDK,StripeSDK,PayPalSDK,TeleBirrAPI,SendGridSDK,SMSAPI,FaydaIDAPI,ERCAAPI,GoogleMapsAPI,ObjectStorage externalClass
    class Helmet,CORS,RateLimit,INSAHardening,XSSClean,HPP securityClass
```

## Service-to-Service Communication

### **Internal Communication (Within Application):**

**1. Client ↔ API Layer:**
- **Protocol:** HTTP/HTTPS (RESTful JSON)
- **Authentication:** Session cookies (httpOnly, secure)
- **Format:** JSON request/response
- **Error Handling:** Standardized error codes (400, 401, 403, 404, 500)

**2. API ↔ Business Logic:**
- **Type:** Direct function calls (same process)
- **Pattern:** Service-oriented architecture
- **Validation:** Zod schemas at API entry, business rules in services
- **Transaction:** Database transactions handled at service layer

**3. Business Logic ↔ Data Layer:**
- **Interface:** Drizzle ORM (TypeScript)
- **Pattern:** Repository pattern (storage interface)
- **Safety:** 100% parameterized queries (zero raw SQL)
- **Connection:** Connection pool (automatic management)

### **External Communication (Third-Party APIs):**

**Payment Processors:**
```
Alga Pay Service
    ↓ (Processor selection logic)
    ├─→ Chapa (ETB) - HTTPS POST
    ├─→ Stripe (USD/EUR) - HTTPS POST + Webhook
    ├─→ PayPal (USD) - OAuth 2.0 + HTTPS
    └─→ TeleBirr (ETB - agent payouts) - HTTPS POST
```

**Communication Services:**
```
Notification Service
    ├─→ SendGrid (Email) - HTTPS POST with API key
    └─→ Ethiopian Telecom (SMS) - HTTPS POST with credentials
```

**Government/Identity:**
```
ID Verification Service
    └─→ Fayda ID - HTTPS POST with government credentials

Payment Service
    └─→ ERCA - HTTPS GET (tax guidelines)
```

### **Middleware Flow:**

**Every API request passes through:**
```
1. HTTPS/TLS → Ensure encrypted transport
2. CORS → Validate origin
3. Helmet → Set security headers
4. Rate Limiting → Prevent abuse (100 req/15min)
5. INSA Hardening → Detect XSS, SQL injection, CSRF
6. Session Middleware → Verify authentication
7. Validation Middleware → Validate input (Zod)
8. Route Handler → Execute business logic
```

### **Key Integration Points:**

**A. Image Upload Pipeline:**
```
Client (React/Capacitor)
    ↓ (Compress image - browser-image-compression)
Client
    ↓ (POST /api/properties/upload)
Property Service
    ↓ (Validate type, size)
Property Service
    ↓ (Upload to storage)
Replit Object Storage (Google Cloud)
    ↓ (Return public URL)
Property Service
    ↓ (Store URL in DB)
PostgreSQL
```

**B. OTP Authentication Flow:**
```
Auth Service
    ↓ (Generate 4-digit OTP)
Auth Service
    ↓ (Hash with Bcrypt)
PostgreSQL (Store hashed OTP)
    ↓
Auth Service
    ↓ (Send plain OTP via SMS)
Ethiopian Telecom SMS API
    ↓
User receives OTP
    ↓ (Submit OTP)
Auth Service
    ↓ (Verify with Bcrypt compare)
PostgreSQL (Match hash)
    ↓ (Create session)
Session Store (PostgreSQL)
```

**C. Payment Processing Flow:**
```
Booking Service
    ↓ (Calculate total)
Payment Service
    ↓ (Select processor by currency)
Payment Service
    ↓ (Create payment request)
External Payment Processor
    ↓ (Process payment)
Payment Processor
    ↓ (Webhook confirmation)
Payment Service
    ↓ (Verify signature)
Payment Service
    ↓ (Update booking status)
Booking Service
    ↓ (Notify host)
Notification Service
```

### **Module Dependencies:**

**Core Dependencies (85+ npm packages):**
- **Web Framework:** express, cors, helmet
- **Database:** drizzle-orm, @neondatabase/serverless
- **Validation:** zod, drizzle-zod, express-validator
- **Security:** bcrypt, xss-clean, express-rate-limit, hpp
- **Payments:** chapa-nodejs, stripe, @paypal/paypal-server-sdk
- **File Handling:** multer, sharp, browser-image-compression
- **Mobile:** @capacitor/core, @capacitor/android, @capacitor/ios

**No Deprecated Dependencies:** All packages actively maintained (as of Nov 2025)

---

**Document:** Component Architecture  
**Created:** November 6, 2025  
**Standard:** INSA System Architecture Requirements  
**Export:** Use mermaid.live to export to PNG/PDF
