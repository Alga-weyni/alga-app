# API Documentation
**Application:** Alga Property Rental Platform  
**Prepared for:** INSA Security Audit  
**Base URL:** `https://alga-staging.onrender.com/api`  
**Date:** November 7, 2025

---

## API Overview

The Alga platform exposes a RESTful API with 50+ endpoints covering authentication, property management, bookings, payments, admin functions, and more.

**Authentication:** Session-based (cookies)  
**Rate Limiting:** 100 requests per 15 minutes (IP-based)  
**Response Format:** JSON  
**Error Format:**
```json
{
  "error": "Error message description",
  "details": "Optional additional context"
}
```

---

## 1. Authentication Endpoints

### 1.1 Request OTP - Phone Registration
**Endpoint:** `POST /api/auth/request-otp/phone/register`  
**Auth Required:** No  
**Rate Limit:** 10 requests / 15 minutes

**Request Body:**
```json
{
  "phoneNumber": "+251911123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent successfully",
  "userId": "user_123abc",
  "phoneNumber": "+251911123456"
}
```

**Errors:**
- `400` - Invalid phone number format
- `409` - Phone number already registered
- `429` - Too many requests

---

### 1.2 Request OTP - Phone Login
**Endpoint:** `POST /api/auth/request-otp/phone/login`  
**Auth Required:** No  
**Rate Limit:** 10 requests / 15 minutes

**Request Body:**
```json
{
  "phoneNumber": "+251911123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent successfully",
  "userId": "user_123abc"
}
```

---

### 1.3 Request OTP - Email Registration
**Endpoint:** `POST /api/auth/request-otp/email/register`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

### 1.4 Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**Auth Required:** No  
**Rate Limit:** 5 requests / 15 minutes

**Request Body:**
```json
{
  "phoneNumber": "+251911123456",
  "otp": "1234"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP verified successfully",
  "user": {
    "id": "user_123abc",
    "phoneNumber": "+251911123456",
    "firstName": "John",
    "role": "guest"
  }
}
```

**Session Cookie Set:** `connect.sid`

---

### 1.5 Login with Email
**Endpoint:** `POST /api/auth/login/email`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK` + Session cookie

---

### 1.6 Get Current User
**Endpoint:** `GET /api/auth/user`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "id": "user_123abc",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "guest",
  "phoneVerified": true,
  "idVerified": false
}
```

---

### 1.7 Update Profile
**Endpoint:** `PATCH /api/profile`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Passionate traveler"
}
```

---

## 2. Property Endpoints

### 2.1 Get All Properties
**Endpoint:** `GET /api/properties`  
**Auth Required:** No  
**Pagination:** Yes

**Query Parameters:**
- `city` - Filter by city
- `type` - Filter by property type
- `maxPrice` - Maximum price per night
- `guests` - Number of guests
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Luxury Villa in Bahir Dar",
      "description": "Beautiful lakeside property...",
      "pricePerNight": "3500.00",
      "city": "Bahir Dar",
      "maxGuests": 6,
      "rating": "4.9",
      "images": ["/path/to/image1.jpg"],
      "host": {
        "firstName": "Ahmed",
        "profileImageUrl": "/path/to/profile.jpg"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

---

### 2.2 Search Properties
**Endpoint:** `GET /api/properties/search`  
**Auth Required:** No

**Query Parameters:**
- `q` - Search query (title, description, location)
- `city` - Filter by city
- All parameters from 2.1

**Response:** Same as 2.1

---

### 2.3 Get Property by ID
**Endpoint:** `GET /api/properties/:id`  
**Auth Required:** No

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Luxury Villa in Bahir Dar",
  "description": "Full description...",
  "pricePerNight": "3500.00",
  "maxGuests": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["wifi", "pool", "lake_view"],
  "latitude": "11.5935",
  "longitude": "37.3886",
  "address": "Lake Tana Shore",
  "city": "Bahir Dar",
  "region": "Amhara",
  "host": {
    "id": "host_123",
    "firstName": "Ahmed",
    "phoneVerified": true,
    "idVerified": true
  },
  "reviews": [],
  "reviewCount": 25,
  "rating": "4.9"
}
```

---

### 2.4 Create Property
**Endpoint:** `POST /api/properties`  
**Auth Required:** Yes (Host or Admin)

