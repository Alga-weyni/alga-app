# Payment Integration Setup - Ethiopia Stays

## Overview
Ethiopia Stays now supports two payment methods:
1. **Telebirr** - Ethiopian mobile money payment system
2. **PayPal** - International payment gateway for global travelers

## Required Environment Variables

Add these environment variables to your Replit Secrets or `.env` file:

### Telebirr Payment
```
TELEBIRR_APP_ID=your_telebirr_app_id
TELEBIRR_API_KEY=your_telebirr_api_key
```

### PayPal Payment
```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

### Base URL
```
BASE_URL=https://your-replit-domain.repl.co
```
(Replace with your actual Replit domain or custom domain)

---

## How to Get API Credentials

### Telebirr Setup
1. Visit Telebirr Developer Portal: https://developer.telebirr.com
2. Create a developer account
3. Register your application
4. Get your APP_ID and API_KEY from the dashboard
5. Set up webhook URL: `https://your-domain/api/payment/confirm/telebirr`

### PayPal Setup
1. Visit PayPal Developer Portal: https://developer.paypal.com
2. Log in with your PayPal account
3. Go to "My Apps & Credentials"
4. **For Testing (Sandbox)**:
   - Create a Sandbox Business Account
   - Create a REST API app
   - Copy the Client ID and Secret from Sandbox credentials
5. **For Production**:
   - Switch to "Live" mode
   - Create a Live REST API app
   - Copy the Live Client ID and Secret
   - Configure return URLs:
     - Return URL: `https://your-domain/booking/success`
     - Cancel URL: `https://your-domain/booking/cancelled`

---

## API Endpoints

### Telebirr Payment Endpoints

#### Initiate Payment
```
POST /api/payment/telebirr
```
**Request Body:**
```json
{
  "bookingId": 123,
  "amount": "2500.00",
  "customerPhone": "+251912345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telebirr transaction initiated.",
  "redirectUrl": "https://checkout.telebirr.com/..."
}
```

#### Confirmation Callback (Webhook)
```
POST /api/payment/confirm/telebirr
```
Automatically called by Telebirr after payment completion.

---

### PayPal Payment Endpoints

#### Initiate Payment
```
POST /api/payment/paypal
```
**Request Body:**
```json
{
  "bookingId": 123,
  "amount": "50.00"
}
```

**Response:**
```json
{
  "success": true,
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "orderId": "PAYPAL123456"
}
```

#### Confirm Payment
```
POST /api/payment/confirm/paypal
```
**Request Body:**
```json
{
  "bookingId": 123,
  "orderId": "PAYPAL123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed"
}
```

---

## Frontend Integration Example

### Telebirr Payment
```javascript
const initiateTelebirrPayment = async (bookingId, amount, phoneNumber) => {
  try {
    const response = await fetch('/api/payment/telebirr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        amount,
        customerPhone: phoneNumber
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect user to Telebirr checkout
      window.location.href = data.redirectUrl;
    }
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};
```

### PayPal Payment
```javascript
const initiatePayPalPayment = async (bookingId, amount) => {
  try {
    const response = await fetch('/api/payment/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect user to PayPal checkout
      window.location.href = data.approvalUrl;
    }
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};

// After user approves payment on PayPal and returns to your site
const confirmPayPalPayment = async (bookingId, orderId) => {
  try {
    const response = await fetch('/api/payment/confirm/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, orderId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      console.log('Payment confirmed!');
    }
  } catch (error) {
    console.error('Payment confirmation failed:', error);
  }
};
```

---

## Payment Flow

### Telebirr Flow:
1. User selects Telebirr payment method
2. Frontend calls `/api/payment/telebirr` with booking details
3. Backend initiates payment with Telebirr
4. User is redirected to Telebirr checkout page
5. User completes payment on their phone
6. Telebirr calls webhook `/api/payment/confirm/telebirr`
7. Booking status updated to "confirmed" and payment status to "paid"

### PayPal Flow:
1. User selects PayPal payment method
2. Frontend calls `/api/payment/paypal` with booking details
3. Backend creates PayPal order
4. User is redirected to PayPal checkout
5. User logs in and approves payment
6. User returns to success page with order ID
7. Frontend calls `/api/payment/confirm/paypal` with order ID
8. Backend captures payment and updates booking

---

## Database Schema Updates

The `bookings` table now includes:
- `payment_ref` (VARCHAR) - Stores transaction ID from payment provider
- `payment_method` (VARCHAR) - "telebirr" or "paypal"
- `payment_status` (VARCHAR) - "pending", "paid", "failed", "refunded"
- `status` (VARCHAR) - "pending", "confirmed", "cancelled", "completed"

---

## Testing

### Telebirr Testing
- Use Telebirr sandbox environment for testing
- Test phone number: Provided by Telebirr developer portal
- Test amounts: Any amount in sandbox mode

### PayPal Testing
- Use PayPal Sandbox mode
- Test buyer accounts: Create in PayPal Developer Dashboard
- Test credit cards: Provided by PayPal (no real money charged)
- PayPal Sandbox Test Card: 4032039574128449 (Visa)

---

## Security Notes

1. **Never expose API secrets in frontend code**
2. **All payment routes are protected with authentication** (`isAuthenticated` middleware)
3. **Use HTTPS in production** (SSL/TLS required for payment processing)
4. **Validate webhook signatures** (Telebirr provides signature verification)
5. **Store transaction IDs** for reconciliation and support
6. **Log all payment activities** for audit trail

---

## Production Checklist

Before going live with payments:

- [ ] Add all environment variables to Replit Secrets
- [ ] Switch PayPal from Sandbox to Live credentials
- [ ] Configure Telebirr production API keys
- [ ] Set correct BASE_URL for your domain
- [ ] Test payment flows end-to-end
- [ ] Set up webhook URLs in payment provider dashboards
- [ ] Enable SSL/HTTPS on your domain
- [ ] Configure error logging and monitoring
- [ ] Set up payment reconciliation process
- [ ] Prepare customer support for payment issues

---

## Support

For payment integration issues:
- **Telebirr**: support@telebirr.com
- **PayPal**: https://developer.paypal.com/support/

---

## Next Steps

1. Add payment selection UI in booking flow
2. Create success/failure pages for payment completion
3. Implement payment history for users
4. Add email notifications for payment confirmations
5. Build admin dashboard for payment monitoring

---

**Status:** ✅ Payment integration complete and ready to configure
**Last Updated:** October 17, 2025
