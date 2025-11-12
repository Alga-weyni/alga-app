# ✅ Ethiopian Electronic Signature Compliance System

## Overview
Alga App now has a **legally compliant, seamless click-to-sign system** across all modules (Host, Guest, Delala, Service Provider) in full alignment with:
- **Electronic Signature Proclamation No. 1072/2018**
- **Electronic Transactions Proclamation No. 1205/2020**

**Regulatory Authority**: INSA (Information Network Security Agency)

---

## 🎯 Core Features

### 1. **ElectronicSignatureConsent Component**

A single, reusable React component that displays the exact legal text:

> "By clicking 'I Agree,' you consent that this action constitutes your electronic signature under Ethiopian law (Proclamations No. 1072/2018 and No. 1205/2020)."

**Key Features:**
- ✅ Mandatory acceptance (button disabled until "I Agree" is clicked)
- ✅ Exact legal text (verbatim, cannot be bypassed)
- ✅ "View Terms" link to `/terms` page
- ✅ Styled with Alga's Tailwind palette
- ✅ Mobile, tablet, and desktop responsive
- ✅ Cannot be bypassed - mandatory for all critical actions

---

## 📦 Component Usage

### **Basic Usage**

```tsx
import { ElectronicSignatureConsent } from "@/components/ElectronicSignatureConsent";

<ElectronicSignatureConsent
  action="booking_confirmation"
  onConsented={handleBookingConfirmation}
>
  Confirm Booking
</ElectronicSignatureConsent>
```

### **Advanced Usage with Entity Linking**

```tsx
<ElectronicSignatureConsent
  action="guest_booking"
  relatedEntityType="booking"
  relatedEntityId={bookingId.toString()}
  metadata={{ propertyId: property.id, guestCount: 2 }}
  onConsented={async () => {
    await createBooking();
  }}
  variant="default"
  size="lg"
>
  Confirm & Pay
</ElectronicSignatureConsent>
```

### **Props**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | Action type (e.g., "booking", "payment", "contract") |
| `onConsented` | `() => void \| Promise<void>` | Yes | Callback executed after signature is recorded |
| `relatedEntityType` | string | No | Entity type (e.g., "booking", "property") |
| `relatedEntityId` | string | No | Entity ID to link signature to |
| `metadata` | object | No | Additional context |
| `showViewTerms` | boolean | No | Show "View Terms" link (default: true) |
| All Button props | - | No | Supports all Shadcn Button props |

---

## 🏛️ Legal Traceability

Every signature click captures and securely stores:

| Field | Description | Security |
|-------|-------------|----------|
| `user_id` | User's ID | Plain |
| `action` | Action type | Plain |
| `timestamp` | Exact date/time | Plain |
| `ip_address` | User's IP address | **Encrypted (AES-256)** |
| `device_info` | Browser/device info | **Encrypted (AES-256)** |
| `otp_id` | OTP verification ID | Plain (if available) |
| `fayda_id` | Fayda ID | Plain (if verified) |
| `signature_hash` | **SHA-256 hash** of `user_id + action + timestamp` | Immutable token |
| `signature_id` | UUID | Unique identifier returned to frontend |
| `verified` | Session verification status | Boolean |
| `related_entity_type` | Entity type | Plain |
| `related_entity_id` | Entity ID | Plain |
| `metadata` | Additional context | JSON |

---

## 🔐 Data Security

### **Encryption**
- IP addresses and device info are **encrypted using AES-256**
- Encryption key stored in environment variable `ENCRYPTION_KEY`
- Only decryptable for audit retrieval

### **Signature Hash**
- Generated using **SHA-256** of `user_id + action + timestamp`
- Provides immutable verification token
- Used for future signature verification

### **UUID Generation**
- Each signature gets a unique `signatureId` (UUID v4)
- Returned to frontend for user confirmation
- Stored for read-only audit retrieval

---

## 🗄️ Database Schema

### **Table: `consent_logs`**

```sql
CREATE TABLE consent_logs (
  id SERIAL PRIMARY KEY,
  signature_id VARCHAR NOT NULL UNIQUE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  action VARCHAR NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address_encrypted TEXT,
  device_info_encrypted TEXT,
  otp_id VARCHAR,
  fayda_id VARCHAR,
  signature_hash VARCHAR(64) NOT NULL,
  related_entity_type VARCHAR,
  related_entity_id VARCHAR,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🌐 API Endpoint

### **POST /api/electronic-signature**

**Authorization**: Required (authenticated session)

**Request Body:**
```json
{
  "action": "booking_confirmation",
  "relatedEntityType": "booking",
  "relatedEntityId": "123",
  "metadata": { "propertyId": 456, "guestCount": 2 }
}
```

**Response:**
```json
{
  "success": true,
  "signatureId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
}
```

**Features:**
- ✅ Automatic IP address and user agent capture
- ✅ AES-256 encryption of sensitive fields
- ✅ SHA-256 signature hash generation
- ✅ **Automatic retry** if database latency exceeds 2 seconds
- ✅ Returns `signatureId` UUID for user confirmation

---

## 🔍 Retrieve Signatures

### **GET /api/electronic-signature/user/:userId**

**Authorization**: Required (own records or admin)

**Response:**
```json
[
  {
    "id": 1,
    "signatureId": "a1b2c3d4-...",
    "userId": "user123",
    "action": "booking_confirmation",
    "timestamp": "2025-01-12T10:30:00Z",
    "signatureHash": "abc123...",
    "verified": true,
    "relatedEntityType": "booking",
    "relatedEntityId": "123",
    "metadata": {}
  }
]
```

---

## 🚀 Integration Examples

### **1. Host Registration**

```tsx
<ElectronicSignatureConsent
  action="host_registration"
  onConsented={handleHostRegistration}
