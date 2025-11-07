# Data Flow Diagram (DFD) - Detailed Level 1
## Alga Platform - Internal Processes

```mermaid
flowchart LR
    %% LEFT SIDE: External Users
    subgraph Users["👥 EXTERNAL USERS"]
        Guest["👤 Guest"]
        Host["🏠 Host"]
        Agent["🤝 Agent"]
    end
    
    %% CENTER: Core Processes (organized by workflow)
    subgraph CoreProcesses["🔄 CORE PROCESSES"]
        direction TB
        
        subgraph AuthFlow["Authentication Layer"]
            P1["Process 1.0<br/>🔐 AUTH<br/>OTP Login"]
            DB1[("D1: Users")]
            DB7[("D7: Sessions")]
        end
        
        subgraph PropertyFlow["Property Layer"]
            P2["Process 2.0<br/>🏠 PROPERTY<br/>Manage Listings"]
            DB2[("D2: Properties")]
        end
        
        subgraph BookingFlow["Booking Layer"]
            P3["Process 3.0<br/>🔍 SEARCH<br/>Find Properties"]
            P4["Process 4.0<br/>📅 BOOKING<br/>Reserve Dates"]
            DB3[("D3: Bookings")]
        end
        
        subgraph PaymentFlow["Payment Layer"]
            P5["Process 5.0<br/>💰 ALGA PAY<br/>Process Payment"]
            DB4[("D4: Payments")]
        end
        
        subgraph CommissionFlow["Commission Layer"]
            P6["Process 6.0<br/>💵 COMMISSION<br/>Calculate 5%"]
            P7["Process 7.0<br/>💸 PAYOUT<br/>Pay Agent"]
            DB5[("D5: Agents")]
            DB6[("D6: Commissions")]
        end
    end
    
    %% RIGHT SIDE: External Services
    subgraph External["🌐 EXTERNAL SERVICES"]
        SMS["📞 SMS Service"]
        PaymentGW["💳 Payment<br/>Gateway"]
        TeleBirr["📱 TeleBirr"]
    end
    
    %% AUTHENTICATION FLOWS (Process 1)
    Guest -->|"1. Login Request"| P1
    Host -->|"1. Login Request"| P1
    Agent -->|"1. Login Request"| P1
    P1 -->|"2. Send OTP"| SMS
    SMS -.->|"3. OTP Code"| Users
    P1 <-->|"Store"| DB1
    P1 <-->|"Create"| DB7
    
    %% PROPERTY MANAGEMENT FLOWS (Process 2)
    Host -->|"4. List Property"| P2
    P2 -->|"Store"| DB2
    P2 -->|"Link"| DB1
    
    %% SEARCH FLOWS (Process 3)
    Guest -->|"5. Search Query"| P3
    P3 <-->|"Query"| DB2
    P3 -->|"6. Results"| Guest
    
    %% BOOKING FLOWS (Process 4)
    Guest -->|"7. Book Property"| P4
    P4 <-->|"Check"| DB2
    P4 <-->|"Reserve"| DB3
    P4 -->|"8. Access Code"| Guest
    P4 -->|"9. Notify"| Host
    
    %% PAYMENT FLOWS (Process 5)
    P4 -->|"10. Total Amount"| P5
    P5 -->|"11. Pay Request"| PaymentGW
    PaymentGW -->|"12. Confirm"| P5
    P5 -->|"Store"| DB4
    P5 -->|"Update"| DB3
    P5 -->|"13. Receipt"| Guest
    P5 -->|"14. 100% Payment"| Host
    
    %% COMMISSION FLOWS (Process 6 & 7)
    P5 -->|"15. Trigger"| P6
    P6 <-->|"Check Link"| DB5
    P6 -->|"Record"| DB6
    P6 -->|"16. Queue Payout"| P7
    P7 <-->|"Get Account"| DB5
    P7 -->|"17. Transfer 5%"| TeleBirr
    TeleBirr -->|"18. Confirm"| P7
    P7 -->|"Mark Paid"| DB6
    
    %% AGENT DASHBOARD
    Agent <-->|"View Earnings"| DB5
    Agent <-->|"Check History"| DB6
    
    %% STYLING
    classDef processClass fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    classDef datastoreClass fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef externalClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef userClass fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    class P1,P2,P3,P4,P5,P6,P7 processClass
    class DB1,DB2,DB3,DB4,DB5,DB6,DB7 datastoreClass
    class SMS,PaymentGW,TeleBirr externalClass
    class Guest,Host,Agent userClass
```

## Process Descriptions

### Process 1.0 - Authentication
**Function:** Passwordless OTP authentication
- **Input:** Phone/Email from user
- **Process:** 
  1. Generate 4-digit OTP
  2. Send via SMS (Ethiopian Telecom)
  3. Verify code within 10 minutes
  4. Create session in PostgreSQL