**Request Body:**
```json
{
  "title": "Cozy Apartment in Addis",
  "description": "Modern apartment...",
  "type": "hotel",
  "location": "Bole",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "pricePerNight": "1500.00",
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": ["wifi", "kitchen"],
  "images": ["/path/to/image.jpg"]
}
```

**Response:** `201 Created`
```json
{
  "id": 42,
  "title": "Cozy Apartment in Addis",
  "status": "pending"
}
```

---

### 2.5 Update Property
**Endpoint:** `PUT /api/properties/:id`  
**Auth Required:** Yes (Owner or Admin)

**Authorization:** User must be property host or admin

---

### 2.6 Delete Property
**Endpoint:** `DELETE /api/properties/:id`  
**Auth Required:** Yes (Owner or Admin)

**Response:** `200 OK`
```json
{
  "message": "Property deleted successfully"
}
```

---

## 3. Booking Endpoints

### 3.1 Create Booking
**Endpoint:** `POST /api/bookings`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "propertyId": 1,
  "checkIn": "2025-12-01T14:00:00Z",
  "checkOut": "2025-12-05T11:00:00Z",
  "guests": 2,
  "specialRequests": "Early check-in if possible"
}
```

**Server Calculates:**
- Total price (property price × nights)
- Commission (12%)
- VAT (15%)
- Withholding tax (2%)
- Host payout

**Response:** `201 Created`
```json
{
  "id": 101,
  "propertyId": 1,
  "checkIn": "2025-12-01T14:00:00Z",
  "checkOut": "2025-12-05T11:00:00Z",
  "guests": 2,
  "totalPrice": "14000.00",
  "algaCommission": "1680.00",
  "vat": "2100.00",
  "withholding": "280.00",
  "hostPayout": "9940.00",
  "status": "pending",
  "paymentStatus": "pending"
}
```

---

### 3.2 Get User Bookings
**Endpoint:** `GET /api/bookings`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "bookings": [
    {
      "id": 101,
      "property": {
        "id": 1,
        "title": "Luxury Villa",
        "city": "Bahir Dar"
      },
      "checkIn": "2025-12-01",
      "checkOut": "2025-12-05",
      "totalPrice": "14000.00",
      "status": "confirmed"
    }
  ]
}
```

---

### 3.3 Get Booking by ID
**Endpoint:** `GET /api/bookings/:id`  
**Auth Required:** Yes (Guest, Host, or Admin)

**Authorization:** Only booking guest, property host, or admin can access

---

## 4. Payment Endpoints

### 4.1 Initialize Payment
**Endpoint:** `POST /api/payment/initialize`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "bookingId": 101,
  "provider": "chapa"
}
```

**Response:** `200 OK`
```json
{
  "checkoutUrl": "https://checkout.chapa.co/pay/...",
  "transactionId": "tx_123abc"
}
```

---

### 4.2 Payment Callback
**Endpoint:** `POST /api/payment/callback/:provider`  
**Auth Required:** No (Webhook)

**Request Body:** Payment provider-specific

**Security:** Signature verification per provider

---

### 4.3 Alga Pay Handler
**Endpoint:** `POST /api/algapay`  
**Auth Required:** Yes

**Description:** White-labeled payment gateway that routes to Chapa/Stripe/PayPal based on user preference

---

## 5. Review Endpoints

### 5.1 Create Review
**Endpoint:** `POST /api/reviews`  
**Auth Required:** Yes (Must have completed booking)

**Request Body:**
```json
{
  "propertyId": 1,
  "bookingId": 101,
  "rating": 5,
  "comment": "Amazing stay!",
  "cleanliness": 5,
  "communication": 5,
  "accuracy": 5,
  "location": 5,
  "value": 5
}
```

---

### 5.2 Get Property Reviews
**Endpoint:** `GET /api/properties/:id/reviews`  
**Auth Required:** No

---

## 6. Admin Endpoints

### 6.1 Get All Users
**Endpoint:** `GET /api/admin/users`  
**Auth Required:** Yes (Admin only)

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status
- `search` - Search by name/email

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "role": "guest",
      "status": "active",
      "phoneVerified": true,
      "idVerified": false
    }
  ],
  "total": 1250
}
```

---