>
  Complete Host Registration
</ElectronicSignatureConsent>
```

### **2. Guest Booking Confirmation**

```tsx
<ElectronicSignatureConsent
  action="guest_booking"
  relatedEntityType="booking"
  relatedEntityId={booking.id}
  metadata={{ propertyId: property.id }}
  onConsented={async () => {
    await confirmBooking(booking.id);
  }}
>
  Confirm Booking
</ElectronicSignatureConsent>
```

### **3. Delala (Agent) Commission Agreement**

```tsx
<ElectronicSignatureConsent
  action="agent_commission_agreement"
  relatedEntityType="agent"
  relatedEntityId={agent.id}
  onConsented={handleCommissionAgreement}
>
  Accept Commission Terms
</ElectronicSignatureConsent>
```

### **4. Service Provider Contract Acceptance**

```tsx
<ElectronicSignatureConsent
  action="service_provider_contract"
  relatedEntityType="service_provider"
  relatedEntityId={provider.id}
  onConsented={handleContractAcceptance}
>
  Accept Service Provider Contract
</ElectronicSignatureConsent>
```

---

## ✅ Compliance Checklist

- [x] **Legal Text**: Exact text from requirements (verbatim)
- [x] **Mandatory Consent**: Button disabled until "I Agree" clicked
- [x] **Component Name**: `ElectronicSignatureConsent.tsx`
- [x] **API Endpoint**: `/api/electronic-signature`
- [x] **Database Table**: `consent_logs`
- [x] **Signature ID**: UUID returned to frontend
- [x] **Encryption**: AES-256 for IP addresses and device info
- [x] **Signature Hash**: SHA-256 of `user_id + action + timestamp`
- [x] **Verification**: Fayda ID and OTP hooks integrated
- [x] **Retry Logic**: Auto-retry on database latency > 2s
- [x] **INSA Reference**: Displayed in component footer
- [x] **Offline Support**: Component caches consent state
- [x] **Data Retention**: 5-year default (GDPR-style)

---

## 🚫 What's NOT Included

- ❌ No visible signature pads or handwritten drawing fields
- ❌ No third-party paid APIs (DocuSign, HelloSign, etc.)
- ❌ No raw IP addresses or Fayda IDs in console logs
- ❌ No paraphrased legal text (verbatim only)
- ❌ No raw IP storage (encrypted only)

---

## 📄 PDF Receipt (Optional Feature)

**Status**: Not yet implemented (optional)

To add PDF receipt generation:
1. Use `jspdf` library (already installed)
2. Create `/api/electronic-signature/:signatureId/pdf` endpoint
3. Generate PDF with:
   - User name
   - Action signed
   - Date and time
   - Signature token (hash)
   - Legal statement reference

---

## 🔧 Database Migration

**To create the `consent_logs` table:**

```bash
npm run db:push --force
```

This will:
1. Create the `consent_logs` table with all required columns
2. Add indexes for fast querying
3. Set up foreign key constraints

---

## 🎨 Visual Design

The component follows Alga's design system:
- **Colors**: Blue-50/Blue-950 backgrounds (light/dark mode)
- **Icons**: Lucide React (Info, FileText)
- **Spacing**: Consistent padding and margins
- **Typography**: Tailwind CSS utility classes
- **Accessibility**: Full ARIA support, keyboard navigation

---

## 📊 Usage Analytics

Track signature completion rates:
```sql
SELECT 
  action,
  COUNT(*) as total_signatures,
  COUNT(CASE WHEN verified THEN 1 END) as verified_signatures
FROM consent_logs
GROUP BY action
ORDER BY total_signatures DESC;
```

---

## 🛡️ Security Best Practices

1. **Never log raw IPs** - Always use encrypted version
2. **Verify sessions** - Check Fayda ID or OTP before recording
3. **Immutable logs** - Read-only access for audit retrieval
4. **Encrypted backups** - Automated backup to ensure logs are immutable
5. **Data retention** - 5-year default, configurable

---

## 👤 Company Context

**Alga One Member PLC** (TIN: 0101809194)  
A women-run, women-owned, and women-operated company committed to legal compliance and protecting both guests and hosts in the Ethiopian market.

---

**Questions?** Contact the development team or refer to the Ethiopian Electronic Signature Proclamation No. 1072/2018 for legal guidance.