- **Output:** Session token (httpOnly cookie)
- **Security:** Bcrypt hashing, rate limiting (5 OTP/hour)

### Process 2.0 - Property Management
**Function:** Host creates and manages property listings
- **Input:** Property details, images (max 10), pricing
- **Process:**
  1. Validate input (Zod schema)
  2. Compress images (browser-image-compression)
  3. Upload to Cloud Object Storage (Google Cloud)
  4. Generate 6-digit access code
  5. Set status = 'pending' (admin approval)
- **Output:** Property ID, pending verification
- **Security:** File type validation, size limits (5MB)

### Process 3.0 - Search Engine
**Function:** Guest searches available properties
- **Input:** City, dates, price range, guests
- **Process:**
  1. Query properties by filters
  2. Check availability (no booking conflicts)
  3. Calculate distance (Google Maps API)
  4. Sort by relevance/price/rating
- **Output:** Filtered property list
- **Performance:** <500ms response time

### Process 4.0 - Booking System
**Function:** Create reservation with conflict prevention
- **Input:** Property ID, check-in, check-out, guests
- **Process:**
  1. Verify property active
  2. Check date availability (no overlaps)
  3. Validate guest capacity
  4. Generate unique 6-digit access code
  5. Reserve dates (status = 'pending')
- **Output:** Booking ID, access code
- **Security:** Date validation, SQL injection prevention (Drizzle ORM)

### Process 5.0 - Alga Pay (Payment Processing)
**Function:** White-labeled payment gateway with commission calculation
- **Input:** Booking ID, payment method selection
- **Process:**
  1. Calculate total: property price × nights
  2. Calculate Alga commission: 12% of total
  3. Calculate VAT: 15% of commission
  4. Calculate withholding tax: 2% of total
  5. Route to processor (Chapa/Stripe/PayPal)
  6. Wait for confirmation
  7. **Transfer 100% of booking amount to Host**
  8. **Platform retains 12% service fee**
  9. Update booking status = 'confirmed'
  10. Generate ERCA-compliant PDF invoice
- **Output:** Transaction ID, invoice, payment confirmation
- **Security:** PCI DSS compliance (processor-handled), encrypted storage

### Process 6.0 - Commission Engine
**Function:** Calculate and track Delala Agent commissions
- **Input:** Confirmed booking, booking amount
- **Process:**
  1. Check if property has agent link (DB5: agent_properties)
  2. Verify link not expired (< 36 months since link date)
  3. Calculate commission: 5% of booking total
  4. Create commission record (status = 'pending')
  5. Update agent total_earnings
  6. **Note:** Commission paid SEPARATELY from 12% service fee
- **Output:** Commission record
- **Business Rule:** Agent earns 5% for 36 months from property link

### Process 7.0 - Payout Processor
**Function:** Distribute agent commissions via TeleBirr
- **Input:** Pending commission records
- **Process:**
  1. Retrieve agent's TeleBirr account number
  2. Batch commissions (weekly/monthly)
  3. Initiate TeleBirr API transfer
  4. Validate transaction
  5. Mark commission as 'paid'
  6. Log payout timestamp
- **Output:** TeleBirr transaction ID, paid confirmation
- **Security:** TeleBirr account verification, transaction logging

## Data Store Details

| Store | Description | Sensitive Fields | Access Control |
|-------|-------------|------------------|----------------|
| D1: Users | User accounts, roles, OTP | Password hash, phone, OTP, Fayda ID | Role-based (Admin full access) |
| D2: Properties | Listings, images, pricing | Latitude, longitude, access codes | Host owns, Guest reads |
| D3: Bookings | Reservations, status | Access codes, guest info | Guest/Host only |
| D4: Payments | Transactions, invoices | All financial data | Encrypted, Admin/Host only |
| D5: Agents | Agent profiles, TeleBirr | TeleBirr account, earnings | Agent/Admin only |
| D6: Commissions | Commission records | Commission amounts | Agent/Admin only |
| D7: Sessions | Active sessions | Session data | System only |

## Critical Business Rules

1. **Payment Split:**
   - Guest pays 100% of booking amount
   - Host receives 100% of booking amount
   - Platform retains 12% service fee (from separate calculations)
   - Agent receives 5% commission (paid from platform's 12% fee via TeleBirr)

2. **Commission Duration:**
   - Agent earns 5% for 36 months from property link date
   - After 36 months, commission automatically expires
   - Agent can link unlimited properties

3. **Access Codes:**
   - Unique 6-digit code per booking
   - Shared with guest after payment confirmation
   - Valid only for booking dates

4. **Tax Compliance:**
   - 15% VAT on platform commission
   - 2% withholding tax on host earnings
   - ERCA-compliant invoices (jsPDF generation)

---

**Document:** DFD Detailed Level 1  
**Created:** November 6, 2025  
**Standard:** INSA OF/AEAD/001  
**Export:** Use mermaid.live, GitHub, or VS Code to export to PNG/SVG
