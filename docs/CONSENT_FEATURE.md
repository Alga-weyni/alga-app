# Ethiopian E-Signature Consent Feature

## Overview
Alga now includes a comprehensive e-signature consent system that complies with **Ethiopian Electronic Signature Proclamation No. 1072/2018** and **Electronic Transactions Proclamation No. 1205/2020**.

## Legal Framework

### What Laws Apply?
- **Electronic Signature Proclamation No. 1072/2018**: Grants e-signatures the same legal validity as handwritten signatures
- **Electronic Transactions Proclamation No. 1205/2020**: Expands framework for electronic transactions
- **Regulatory Authority**: INSA (Information Network Security Agency)

### When E-Signatures CANNOT Be Used
❌ Wills and testamentary instruments  
❌ Real estate transfers  
❌ Powers of attorney  
❌ Court procedures (summons, warrants, decrees)

✅ **Valid for**: Bookings, payments, service agreements, confirmations

---

## Features

### 1. **ConsentNotice Component**
A reusable alert component that displays legally compliant consent text.

**Usage:**
```tsx
import { ConsentNotice } from "@/components/consent-notice";

<ConsentNotice actionType="booking" />
<ConsentNotice actionType="payment" />
<ConsentNotice actionType="confirm" />
<ConsentNotice actionType="submit" />
```

### 2. **ConsentButton Component**
A smart wrapper that automatically:
- Shows consent notice below the button
- Records consent to the database with full audit trail
- Captures IP address, user agent, identification method
- Links consent to user and related entities (bookings, properties, etc.)

**Basic Usage:**
```tsx
import { ConsentButton } from "@/components/consent-button";

<ConsentButton onConsentedClick={handleSubmit}>
  Confirm Booking
</ConsentButton>
```

**Advanced Usage:**
```tsx
<ConsentButton
  actionType="booking"
  relatedEntityType="booking"
  relatedEntityId={bookingId.toString()}
  onConsentedClick={async () => {
    await createBooking();
  }}
  variant="default"
  size="lg"
>
  Confirm & Pay
</ConsentButton>
```

**Props:**
- `onConsentedClick?: () => void | Promise<void>` - Called after consent is recorded
- `actionType?: "booking" | "submit" | "confirm" | "payment"` - Type of action (auto-inferred from button text if not provided)
- `relatedEntityType?: string` - Entity type (e.g., "booking", "property")
- `relatedEntityId?: string` - Entity ID to link consent to
- `requiresConsent?: boolean` - Set to false to disable consent (default: true)
- All standard Button props are supported

---

## Database Schema

### Consent Records Table
```typescript
consentRecords {
  id: serial
  userId: varchar (FK to users)
  actionType: varchar (booking, payment, confirm, submit)
  consentText: text (full consent text shown)
  legalReference: varchar (default: "Proclamation No. 1072/2018")
  identificationMethod: varchar (fayda_id, otp_phone, otp_email)
  identificationValue: varchar (Fayda ID, phone, or email)
  ipAddress: varchar (audit trail)
  userAgent: text (audit trail)
  relatedEntityType: varchar (booking, property, etc.)
  relatedEntityId: varchar (ID of related entity)
  consentGiven: boolean (default: true)
  metadata: jsonb (additional context)
  createdAt: timestamp
}
```

---

## API Endpoints

### Create Consent Record
```
POST /api/consent
Authorization: Required

Body:
{
  userId: string,
  actionType: "booking" | "payment" | "confirm" | "submit",
  consentText: string,
  legalReference: string,
  identificationMethod: "fayda_id" | "otp_phone" | "otp_email",
  identificationValue: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  consentGiven: boolean
}

Note: ipAddress and userAgent are automatically captured by the server
```

### Get User Consent Records
```
GET /api/consent/user/:userId
Authorization: Required (own records or admin)

Returns: Array of consent records for the user
```

### Get Consent by Entity
```
GET /api/consent/entity/:type/:id
Authorization: Required

Example: GET /api/consent/entity/booking/123

Returns: All consent records for that entity
```

---

## Legal Traceability

Each consent record captures:
1. **User Identity**: User ID
2. **Verification Method**: Fayda ID, OTP phone, or OTP email
3. **Verification Value**: The actual Fayda ID number, phone number, or email used
4. **Action Details**: Type of action and full consent text
5. **Technical Audit**: IP address, user agent, timestamp
6. **Entity Linking**: What booking/property/service the consent relates to
7. **Legal Reference**: Ethiopian law citation

This provides **complete legal traceability** for e-signature disputes.

---

## How to Use in Your App

### Example: Booking Confirmation
```tsx
import { ConsentButton } from "@/components/consent-button";

function BookingConfirmation({ booking }) {
  const handleConfirmBooking = async () => {
    await apiRequest("POST", "/api/bookings", bookingData);
  };

  return (
    <div>
      <h2>Review Your Booking</h2>
      {/* ... booking details ... */}
      
      <ConsentButton
        actionType="booking"
        relatedEntityType="booking"
        relatedEntityId={booking.id}
        onConsentedClick={handleConfirmBooking}
        size="lg"
        className="w-full"
      >
        Confirm Booking
      </ConsentButton>
    </div>
  );
}
```

### Example: Payment Authorization
```tsx
<ConsentButton
  actionType="payment"
  relatedEntityType="payment_transaction"
  relatedEntityId={transactionId}
  onConsentedClick={processPayment}
>
  Authorize Payment
</ConsentButton>
```

---

## Migration Guide

### Before (Old Code):
```tsx
<Button onClick={handleSubmit}>Confirm Booking</Button>
```

### After (With Consent):
```tsx
<ConsentButton 
  onConsentedClick={handleSubmit}
  relatedEntityType="booking"
  relatedEntityId={bookingId}
>
  Confirm Booking
</ConsentButton>
```

---

## Compliance Notes

✅ **E-signatures are legally binding** for bookings, payments, and service agreements  
✅ **Full audit trail** with IP, user agent, timestamp  
✅ **Identity verification** via Fayda ID, OTP phone, or OTP email  
✅ **INSA-compliant** design following Ethiopian legal framework  

⚠️ **Important**: This feature records consent in the database. Ensure you've run database migrations before using.

---

## Company Context
**Alga One Member PLC** (TIN: 0101809194) is a women-run, women-owned, and women-operated company. This e-signature system reflects our commitment to legal compliance and protecting both guests and hosts in the Ethiopian market.
