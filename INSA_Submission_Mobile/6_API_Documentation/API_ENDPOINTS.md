# API Endpoints Documentation
## Alga Property Rental Platform - Backend API

**Base URL:** https://staging.alga.et/api  
**Authentication:** Session-based (Cookies)  
**Rate Limiting:** 100 requests per 15 minutes per IP

---

## Authentication Endpoints

### POST /api/auth/register
**Description:** Register new user account  
**Authentication:** None required  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+251911234567",
  "role": "guest"
}
```
**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "guest"
  }
}
```

### POST /api/auth/login
**Description:** Authenticate user  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "guest"
  }
}
```

### POST /api/auth/logout
**Description:** End user session  
**Authentication:** Required  
**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Property Endpoints

### GET /api/properties
**Description:** Search and list properties  
**Authentication:** None required  
**Query Parameters:**
```
?city=Addis Ababa
&checkIn=2025-11-15
&checkOut=2025-11-18
&guests=2
&minPrice=1000
&maxPrice=5000
&sortBy=price_asc
```
**Response (200):**
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Modern Studio in Bole",
      "city": "Addis Ababa",
      "pricePerNight": 2500,
      "maxGuests": 2,
      "images": ["url1.jpg", "url2.jpg"],
      "rating": 4.8,
      "reviewCount": 24
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### GET /api/properties/:id
**Description:** Get single property details  
**Authentication:** None required  
**Response (200):**
```json
{
  "id": 1,
  "title": "Modern Studio in Bole",
  "description": "Beautiful studio...",
  "city": "Addis Ababa",
  "address": "Bole Subcity",
  "pricePerNight": 2500,
  "maxGuests": 2,
  "bedrooms": 1,
  "bathrooms": 1,
  "amenities": ["WiFi", "AC", "Kitchen"],
  "images": ["url1.jpg", "url2.jpg"],
  "host": {
    "id": 5,
    "firstName": "Sarah",
    "rating": 4.9
  }
}
```

### POST /api/properties
**Description:** Create new property listing  
**Authentication:** Required (Host role)  
**Request Body:**
```json
{
  "title": "Cozy Apartment",
  "description": "Beautiful apartment...",
  "city": "Addis Ababa",
  "pricePerNight": 3000,
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": ["WiFi", "Kitchen"]
}
```
**Response (201):**
```json
{
  "message": "Property created successfully",
  "property": {
    "id": 42,
    "title": "Cozy Apartment"
  }
}
```

---

## Booking Endpoints

### POST /api/bookings
**Description:** Create new booking  
**Authentication:** Required (Guest role)  
**Request Body:**
```json
{
  "propertyId": 1,
  "checkIn": "2025-11-15",
  "checkOut": "2025-11-18",
  "guests": 2,
  "paymentMethod": "chapa"
}
```
**Response (201):**
```json
{
  "message": "Booking created",
  "booking": {
    "id": 123,
    "propertyId": 1,
    "totalPrice": 7500,
    "platformFee": 900,
    "accessCode": "A12345",
    "status": "confirmed"
  }
}
```

### GET /api/bookings
**Description:** Get user's bookings  
**Authentication:** Required  
**Response (200):**
```json
{
  "bookings": [
    {
      "id": 123,
      "property": {
        "title": "Modern Studio in Bole",
        "city": "Addis Ababa"
      },
      "checkIn": "2025-11-15",
      "checkOut": "2025-11-18",
      "totalPrice": 7500,
      "status": "confirmed"
    }
  ]
}
```

---

## Payment Endpoints

### POST /api/payments/create
**Description:** Initialize payment  
**Authentication:** Required  
**Request Body:**
```json
{
  "bookingId": 123,
  "amount": 7500,
  "currency": "ETB",
  "method": "chapa"
}
```
**Response (200):**
```json
{
  "paymentUrl": "https://checkout.chapa.co/...",
  "transactionId": "TX-123456"
}
```

---

## Agent (Delala) Endpoints

### POST /api/agents/register
**Description:** Register as agent  
**Authentication:** Required (any user)  
**Request Body:**
```json
{
  "telebirrAccount": "+251911234567",
  "idDocument": "base64_image_string"
}
```
**Response (201):**
```json
{
  "message": "Agent application submitted",
  "status": "pending"
}
```

### GET /api/agents/dashboard
**Description:** Get agent earnings dashboard  
**Authentication:** Required (Agent role)  
**Response (200):**
```json
{
  "totalEarnings": 125000,
  "pendingCommissions": 15000,
  "linkedProperties": 12,
  "thisMonthEarnings": 25000
}
```

---

## Review Endpoints

### POST /api/reviews
**Description:** Submit property review  
**Authentication:** Required (verified booking)  
**Request Body:**
```json
{
  "bookingId": 123,
  "rating": 5,
  "comment": "Amazing place!",
  "cleanliness": 5,
  "communication": 5,
  "location": 5
}
```
**Response (201):**
```json
{
  "message": "Review submitted successfully",
  "review": {
    "id": 456,
    "rating": 5
  }
}
```

---

## Admin Endpoints

### GET /api/admin/users
**Description:** List all users  
**Authentication:** Required (Admin role)  
**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "guest",
      "status": "active",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### PATCH /api/admin/users/:id/role
**Description:** Change user role  
**Authentication:** Required (Admin role)  
**Request Body:**
```json
{
  "role": "host"
}
```
**Response (200):**
```json
{
  "message": "User role updated",
  "user": {
    "id": 1,
    "role": "host"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., booking conflict) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

**Total Endpoints:** 40+  
**Documentation Version:** 1.0  
**Last Updated:** November 6, 2025