### 6.2 Change User Role
**Endpoint:** `PATCH /api/admin/users/:userId/role`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "role": "host"
}
```

**Allowed Roles:** guest, host, operator, admin

---

### 6.3 Change User Status
**Endpoint:** `PATCH /api/admin/users/:userId/status`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Allowed Statuses:** active, suspended, pending

---

### 6.4 Get All Properties (Admin)
**Endpoint:** `GET /api/admin/properties`  
**Auth Required:** Yes (Admin/Operator)

**Query Parameters:**
- `status` - Filter by verification status

---

### 6.5 Verify Property
**Endpoint:** `PATCH /api/admin/properties/:propertyId/verify`  
**Auth Required:** Yes (Admin/Operator)

**Request Body:**
```json
{
  "status": "approved",
  "rejectionReason": "Optional if rejected"
}
```

---

### 6.6 Financial Reports
**Endpoint:** `GET /api/admin/financial-reports`  
**Auth Required:** Yes (Admin only)

**Response:** `200 OK`
```json
{
  "totalRevenue": "125000.00",
  "totalCommission": "15000.00",
  "totalVAT": "18750.00",
  "totalWithholding": "2500.00",
  "bookingsCount": 450,
  "period": "2025-11"
}
```

---

### 6.7 Platform Stats
**Endpoint:** `GET /api/admin/stats`  
**Auth Required:** Yes (Admin only)

**Response:** `200 OK`
```json
{
  "totalUsers": 1250,
  "totalProperties": 380,
  "totalBookings": 890,
  "activeBookings": 45,
  "pendingVerifications": 12,
  "revenue": "125000.00"
}
```

---

## 7. Operator Endpoints

### 7.1 Get Pending Documents
**Endpoint:** `GET /api/operator/pending-documents`  
**Auth Required:** Yes (Operator/Admin)

**Response:** List of ID documents pending verification

---

### 7.2 Approve Document
**Endpoint:** `POST /api/operator/documents/:documentId/approve`  
**Auth Required:** Yes (Operator/Admin)

---

### 7.3 Reject Document
**Endpoint:** `POST /api/operator/documents/:documentId/reject`  
**Auth Required:** Yes (Operator/Admin)

**Request Body:**
```json
{
  "rejectionReason": "Blurry image, please re-upload"
}
```

---

## 8. Host Endpoints

### 8.1 Get Host Properties
**Endpoint:** `GET /api/host/properties`  
**Auth Required:** Yes (Host)

**Response:** List of user's properties

---

### 8.2 Get Property Stats
**Endpoint:** `GET /api/host/properties/:id/stats`  
**Auth Required:** Yes (Host/Owner)

**Response:** `200 OK`
```json
{
  "totalBookings": 45,
  "totalRevenue": "67500.00",
  "averageRating": "4.8",
  "occupancyRate": "75%",
  "upcomingBookings": 5
}
```

---

### 8.3 Get Host Stats
**Endpoint:** `GET /api/host/stats`  
**Auth Required:** Yes (Host)

**Response:** Aggregate stats across all host properties

---

### 8.4 Get Host Earnings
**Endpoint:** `GET /api/host/earnings`  
**Auth Required:** Yes (Host)

**Response:** `200 OK`
```json
{
  "totalEarnings": "67500.00",
  "pendingPayouts": "15000.00",
  "paidOut": "52500.00",
  "earnings": [
    {
      "bookingId": 101,
      "amount": "9940.00",
      "date": "2025-11-20",
      "status": "paid"
    }
  ]
}
```

---

## 9. Delala Agent Endpoints

### 9.1 Register as Agent
**Endpoint:** `POST /api/agents/register`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "fullName": "Ahmed Ali",
  "phoneNumber": "+251911123456",
  "telebirrAccount": "+251911123456",
  "city": "Addis Ababa",
  "idNumber": "ABC123456"
}
```

---

### 9.2 Get Agent Dashboard
**Endpoint:** `GET /api/agents/dashboard`  
**Auth Required:** Yes (Agent)

**Response:** `200 OK`
```json
{
  "totalEarnings": "15000.00",
  "pendingCommissions": "3000.00",
  "paidCommissions": "12000.00",
  "totalProperties": 8,
  "activeProperties": 6,
  "commissions": [
    {
      "bookingId": 101,
      "propertyTitle": "Luxury Villa",
      "bookingTotal": "14000.00",
      "commissionAmount": "700.00",
      "status": "paid",
      "paidAt": "2025-11-25"
    }
  ]
}
```

