# 🕵🏾‍♀️ Alga Pay - White-Labeled Payment System

## Overview
Alga Pay is a white-labeled payment intermediary that abstracts underlying payment processors (Chapa, Stripe, Telebirr) from users and service providers. Users only see **"Alga Pay"** branding throughout the platform, giving Alga full control over the payment experience.

## Why Alga Pay?

### Benefits
1. **Brand Control**: Users interact only with "Alga Pay" - never see Chapa/Stripe
2. **Flexibility**: Switch payment processors without changing user-facing code
3. **Trust**: Builds trust in Alga's own payment brand
4. **Simplicity**: Unified API for all payment methods
5. **Future-Proof**: Easy to add new payment processors

### User Experience
- **Before**: "Pay with Chapa" / "Pay with Stripe"
- **After**: "Pay with Alga Pay" (always)

## Architecture

### Backend Components

#### 1. `server/algaPay.ts` - Unified Payment Handler
- Single endpoint: `/api/alga-pay`
- Routes to appropriate processor (Chapa/Stripe) based on method
- Never exposes processor names in responses
- Returns generic "algaPay" provider identifier

#### 2. `server/algaCallback.ts` - Payment Confirmation
- Endpoint: `/api/payment-callback`
- Receives webhooks from processors
- Updates booking status in database
- Processor-agnostic callback handling

### Frontend Components

#### 1. `client/src/components/alga-pay-checkout.tsx`
- Unified checkout component
- White-labeled UI with Alga branding
- Supports both Ethiopian and international payments
- Seamless iframe integration

#### 2. Updated Constants (`lib/constants.ts`)
- Payment methods now show "Alga Pay" and "Alga Pay (International)"
- Removed direct references to Chapa/Stripe
- Maintained Telebirr as standalone option

## Environment Variables

### Required Secrets (Backend Only)

```bash
# Chapa (for Ethiopian payments)
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxx

# Stripe (for international payments)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Optional: Base URL for callbacks
BASE_URL=https://yourdomain.repl.co
```

### How to Set
1. Click **Secrets** (🔐) in Replit sidebar
2. Add each variable with its value
3. Restart the application

## API Usage

### Initiate Payment

**Endpoint**: `POST /api/alga-pay`

**Request Body**:
```json
{
  "orderId": 123,
  "amount": 1500,
  "email": "user@example.com",
  "method": "chapa"  // or "stripe"
}
```

**Response**:
```json
{
  "success": true,
  "provider": "algaPay",  // NEVER exposes "chapa" or "stripe"
  "txRef": "ALGA-1234567890-123",
  "checkoutUrl": "https://checkout.processor.com/..."
}
```

### Payment Callback

**Endpoint**: `POST /api/payment-callback`

**Webhook Body** (from processor):
```json
{
  "tx_ref": "ALGA-1234567890-123",
  "status": "success"
}
```

**Actions**:
- Extracts order ID from tx_ref
- Updates booking status to "confirmed"
- Returns 200 OK

## Frontend Integration

### Using Alga Pay Component

```tsx
import AlgaPayCheckout from "@/components/alga-pay-checkout";

<AlgaPayCheckout
  amount={totalAmount}
  currency="ETB"
  bookingId={bookingId}
  method="chapa"  // or "stripe" for international
  onSuccess={() => navigate("/booking/success")}
  onError={(msg) => toast({ title: "Payment Failed", description: msg })}
  onCancel={() => setShowPayment(false)}
/>
```

### Payment Method Selection

```tsx
import { PAYMENT_METHODS } from "@/lib/constants";

// User sees:
// - Alga Pay (recommended, Ethiopian)
// - Alga Pay (International)
// - Telebirr

const selectedMethod = PAYMENT_METHODS.find(m => m.id === "alga_pay");
// { name: "Alga Pay", description: "Secure payment..." }
```

## Migration Guide

### For Existing Code

**Old Approach** (Exposed processors):
```tsx
import ChapaCheckout from "@/components/chapa-checkout";
<ChapaCheckout ... />
```

**New Approach** (White-labeled):
```tsx
import AlgaPayCheckout from "@/components/alga-pay-checkout";
<AlgaPayCheckout method="chapa" ... />
```

### Search & Replace

To update existing references:

```bash
# Help pages
"via Chapa" → "via Alga Pay"
"(Stripe)" → "(Alga Pay)"

# Components
ChapaCheckout → AlgaPayCheckout (with method="chapa")
StripeCheckout → AlgaPayCheckout (with method="stripe")

# Constants
"Chapa" → "Alga Pay"
"Credit/Debit Card" → "Alga Pay (International)"
```

## Security Considerations

### What Users See
✅ "Alga Pay" branding only
✅ Secure checkout URL
✅ Generic success messages
✅ No processor logos/names

### What's Hidden
🔒 CHAPA_SECRET_KEY (backend only)
🔒 STRIPE_SECRET_KEY (backend only)
🔒 Processor API endpoints
🔒 Webhook signatures
🔒 Transaction routing logic

### Benefits
- **User Trust**: Single payment brand to trust
- **Security**: Payment credentials never exposed to frontend
- **Control**: Can switch processors without user notification
- **Branding**: Strengthens Alga's market position

## Testing

### Test Flow
1. User selects "Alga Pay" at checkout
2. Component calls `/api/alga-pay` with method
3. Backend routes to Chapa (Ethiopian) or Stripe (International)
4. User completes payment on processor page
5. Callback confirms payment
6. User sees "Payment Successful via Alga Pay"

### Test Cases
- [ ] Ethiopian payment via Chapa (hidden)
- [ ] International payment via Stripe (hidden)
- [ ] Payment callback updates booking
- [ ] Error handling shows generic "Alga Pay" messages
- [ ] Help pages mention only "Alga Pay"

## Maintenance

### Adding New Processor
1. Add credentials to environment variables
2. Update `server/algaPay.ts` to support new method
3. Update callback handler if needed
4. **No frontend changes needed** - still shows "Alga Pay"

### Monitoring
- Check `/api/payment-callback` logs for confirmation
- Monitor booking status changes
- Track success/failure rates by method

## Troubleshooting

### "Payment service temporarily unavailable"
- Check CHAPA_SECRET_KEY is set
- Check STRIPE_SECRET_KEY is set
- Verify secrets don't have extra spaces

### Callback not working
- Verify BASE_URL is correct
- Check processor webhook configuration
- Review server logs for callback errors

### Frontend shows processor name
- Search codebase for "Chapa" or "Stripe"
- Replace with "Alga Pay"
- Update help documentation

## Future Enhancements

### Planned Features
- [ ] Support for PayPal as third processor
- [ ] Multi-currency conversion within Alga Pay
- [ ] Alga Pay wallet for repeat customers
- [ ] One-click checkout for returning users
- [ ] Installment payment plans

### Scaling Considerations
- Add caching for payment status checks
- Implement retry logic for webhook failures
- Add analytics for processor performance
- Consider custom payment page (fully branded)

## Summary

Alga Pay successfully abstracts payment processing behind a unified, white-labeled interface. Users interact only with the "Alga Pay" brand, while the platform maintains flexibility to route payments through multiple processors based on business needs.

**Key Achievement**: Zero user-facing references to third-party payment processors across the entire platform.
