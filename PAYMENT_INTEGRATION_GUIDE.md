# Ethiopia Stays - Payment Integration Guide

## 🚀 Complete Payment Setup Instructions

Your Ethiopia Stays platform now supports **three global payment systems**:
- 💳 **Stripe** - Global credit/debit cards (Visa, Mastercard, Alipay, CNY, USD, EUR)
- 📱 **Telebirr** - Ethiopian mobile money (ETB)
- 💳 **PayPal** - International payments (USD)

---

## 📋 Quick Setup Checklist

### Step 1: Add Stripe Credentials
1. Go to https://dashboard.stripe.com (create free account)
2. Navigate to **Developers** → **API keys**
3. Copy your keys and add to Replit Secrets:

```
STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)
VITE_STRIPE_PUBLIC_KEY = pk_test_... (or pk_live_...)
```

4. Set up webhook:
   - Go to **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev/api/payment/webhook/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy signing secret and add to Replit:

```
STRIPE_WEBHOOK_SECRET = whsec_...
```

### Step 2: Add Telebirr Credentials (Optional)
1. Go to https://developer.telebirr.com
2. Register your app and get credentials
3. Add to Replit Secrets:

```
TELEBIRR_APP_ID = your_app_id
TELEBIRR_API_KEY = your_api_key
```

### Step 3: Add PayPal Credentials (Optional)
1. Go to https://developer.paypal.com
2. Create an app in sandbox or live mode
3. Add to Replit Secrets:

```
PAYPAL_CLIENT_ID = your_client_id
PAYPAL_SECRET = your_secret_key
```

### Step 4: Set Base URL
```
BASE_URL = https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev
```

---

## 🧪 Testing Your Payment Integration

### Test Stripe (Credit Cards)
```bash
curl -X POST "https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev/api/payment/stripe" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":9,"amount":24,"currency":"usd"}'
```

**Expected Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Test Telebirr (Ethiopian Mobile Money)
```bash
curl -X POST "https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev/api/payment/telebirr" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":9,"amount":1200,"customerPhone":"+251911234567"}'
```

### Test PayPal (International)
```bash
curl -X POST "https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev/api/payment/paypal" \
  -H "Content-Type: application/json" \
  -d '{"bookingId":9,"amount":24}'
```

### Check Server Health
```bash
curl https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T02:23:59.605Z",
  "server": "Ethiopia Stays API",
  "version": "1.0.0",
  "payments": {
    "stripe": true,
    "telebirr": true,
    "paypal": true
  }
}
```

---

## 💳 Supported Payment Methods

### Stripe - Global Payments
- **Currencies**: USD, CNY, EUR, GBP, ETB + 130 more
- **Cards**: Visa, Mastercard, American Express, Discover
- **Digital Wallets**: Apple Pay, Google Pay
- **Asian Methods**: Alipay, WeChat Pay
- **Bank Transfers**: ACH, SEPA, and more

### Telebirr - Ethiopian Mobile Money
- **Currency**: ETB (Ethiopian Birr)
- **Method**: Mobile money via Ethio Telecom

### PayPal - International Payments
- **Currency**: USD (converted from ETB at ~50:1 ratio)
- **Methods**: PayPal balance, credit/debit cards

---

## 🔐 Security Features

✅ **PCI Compliance**: Stripe handles card data (never touches your server)  
✅ **Webhook Verification**: All payment confirmations verified with signatures  
✅ **HTTPS Only**: All payment endpoints require secure connections  
✅ **Session Authentication**: Users must be logged in to make bookings  
✅ **Transaction Tracking**: Every payment has a unique reference ID  

---

## 📡 API Endpoints

### Payment Endpoints
- `POST /api/payment/stripe` - Create Stripe payment
- `POST /api/payment/webhook/stripe` - Stripe webhook handler
- `POST /api/payment/telebirr` - Initiate Telebirr payment
- `POST /api/payment/paypal` - Create PayPal order
- `POST /api/payment/confirm/paypal` - Confirm PayPal payment

### Status Endpoints
- `GET /api/health` - Server health check
- `GET /api/auth/user` - Current user session
- `GET /api/bookings` - User bookings
- `GET /api/properties` - Property listings

---

## 🎨 Frontend Payment Flow

1. **Guest selects property** → Chooses dates and guests
2. **Clicks "Book Now"** → Booking dialog opens
3. **Selects payment method**:
   - Credit/Debit Card (Stripe) - Opens secure modal
   - Telebirr - Redirects to mobile money gateway
   - PayPal - Redirects to PayPal checkout
4. **Completes payment** → Automatic confirmation
5. **Redirects to success page** → Booking confirmed

---

## 🌍 Multi-Currency Support

### Currency Conversion
- **ETB to USD**: ~50:1 ratio (for PayPal)
- **ETB to CNY**: Stripe handles automatically
- **Native ETB**: Telebirr (no conversion needed)

### Recommended Payment Methods by User Location
- **Ethiopian users**: Telebirr (local, instant)
- **Chinese users**: Stripe with CNY + Alipay/WeChat Pay
- **US/EU users**: Stripe with USD/EUR + Cards
- **Global users**: PayPal (widely accepted)

---

## 🚨 Troubleshooting

### Payment appears but says "not configured"
**Solution**: Add API keys to Replit Secrets (Tools → Secrets)

### Webhook not receiving events
**Solution**: Verify webhook URL in Stripe dashboard matches exactly:
```
https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev/api/payment/webhook/stripe
```

### Test mode vs Live mode
- **Test keys** start with `sk_test_` and `pk_test_`
- **Live keys** start with `sk_live_` and `pk_live_`
- Never mix test and live keys

### Booking created but payment fails
- Check browser console for errors
- Verify user is authenticated
- Check server logs for payment API errors
- Ensure correct currency format (lowercase: "usd" not "USD")

---

## 📦 Installed Packages

```json
{
  "stripe": "^latest",
  "@stripe/stripe-js": "^latest",
  "@stripe/react-stripe-js": "^latest",
  "@paypal/paypal-server-sdk": "^latest"
}
```

---

## 🎯 Production Deployment Checklist

- [ ] Replace test API keys with live keys
- [ ] Update webhook URLs to production domain
- [ ] Test each payment method end-to-end
- [ ] Set up monitoring (UptimeRobot, etc.)
- [ ] Configure email notifications for bookings
- [ ] Add payment receipts/invoices
- [ ] Set up automatic backup system
- [ ] Configure SSL certificate (Replit handles this)
- [ ] Test mobile responsiveness
- [ ] Review transaction fees with each provider

---

## 💰 Transaction Fees (Typical)

### Stripe
- 2.9% + $0.30 per successful card charge (US)
- 3.4% + $0.30 for international cards
- No monthly fees

### Telebirr
- Check with Ethio Telecom for current rates
- Typically 1-2% for merchants

### PayPal
- 2.9% + $0.30 per transaction (US)
- 4.4% + fixed fee for international
- No monthly fees

---

## 📞 Support Resources

- **Stripe**: https://support.stripe.com
- **Telebirr**: developer.telebirr.com
- **PayPal**: https://developer.paypal.com/support

---

## ✅ You're All Set!

Your Ethiopia Stays platform is now ready to accept payments from guests worldwide. Once you add the API credentials, bookings will be processed automatically with real-time confirmations.

**Live URL**: https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev

---

*Last Updated: October 18, 2025*