---

### 9.3 Link Property to Agent
**Endpoint:** `POST /api/agents/link-property`  
**Auth Required:** Yes (Agent)

**Request Body:**
```json
{
  "propertyId": 1
}
```

**Note:** Commission valid for 36 months from first booking

---

### 9.4 Get Agent Commissions
**Endpoint:** `GET /api/agents/commissions`  
**Auth Required:** Yes (Agent)

**Response:** List of all commissions earned

---

## 10. Service Provider Endpoints

### 10.1 Apply as Service Provider
**Endpoint:** `POST /api/services/apply`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "businessName": "Clean & Shine Services",
  "serviceType": "cleaning",
  "description": "Professional cleaning...",
  "pricingModel": "flat_rate",
  "basePrice": "800.00",
  "city": "Addis Ababa"
}
```

---

### 10.2 Get Service Providers
**Endpoint:** `GET /api/services`  
**Auth Required:** No

**Query Parameters:**
- `serviceType` - Filter by service type
- `city` - Filter by city

---

### 10.3 Book Service
**Endpoint:** `POST /api/services/book`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "serviceProviderId": 1,
  "scheduledDate": "2025-12-06",
  "scheduledTime": "10:00 AM",
  "propertyLocation": "Addis Ababa"
}
```

---

## 11. Lemlem AI Assistant Endpoints

### 11.1 Send Chat Message
**Endpoint:** `POST /api/lemlem/chat`  
**Auth Required:** Yes (optional for basic queries)

**Request Body:**
```json
{
  "message": "What is the WiFi password?",
  "propertyId": 1,
  "bookingId": 101,
  "language": "en"
}
```

**Response:** `200 OK`
```json
{
  "message": "እንኳን ደስ አለዎት! The WiFi password is: TestWifi1!",
  "usedTemplate": true,
  "aiCost": 0.0
}
```

---

### 11.2 Get Chat History
**Endpoint:** `GET /api/lemlem/history`  
**Auth Required:** Yes

**Query Parameters:**
- `bookingId` - Filter by booking
- `propertyId` - Filter by property

---

## 12. File Upload Endpoints

### 12.1 Upload Property Images
**Endpoint:** `POST /api/upload/property-images`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `images` - Array of image files (max 20, 10MB each)

**Response:** `200 OK`
```json
{
  "urls": [
    "/uploads/properties/1234567890-abc123.jpg",
    "/uploads/properties/1234567891-def456.jpg"
  ]
}
```

---

### 12.2 Upload ID Document
**Endpoint:** `POST /api/upload/id-document`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` - Single image file (max 10MB)

**Response:** `200 OK`
```json
{
  "url": "/uploads/id-documents/id-1234567890-xyz789.jpg"
}
```

---

## 13. Health & Monitoring

### 13.1 Health Check
**Endpoint:** `GET /api/health`  
**Auth Required:** No

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-11-07T12:34:56Z",
  "uptime": 86400
}
```

---

## Security Features

### Authentication
- Session-based with HttpOnly cookies
- OTP verification for phone/email
- Bcrypt password hashing

### Authorization
- Role-Based Access Control (RBAC)
- Resource-level ownership checks
- Admin/Operator permissions enforced

### Rate Limiting
- Global: 100 requests / 15 minutes
- Auth endpoints: 10 requests / 15 minutes
- IP-based tracking

### Input Validation
- Zod schema validation on all inputs
- express-validator middleware
- Type-safe with TypeScript

### Data Protection
- XSS sanitization (xss-clean)
- SQL injection prevention (Drizzle ORM)
- NoSQL injection prevention (mongo-sanitize)
- HPP protection (hpp middleware)

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

---

## Testing with cURL

### Example: Login
```bash
curl -X POST https://alga-staging.onrender.com/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "insa-guest@test.alga.et",
    "password": "INSA_Test_2025!"
  }' \
  -c cookies.txt
```

### Example: Get Properties (Authenticated)
```bash
curl https://alga-staging.onrender.com/api/properties \
  -b cookies.txt
```

---

**Document Version:** 1.0  
**Total Endpoints:** 50+  
**API Version:** v1  
**Last Updated:** November 7, 2025
